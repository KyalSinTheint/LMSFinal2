-- ====================================================================
-- KBZLIFE LMS: COMPLETE MASTER DATABASE SCHEMA & SECURE RBAC
-- File: 20261028_master_setup_all_in_one.sql
-- Description: Hardened, production-grade, idempotent master migration script.
--
-- Security Enhancements & Verification in this Edition:
--   1. bootstrap_first_super_admin():
--      - Explicitly revoked from PUBLIC, anon, and authenticated.
--      - Granted exclusively to service_role and postgres.
--      - Protected by an exclusive transaction advisory lock against race conditions.
--      - Permanently locks itself if any active Super Admin already exists.
--   2. Non-recursive Profiles RLS & Role Separation:
--      - Helper functions (get_user_role, is_admin, is_super_admin, is_account_active)
--        are SECURITY DEFINER with search_path = public to eliminate recursion.
--      - Normal users cannot alter their own role or account_status (USING + WITH CHECK).
--      - Regular admins can only review/approve standard users (role = 'user'),
--        and are strictly forbidden from promoting anyone to admin or super_admin.
--      - Super Admin has full governance over all profiles and roles.
--   3. Concurrency-Safe 20 Active Admin Cap & Last Super Admin Protection:
--      - Employs pg_advisory_xact_lock to prevent simultaneous race promotions.
--      - Blocks any demotion, deactivation, or deletion of the last remaining active Super Admin.
--   4. Unpublished Content Protection across all LMS modules:
--      - Courses, Channels, News, Videos, License Chapters/Lessons/Quizzes,
--        Skill Resources/Quizzes, Products, and Bulletins require published status
--        and an active/approved account for regular users.
--      - Admins can view and manage both draft and published materials.
--   5. Server-Side Quiz Grading & Anti-Tampering:
--      - Trusted submit_license_quiz_attempt() RPC evaluates answers server-side.
--      - Triggers guard against client score forgery and enforce attempt immutability.
--   6. Private Supabase Storage Protection:
--      - Buckets for company-bulletins and training-materials are strictly private (public = false).
--      - File access is guarded by RLS requiring active account status.
--      - Write/delete access is restricted to authorized administrators.
--   7. Clean Asset Referencing:
--      - Relative asset paths clearly mapped to repository assets with documentation.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 2. PROFILES TABLE & CORE CONSTRAINTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user',
    account_status TEXT NOT NULL DEFAULT 'pending',
    employee_id TEXT,
    department TEXT DEFAULT 'KBZLife Insurance Operations',
    avatar_url TEXT,
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_sign_in_at TIMESTAMPTZ
);

-- Ensure Constraints
DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
        CHECK (role IN ('super_admin', 'admin', 'user'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_account_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_status_check
        CHECK (account_status IN ('active', 'approved', 'pending', 'rejected', 'suspended', 'inactive'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(LOWER(email));

-- --------------------------------------------------------------------
-- 3. RBAC SECURITY HELPER FUNCTIONS (SECURITY DEFINER, NO RLS RECURSION)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role(lookup_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = lookup_user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_account_status(lookup_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_status FROM public.profiles WHERE id = lookup_user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(lookup_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = lookup_user_id
      AND role IN ('super_admin', 'admin')
      AND account_status IN ('active', 'approved')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(lookup_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = lookup_user_id
      AND role = 'super_admin'
      AND account_status IN ('active', 'approved')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_account_active(lookup_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = lookup_user_id
      AND account_status IN ('active', 'approved')
  );
$$;

-- Grant execution of basic lookups to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_account_status(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_account_active(UUID) TO authenticated, service_role;

-- --------------------------------------------------------------------
-- 4. CONCURRENCY-SAFE 20 ADMIN LIMIT & LAST SUPER ADMIN DEFENSE
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_admin_account_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_count INTEGER;
  v_super_admin_count INTEGER;
BEGIN
  -- Concurrency defense: lock an application-level advisory lock when mutating admin accounts
  IF (NEW.role IN ('admin', 'super_admin') AND NEW.account_status IN ('active', 'approved'))
     OR (TG_OP = 'UPDATE' AND OLD.role = 'super_admin') THEN
    PERFORM pg_advisory_xact_lock(hashtext('kbzlife_admin_limit_lock'));
  END IF;

  -- 1. Enforce Maximum 20 Active Admin Accounts
  IF (NEW.role IN ('admin', 'super_admin') AND NEW.account_status IN ('active', 'approved')) THEN
    -- If this is an UPDATE and the record was ALREADY an active admin/super_admin, no new slot is consumed
    IF NOT (TG_OP = 'UPDATE' AND OLD.role IN ('admin', 'super_admin') AND OLD.account_status IN ('active', 'approved')) THEN
      SELECT COUNT(*) INTO v_admin_count
      FROM public.profiles
      WHERE role IN ('admin', 'super_admin')
        AND account_status IN ('active', 'approved');

      IF v_admin_count >= 20 THEN
        RAISE EXCEPTION 'Maximum limit of 20 active administrator accounts has been reached. Cannot promote or activate additional administrator accounts.';
      END IF;
    END IF;
  END IF;

  -- 2. Prevent Demotion or Deactivation of the Last Active Super Admin
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.role = 'super_admin' AND OLD.account_status IN ('active', 'approved')) THEN
      IF (NEW.role <> 'super_admin' OR NEW.account_status NOT IN ('active', 'approved')) THEN
        SELECT COUNT(*) INTO v_super_admin_count
        FROM public.profiles
        WHERE role = 'super_admin'
          AND account_status IN ('active', 'approved')
          AND id <> OLD.id;

        IF v_super_admin_count = 0 THEN
          RAISE EXCEPTION 'Security Violation: Cannot demote or deactivate the last remaining active Super Admin.';
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_admin_limits ON public.profiles;
CREATE TRIGGER trigger_enforce_admin_limits
  BEFORE INSERT OR UPDATE OF role, account_status ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.check_admin_account_limit();

CREATE OR REPLACE FUNCTION public.prevent_last_super_admin_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_super_admin_count INTEGER;
BEGIN
  IF (OLD.role = 'super_admin' AND OLD.account_status IN ('active', 'approved')) THEN
    PERFORM pg_advisory_xact_lock(hashtext('kbzlife_admin_limit_lock'));

    SELECT COUNT(*) INTO v_super_admin_count
    FROM public.profiles
    WHERE role = 'super_admin'
      AND account_status IN ('active', 'approved')
      AND id <> OLD.id;

    IF v_super_admin_count = 0 THEN
      RAISE EXCEPTION 'Security Violation: Cannot delete the last remaining active Super Admin account.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_super_admin_delete ON public.profiles;
CREATE TRIGGER trigger_prevent_super_admin_delete
  BEFORE DELETE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_last_super_admin_delete();

-- --------------------------------------------------------------------
-- 5. SECURE FIRST SUPER ADMIN BOOTSTRAP FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_first_super_admin(target_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_normalized_email TEXT;
  v_existing_super_admins INTEGER;
  v_auth_user RECORD;
  v_target_profile public.profiles%ROWTYPE;
BEGIN
  -- Strict concurrency defense: serialize bootstrap attempts
  PERFORM pg_advisory_xact_lock(hashtext('kbzlife_bootstrap_super_admin_lock'));

  -- Normalize and validate target email
  v_normalized_email := LOWER(TRIM(COALESCE(target_email, '')));
  IF v_normalized_email = '' OR v_normalized_email NOT LIKE '%_@__%.__%' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'INVALID_EMAIL',
      'message', 'Please provide a valid, well-formed email address.'
    );
  END IF;

  -- Check if any active/approved super admin already exists
  SELECT COUNT(*) INTO v_existing_super_admins
  FROM public.profiles
  WHERE role = 'super_admin' AND account_status IN ('active', 'approved');

  IF v_existing_super_admins > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'BOOTSTRAP_LOCKED',
      'message', 'A Super Admin is already configured and active. Initial bootstrap is permanently locked.'
    );
  END IF;

  -- Look up target user in auth.users
  SELECT id, email, raw_user_meta_data INTO v_auth_user
  FROM auth.users
  WHERE LOWER(email) = v_normalized_email
  LIMIT 1;

  IF v_auth_user.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_code', 'AUTH_USER_NOT_FOUND',
      'message', 'No registered authentication account found for ' || v_normalized_email || '. Please register the account in Supabase Auth first.'
    );
  END IF;

  -- Upsert profile record with privileged Super Admin role
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    role,
    account_status,
    department,
    employee_id,
    created_at,
    updated_at
  )
  VALUES (
    v_auth_user.id,
    v_normalized_email,
    COALESCE(v_auth_user.raw_user_meta_data->>'full_name', split_part(v_normalized_email, '@', 1)),
    COALESCE(v_auth_user.raw_user_meta_data->>'username', split_part(v_normalized_email, '@', 1)),
    'super_admin',
    'active',
    'Executive Leadership & Governance',
    'KBZ-SA-001',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    account_status = 'active',
    updated_at = timezone('utc'::text, now())
  RETURNING * INTO v_target_profile;

  -- Record audit log entry if table exists
  BEGIN
    INSERT INTO public.admin_audit_logs (
      id,
      admin_user_id,
      admin_name,
      target_user_id,
      target_user_name,
      action,
      entity_type,
      entity_id,
      details,
      created_at
    ) VALUES (
      'log_' || substr(md5(random()::text), 1, 8),
      v_target_profile.id,
      v_target_profile.full_name,
      v_target_profile.id,
      v_target_profile.full_name,
      'BOOTSTRAP_FIRST_SUPER_ADMIN',
      'PROFILE',
      v_target_profile.id::text,
      'Initial system bootstrap: elevated ' || v_normalized_email || ' to Super Admin.',
      timezone('utc'::text, now())
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully initialized ' || v_normalized_email || ' as the first Super Admin.',
    'userId', v_target_profile.id
  );
END;
$$;

-- REVOKE EXECUTE FROM UNTRUSTED ROLES (PUBLIC, anon, authenticated)
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_super_admin(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_super_admin(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_super_admin(TEXT) FROM authenticated;

-- GRANT EXECUTE EXCLUSIVELY TO TRUSTED DB ADMINISTRATOR ROLES
GRANT EXECUTE ON FUNCTION public.bootstrap_first_super_admin(TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_super_admin(TEXT) TO service_role;

-- --------------------------------------------------------------------
-- 6. AUTH REGISTRATION HOOK TRIGGER (ENFORCES PENDING & USER ROLE)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- CRITICAL SECURITY RULE: Public registration can NEVER self-grant privileged roles.
  -- Force role = 'user' and account_status = 'pending'
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    email,
    role,
    account_status,
    department,
    employee_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user',
    'pending',
    COALESCE(NEW.raw_user_meta_data->>'department', 'KBZLife Operations'),
    COALESCE(NEW.raw_user_meta_data->>'employee_id', 'KBZ-EMP-' || substr(md5(random()::text), 1, 4)),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- Trigger defense: protect against client role tampering even if RLS is bypassed
CREATE OR REPLACE FUNCTION public.guard_profile_role_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_caller UUID := auth.uid();
BEGIN
  -- When executed via service_role or DB migrations (no auth.uid()), allow
  IF v_caller IS NULL THEN
    RETURN NEW;
  END IF;

  -- 1. Check Role Change: ONLY Super Admin can alter user roles
  IF (NEW.role IS DISTINCT FROM OLD.role) THEN
    IF NOT public.is_super_admin(v_caller) THEN
      RAISE EXCEPTION 'Permission Denied: Only the Super Admin is authorized to grant, promote, or alter user roles.';
    END IF;
  END IF;

  -- 2. Check Account Status Change: Regular users cannot change their own account status
  IF (NEW.account_status IS DISTINCT FROM OLD.account_status) THEN
    IF NOT public.is_admin(v_caller) THEN
      RAISE EXCEPTION 'Permission Denied: Only administrators are authorized to alter account approval status.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_guard_profile_role_changes ON public.profiles;
CREATE TRIGGER trigger_guard_profile_role_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.guard_profile_role_changes();

-- --------------------------------------------------------------------
-- 7. CORE LMS TABLES (Courses, Channels, Enrollments, Progress, Audit)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Core Curriculum',
    published BOOLEAN NOT NULL DEFAULT true,
    duration_hours NUMERIC(4,1) DEFAULT 4.5,
    modules_count INTEGER DEFAULT 6,
    learning_outcomes TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 1,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    key_highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('enrolled', 'completed', 'revoked')) DEFAULT 'enrolled',
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    restriction_note TEXT,
    CONSTRAINT unique_user_course_enrollment UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.channel_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('granted', 'revoked')) DEFAULT 'granted',
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    restriction_note TEXT,
    CONSTRAINT unique_user_channel_access UNIQUE(user_id, channel_id)
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    lesson_id TEXT,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completion_status TEXT NOT NULL CHECK (completion_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    last_accessed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('log_' || substr(md5(random()::text), 1, 8)),
    admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_name TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- --------------------------------------------------------------------
-- 8. NEWS, VIDEOS, TOP PERFORMERS, TEAM & MOTTO
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    cover_image_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Corporate Milestone',
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT DEFAULT 'Internal Communications Desk',
    read_time_minutes INTEGER DEFAULT 3,
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.company_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT NOT NULL DEFAULT 'Leadership Address',
    display_order INTEGER NOT NULL DEFAULT 1,
    duration TEXT DEFAULT '12:45',
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.top_performers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    month_year TEXT NOT NULL,
    sales_volume TEXT NOT NULL,
    policies_count INTEGER NOT NULL,
    avatar_url TEXT,
    achievement_highlight TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.hod_motto (
    id TEXT PRIMARY KEY DEFAULT 'hod_motto_singleton',
    hod_name TEXT NOT NULL,
    hod_title TEXT NOT NULL,
    motto_quote TEXT NOT NULL,
    motto_body TEXT NOT NULL,
    avatar_url TEXT,
    signature_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ld_team_members (
    id TEXT PRIMARY KEY DEFAULT ('tm_' || substr(md5(random()::text), 1, 8)),
    full_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    avatar_url TEXT,
    specialization TEXT NOT NULL,
    bio TEXT NOT NULL,
    email TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- --------------------------------------------------------------------
-- 9. LICENSE TRAINING (Chapters, Lessons, Quizzes, Questions, Attempts)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.license_chapters (
    id TEXT PRIMARY KEY DEFAULT ('lic_ch_' || substr(md5(random()::text), 1, 8)),
    title TEXT NOT NULL,
    chapter_number INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    summary TEXT,
    estimated_minutes INTEGER NOT NULL DEFAULT 60,
    passing_score INTEGER NOT NULL DEFAULT 80,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.license_training_lessons (
    id TEXT PRIMARY KEY DEFAULT ('lic_lesson_' || substr(md5(random()::text), 1, 8)),
    chapter_id TEXT REFERENCES public.license_chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'pdf', 'link')) DEFAULT 'video',
    lesson_type TEXT DEFAULT 'video',
    file_url TEXT,
    content_url TEXT,
    thumbnail_url TEXT,
    duration TEXT DEFAULT '15:00',
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.license_quizzes (
    id TEXT PRIMARY KEY DEFAULT ('lic_quiz_' || substr(md5(random()::text), 1, 8)),
    chapter_id TEXT REFERENCES public.license_chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 80,
    time_limit_minutes INTEGER NOT NULL DEFAULT 20,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.license_quiz_questions (
    id TEXT PRIMARY KEY DEFAULT ('lqq_' || substr(md5(random()::text), 1, 8)),
    quiz_id TEXT NOT NULL REFERENCES public.license_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_option_index INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.license_quiz_attempts (
    id TEXT PRIMARY KEY DEFAULT ('lqa_' || substr(md5(random()::text), 1, 8)),
    quiz_id TEXT NOT NULL,
    chapter_id TEXT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT false,
    answers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- --------------------------------------------------------------------
-- 10. SKILL DEVELOPMENT (Categories, Resources, Quizzes, Attempts)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id TEXT PRIMARY KEY DEFAULT ('sk_cat_' || substr(md5(random()::text), 1, 8)),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Award',
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.skill_development_resources (
    id TEXT PRIMARY KEY DEFAULT ('sk_res_' || substr(md5(random()::text), 1, 8)),
    category_id TEXT REFERENCES public.skill_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'pdf', 'link')) DEFAULT 'video',
    resource_type TEXT DEFAULT 'video',
    content_url TEXT NOT NULL,
    file_url TEXT,
    thumbnail_url TEXT NOT NULL,
    duration TEXT DEFAULT '20:00',
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Idempotent column check for existing databases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'skill_development_resources' 
      AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.skill_development_resources ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.skill_quizzes (
    id TEXT PRIMARY KEY DEFAULT ('sk_quiz_' || substr(md5(random()::text), 1, 8)),
    category_id TEXT REFERENCES public.skill_categories(id) ON DELETE CASCADE,
    resource_id TEXT REFERENCES public.skill_development_resources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 80,
    is_published BOOLEAN NOT NULL DEFAULT true,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.skill_quiz_attempts (
    id TEXT PRIMARY KEY DEFAULT ('sqa_' || substr(md5(random()::text), 1, 8)),
    quiz_id TEXT NOT NULL,
    category_id TEXT,
    resource_id TEXT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT false,
    answers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- --------------------------------------------------------------------
-- 11. PRODUCT KNOWLEDGE HUB (Items, Quizzes, Attempts)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_knowledge_items (
    id TEXT PRIMARY KEY DEFAULT ('prod_' || substr(md5(random()::text), 1, 8)),
    title TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL DEFAULT 'Individual Life',
    description TEXT NOT NULL,
    brochure_url TEXT,
    proposal_form_url TEXT,
    policy_wording_url TEXT,
    thumbnail_url TEXT NOT NULL,
    key_features TEXT[] DEFAULT ARRAY[]::TEXT[],
    benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    eligibility_criteria TEXT,
    faqs JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_quizzes (
    id TEXT PRIMARY KEY DEFAULT ('pq_' || substr(md5(random()::text), 1, 8)),
    product_id TEXT NOT NULL REFERENCES public.product_knowledge_items(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 80,
    is_published BOOLEAN NOT NULL DEFAULT true,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_quiz_attempts (
    id TEXT PRIMARY KEY DEFAULT ('pqa_' || substr(md5(random()::text), 1, 8)),
    quiz_id TEXT NOT NULL,
    product_id TEXT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT false,
    answers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- --------------------------------------------------------------------
-- 12. COMPANY BULLETINS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_bulletins (
    id TEXT PRIMARY KEY DEFAULT ('bulletin_' || substr(md5(random()::text), 1, 8)),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Announcement',
    pdf_url TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT DEFAULT 0,
    formatted_file_size TEXT,
    published BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT DEFAULT 'KBZLife Administration',
    department TEXT DEFAULT 'Corporate Communications',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    reference_no TEXT,
    priority TEXT NOT NULL DEFAULT 'normal',
    verified BOOLEAN NOT NULL DEFAULT true,
    color_theme TEXT NOT NULL DEFAULT 'blue_orange'
);

-- --------------------------------------------------------------------
-- 13. TRUSTED SERVER-SIDE QUIZ EVALUATION & SCORING WORKFLOW
-- --------------------------------------------------------------------
-- Server-side RPC to evaluate license quiz attempts safely without allowing client score tampering
CREATE OR REPLACE FUNCTION public.submit_license_quiz_attempt(
  p_quiz_id TEXT,
  p_answers JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_quiz public.license_quizzes%ROWTYPE;
  v_total_questions INTEGER := 0;
  v_correct_count INTEGER := 0;
  v_calculated_percentage INTEGER := 0;
  v_is_passed BOOLEAN := false;
  v_q RECORD;
  v_selected_opt INTEGER;
  v_attempt_id TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id;
  IF v_profile.account_status NOT IN ('active', 'approved') THEN
    RAISE EXCEPTION 'Your account is pending administrator approval or is inactive.';
  END IF;

  SELECT * INTO v_quiz FROM public.license_quizzes WHERE id = p_quiz_id AND is_published = true;
  IF v_quiz.id IS NULL THEN
    RAISE EXCEPTION 'Quiz not found or is currently unpublished.';
  END IF;

  -- Verify questions and compute score strictly on database
  FOR v_q IN
    SELECT id, correct_option_index
    FROM public.license_quiz_questions
    WHERE quiz_id = p_quiz_id
    ORDER BY display_order ASC
  LOOP
    v_total_questions := v_total_questions + 1;
    IF (p_answers->>v_q.id) IS NOT NULL THEN
      v_selected_opt := (p_answers->>v_q.id)::INTEGER;
      IF v_selected_opt = v_q.correct_option_index THEN
        v_correct_count := v_correct_count + 1;
      END IF;
    END IF;
  END LOOP;

  IF v_total_questions > 0 THEN
    v_calculated_percentage := ROUND((v_correct_count::numeric / v_total_questions::numeric) * 100);
  ELSE
    v_calculated_percentage := 0;
  END IF;

  v_is_passed := (v_calculated_percentage >= v_quiz.passing_score);
  v_attempt_id := 'lqa_' || substr(md5(random()::text), 1, 8);

  -- Insert verified attempt
  INSERT INTO public.license_quiz_attempts (
    id,
    quiz_id,
    chapter_id,
    user_id,
    user_name,
    user_email,
    score,
    total_questions,
    percentage,
    passed,
    answers,
    created_at
  ) VALUES (
    v_attempt_id,
    p_quiz_id,
    v_quiz.chapter_id,
    v_user_id,
    v_profile.full_name,
    v_profile.email,
    v_correct_count,
    v_total_questions,
    v_calculated_percentage,
    v_is_passed,
    p_answers,
    timezone('utc'::text, now())
  );

  -- Auto-update learning progress on passing
  IF v_is_passed THEN
    INSERT INTO public.learning_progress (
      user_id,
      course_id,
      lesson_id,
      progress_percentage,
      completion_status,
      completed_at,
      last_accessed_at,
      updated_at
    ) VALUES (
      v_user_id,
      NULL,
      'chapter_' || COALESCE(v_quiz.chapter_id, 'lic'),
      100,
      'completed',
      timezone('utc'::text, now()),
      timezone('utc'::text, now()),
      timezone('utc'::text, now())
    );
  END IF;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score', v_correct_count,
    'total_questions', v_total_questions,
    'percentage', v_calculated_percentage,
    'passed', v_is_passed,
    'passing_score', v_quiz.passing_score
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_license_quiz_attempt(TEXT, JSONB) TO authenticated, service_role;

-- Trigger defense: protect quiz attempt scoring if directly inserted via client
CREATE OR REPLACE FUNCTION public.guard_quiz_attempt_scoring()
RETURNS TRIGGER AS $$
DECLARE
  v_quiz public.license_quizzes%ROWTYPE;
  v_q RECORD;
  v_total INTEGER := 0;
  v_correct INTEGER := 0;
  v_computed_pct INTEGER := 0;
BEGIN
  -- Service role and DB administrators are trusted
  IF auth.uid() IS NULL OR public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Standard user cannot submit on behalf of other users
  NEW.user_id := auth.uid();

  -- Recalculate score server-side if quiz exists in license questions
  SELECT * INTO v_quiz FROM public.license_quizzes WHERE id = NEW.quiz_id;
  IF v_quiz.id IS NOT NULL THEN
    FOR v_q IN
      SELECT id, correct_option_index
      FROM public.license_quiz_questions
      WHERE quiz_id = NEW.quiz_id
    LOOP
      v_total := v_total + 1;
      IF (NEW.answers->>v_q.id) IS NOT NULL AND (NEW.answers->>v_q.id)::INTEGER = v_q.correct_option_index THEN
        v_correct := v_correct + 1;
      END IF;
    END LOOP;

    IF v_total > 0 THEN
      v_computed_pct := ROUND((v_correct::numeric / v_total::numeric) * 100);
      NEW.score := v_correct;
      NEW.total_questions := v_total;
      NEW.percentage := v_computed_pct;
      NEW.passed := (v_computed_pct >= v_quiz.passing_score);
    END IF;
  ELSE
    -- If questions are stored directly in JSON (skills / product quizzes), prevent impossible percentages
    IF NEW.score > NEW.total_questions OR NEW.percentage > 100 THEN
      RAISE EXCEPTION 'Invalid quiz score.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_guard_license_attempt_scoring ON public.license_quiz_attempts;
CREATE TRIGGER trigger_guard_license_attempt_scoring
  BEFORE INSERT ON public.license_quiz_attempts
  FOR EACH ROW EXECUTE PROCEDURE public.guard_quiz_attempt_scoring();

-- Prevent updates or tampering with completed quiz attempts
CREATE OR REPLACE FUNCTION public.prevent_quiz_attempt_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Security Violation: Quiz attempt records are immutable audit logs and cannot be altered.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_license_attempt_update ON public.license_quiz_attempts;
CREATE TRIGGER trigger_prevent_license_attempt_update
  BEFORE UPDATE ON public.license_quiz_attempts
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_quiz_attempt_tampering();

DROP TRIGGER IF EXISTS trigger_prevent_skill_attempt_update ON public.skill_quiz_attempts;
CREATE TRIGGER trigger_prevent_skill_attempt_update
  BEFORE UPDATE ON public.skill_quiz_attempts
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_quiz_attempt_tampering();

DROP TRIGGER IF EXISTS trigger_prevent_product_attempt_update ON public.product_quiz_attempts;
CREATE TRIGGER trigger_prevent_product_attempt_update
  BEFORE UPDATE ON public.product_quiz_attempts
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_quiz_attempt_tampering();

-- Protect learning_progress against client spoofing
CREATE OR REPLACE FUNCTION public.guard_learning_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
    NEW.user_id := auth.uid();
    IF NEW.completion_status = 'completed' AND NEW.progress_percentage < 100 THEN
      NEW.progress_percentage := 100;
    END IF;
    IF NEW.progress_percentage = 100 AND NEW.completed_at IS NULL THEN
      NEW.completed_at := timezone('utc'::text, now());
      NEW.completion_status := 'completed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_guard_learning_progress ON public.learning_progress;
CREATE TRIGGER trigger_guard_learning_progress
  BEFORE INSERT OR UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE PROCEDURE public.guard_learning_progress();

-- --------------------------------------------------------------------
-- 14. SUPABASE STORAGE BUCKETS (Public & Private)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('profile-pictures', 'profile-pictures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('company-news', 'company-news', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('video-thumbnails', 'video-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('top-performers', 'top-performers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('company-bulletins', 'company-bulletins', false, 52428800, ARRAY['application/pdf']),
  ('training-materials', 'training-materials', false, 524288000, ARRAY['video/mp4', 'video/webm', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- --------------------------------------------------------------------
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hod_motto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ld_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_training_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_development_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_bulletins ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- PROFILES POLICIES (Zero Recursion, Distinct Admin & Super Admin Roles)
-- --------------------------------------------------------------------
-- 1. SELECT: Users read own profile; Active admins & super admins read all profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin(auth.uid())
  );

-- 2. UPDATE (User Self-Service): Users update their own details, but cannot alter role or account_status
DROP POLICY IF EXISTS "profiles_self_update_policy" ON public.profiles;
CREATE POLICY "profiles_self_update_policy" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = public.get_user_role(auth.uid())
    AND account_status = public.get_user_account_status(auth.uid())
  );

-- 3. UPDATE (Regular Admin Management):
-- Regular admins can only review/approve standard users (role = 'user')
-- They CANNOT edit other admins, super admins, or elevate any account to admin/super_admin.
DROP POLICY IF EXISTS "profiles_admin_update_policy" ON public.profiles;
CREATE POLICY "profiles_admin_update_policy" ON public.profiles
  FOR UPDATE
  USING (
    public.is_admin(auth.uid())
    AND NOT public.is_super_admin(auth.uid())
    AND public.get_user_role(id) = 'user'
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    AND NOT public.is_super_admin(auth.uid())
    AND role = 'user'
  );

-- 4. ALL (Super Admin Governance): Super Admin has full governance over all accounts
DROP POLICY IF EXISTS "profiles_super_admin_manage_policy" ON public.profiles;
CREATE POLICY "profiles_super_admin_manage_policy" ON public.profiles
  FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- --------------------------------------------------------------------
-- LMS MODULES: GENERAL READ POLICIES (ACTIVE USERS & PUBLISHED ONLY)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Active users view published courses" ON public.courses;
CREATE POLICY "Active users view published courses" ON public.courses
  FOR SELECT USING (published = true AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view published channels" ON public.channels;
CREATE POLICY "Active users view published channels" ON public.channels
  FOR SELECT USING (published = true AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view published news" ON public.company_news;
CREATE POLICY "Active users view published news" ON public.company_news
  FOR SELECT USING (status = 'published' AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view published videos" ON public.company_videos;
CREATE POLICY "Active users view published videos" ON public.company_videos
  FOR SELECT USING (status = 'published' AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view top performers" ON public.top_performers;
CREATE POLICY "Active users view top performers" ON public.top_performers
  FOR SELECT USING (public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view hod motto" ON public.hod_motto;
CREATE POLICY "Active users view hod motto" ON public.hod_motto
  FOR SELECT USING (public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view team members" ON public.ld_team_members;
CREATE POLICY "Active users view team members" ON public.ld_team_members
  FOR SELECT USING (public.is_account_active(auth.uid()));

-- License Training: lessons and quizzes require both chapter and item to be published
DROP POLICY IF EXISTS "Active users view published license chapters" ON public.license_chapters;
CREATE POLICY "Active users view published license chapters" ON public.license_chapters
  FOR SELECT USING (is_published = true AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view published license lessons" ON public.license_training_lessons;
CREATE POLICY "Active users view published license lessons" ON public.license_training_lessons
  FOR SELECT USING (
    is_published = true
    AND public.is_account_active(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.license_chapters c
      WHERE c.id = license_training_lessons.chapter_id AND c.is_published = true
    )
  );

DROP POLICY IF EXISTS "Active users view published license quizzes" ON public.license_quizzes;
CREATE POLICY "Active users view published license quizzes" ON public.license_quizzes
  FOR SELECT USING (
    is_published = true
    AND public.is_account_active(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.license_chapters c
      WHERE c.id = license_quizzes.chapter_id AND c.is_published = true
    )
  );

DROP POLICY IF EXISTS "Active users view published license questions" ON public.license_quiz_questions;
CREATE POLICY "Active users view published license questions" ON public.license_quiz_questions
  FOR SELECT USING (
    public.is_account_active(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.license_quizzes q
      JOIN public.license_chapters c ON c.id = q.chapter_id
      WHERE q.id = license_quiz_questions.quiz_id
        AND q.is_published = true
        AND c.is_published = true
    )
  );

-- Skill Development: resources and quizzes require published state
DROP POLICY IF EXISTS "Active users view published skill categories" ON public.skill_categories;
CREATE POLICY "Active users view published skill categories" ON public.skill_categories
  FOR SELECT USING (public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view published skill resources" ON public.skill_development_resources;
CREATE POLICY "Active users view published skill resources" ON public.skill_development_resources
  FOR SELECT USING (is_published = true AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view published skill quizzes" ON public.skill_quizzes;
CREATE POLICY "Active users view published skill quizzes" ON public.skill_quizzes
  FOR SELECT USING (
    is_published = true
    AND public.is_account_active(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.skill_development_resources r
      WHERE r.id = skill_quizzes.resource_id AND r.is_published = true
    )
  );

-- Product Knowledge Hub: items and quizzes require published state
DROP POLICY IF EXISTS "Active users view published products" ON public.product_knowledge_items;
CREATE POLICY "Active users view published products" ON public.product_knowledge_items
  FOR SELECT USING (is_published = true AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Active users view published product quizzes" ON public.product_quizzes;
CREATE POLICY "Active users view published product quizzes" ON public.product_quizzes
  FOR SELECT USING (
    is_published = true
    AND public.is_account_active(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.product_knowledge_items p
      WHERE p.id = product_quizzes.product_id AND p.is_published = true
    )
  );

-- Company Bulletins: requires published = true and status = 'published'
DROP POLICY IF EXISTS "Active users view published bulletins" ON public.company_bulletins;
CREATE POLICY "Active users view published bulletins" ON public.company_bulletins
  FOR SELECT USING (
    published = true
    AND status = 'published'
    AND public.is_account_active(auth.uid())
  );

-- User Progress & Quiz Attempts Policies
DROP POLICY IF EXISTS "Users can read own progress" ON public.learning_progress;
CREATE POLICY "Users can read own progress" ON public.learning_progress
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can upsert own progress" ON public.learning_progress;
CREATE POLICY "Users can upsert own progress" ON public.learning_progress
  FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read own license attempts" ON public.license_quiz_attempts;
CREATE POLICY "Users can read own license attempts" ON public.license_quiz_attempts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own license attempts" ON public.license_quiz_attempts;
CREATE POLICY "Users can insert own license attempts" ON public.license_quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read own skill attempts" ON public.skill_quiz_attempts;
CREATE POLICY "Users can read own skill attempts" ON public.skill_quiz_attempts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own skill attempts" ON public.skill_quiz_attempts;
CREATE POLICY "Users can insert own skill attempts" ON public.skill_quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read own product attempts" ON public.product_quiz_attempts;
CREATE POLICY "Users can read own product attempts" ON public.product_quiz_attempts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own product attempts" ON public.product_quiz_attempts;
CREATE POLICY "Users can insert own product attempts" ON public.product_quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- --------------------------------------------------------------------
-- ADMIN MANAGEMENT POLICIES (FULL CRUD & DRAFT ACCESS FOR ADMINS)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
CREATE POLICY "Admins manage courses" ON public.courses
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage channels" ON public.channels;
CREATE POLICY "Admins manage channels" ON public.channels
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage enrollments" ON public.course_enrollments;
CREATE POLICY "Admins manage enrollments" ON public.course_enrollments
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage channel access" ON public.channel_access;
CREATE POLICY "Admins manage channel access" ON public.channel_access
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage news" ON public.company_news;
CREATE POLICY "Admins manage news" ON public.company_news
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage videos" ON public.company_videos;
CREATE POLICY "Admins manage videos" ON public.company_videos
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage top performers" ON public.top_performers;
CREATE POLICY "Admins manage top performers" ON public.top_performers
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage hod motto" ON public.hod_motto;
CREATE POLICY "Admins manage hod motto" ON public.hod_motto
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage team members" ON public.ld_team_members;
CREATE POLICY "Admins manage team members" ON public.ld_team_members
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage license chapters" ON public.license_chapters;
CREATE POLICY "Admins manage license chapters" ON public.license_chapters
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage license lessons" ON public.license_training_lessons;
CREATE POLICY "Admins manage license lessons" ON public.license_training_lessons
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage license quizzes" ON public.license_quizzes;
CREATE POLICY "Admins manage license quizzes" ON public.license_quizzes
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage license questions" ON public.license_quiz_questions;
CREATE POLICY "Admins manage license questions" ON public.license_quiz_questions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage skill categories" ON public.skill_categories;
CREATE POLICY "Admins manage skill categories" ON public.skill_categories
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage skill resources" ON public.skill_development_resources;
CREATE POLICY "Admins manage skill resources" ON public.skill_development_resources
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage skill quizzes" ON public.skill_quizzes;
CREATE POLICY "Admins manage skill quizzes" ON public.skill_quizzes
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage products" ON public.product_knowledge_items;
CREATE POLICY "Admins manage products" ON public.product_knowledge_items
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage product quizzes" ON public.product_quizzes;
CREATE POLICY "Admins manage product quizzes" ON public.product_quizzes
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage company bulletins" ON public.company_bulletins;
CREATE POLICY "Admins manage company bulletins" ON public.company_bulletins
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins manage audit logs" ON public.admin_audit_logs
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- --------------------------------------------------------------------
-- STORAGE RLS POLICIES (Strict Object Isolation)
-- --------------------------------------------------------------------
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Public Media Buckets: Unrestricted read for publicly hosted promotional assets
DROP POLICY IF EXISTS "Public read for public media buckets" ON storage.objects;
CREATE POLICY "Public read for public media buckets" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('profile-pictures', 'company-news', 'video-thumbnails', 'top-performers', 'product-images')
  );

-- 2. Private Buckets: Authorized active users can read private training materials & bulletins
DROP POLICY IF EXISTS "Authorized users read private training materials and bulletins" ON storage.objects;
CREATE POLICY "Authorized users read private training materials and bulletins" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('company-bulletins', 'training-materials')
    AND public.is_account_active(auth.uid())
  );

-- 3. Administrator Storage Full Control: Only admins can upload, edit, or delete institutional materials
DROP POLICY IF EXISTS "Admins manage all storage objects" ON storage.objects;
CREATE POLICY "Admins manage all storage objects" ON storage.objects
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. User Profile Pictures: Active authenticated users upload to their own user-id folder
DROP POLICY IF EXISTS "Authenticated users upload profile pictures" ON storage.objects;
CREATE POLICY "Authenticated users upload profile pictures" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND public.is_account_active(auth.uid())
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. User Profile Pictures: Active authenticated users update their own pictures
DROP POLICY IF EXISTS "Authenticated users update own profile pictures" ON storage.objects;
CREATE POLICY "Authenticated users update own profile pictures" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-pictures'
    AND public.is_account_active(auth.uid())
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND public.is_account_active(auth.uid())
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. User Profile Pictures: Active authenticated users delete their own pictures
DROP POLICY IF EXISTS "Authenticated users delete own profile pictures" ON storage.objects;
CREATE POLICY "Authenticated users delete own profile pictures" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-pictures'
    AND public.is_account_active(auth.uid())
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- --------------------------------------------------------------------
-- 16. SEED DATA (Official Institutional Materials & Question Banks)
-- --------------------------------------------------------------------
-- Head of Department Motto
INSERT INTO public.hod_motto (id, hod_name, hod_title, motto_quote, motto_body, avatar_url)
VALUES (
  'hod_motto_singleton',
  'Daw Khin San Tint',
  'Head of Learning & Development, KBZLife Insurance',
  'Empowering Frontline Excellence Through Structured Knowledge and Ethical Governance',
  'At KBZLife, our advisory force is the heartbeat of financial protection for families across Myanmar. Continuous learning is not merely a professional milestone—it is our fiduciary commitment to market trust, regulatory integrity, and consumer prosperity.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  motto_quote = EXCLUDED.motto_quote,
  motto_body = EXCLUDED.motto_body;

-- Statutory License Chapters
INSERT INTO public.license_chapters (id, chapter_number, title, description, summary, estimated_minutes, passing_score, display_order, is_published)
VALUES
  ('lic_ch_001', 1, 'IBRB Statutory Framework & Agent Licensing Regulations', 'Core regulatory requirements, ethics, and statutory compliance established by the Insurance Business Regulatory Board of Myanmar.', 'Master the essential regulatory framework governing Myanmar life insurance agency operations.', 60, 80, 1, true),
  ('lic_ch_002', 2, 'Life Insurance Principles, Underwriting & Risk Assessment', 'Core principles of utmost good faith, insurable interest, medical/financial underwriting, and policy issuance.', 'Comprehensive foundations of risk evaluation, insurable interest, and underwriting decision workflows.', 75, 80, 2, true),
  ('lic_ch_003', 3, 'Market Conduct, Policyholder Rights & Claims Governance', 'Fair market conduct rules, transparent policy disclosure, cooling-off provisions, and dispute escalation protocols.', 'Essential standards for maintaining customer protection, transparency, and ethical advisory practices.', 90, 80, 3, true)
ON CONFLICT (id) DO NOTHING;

-- License Training Lessons
-- NOTE ON ASSET PATHS: The seed files below point to local verified files located in the project repository's
-- public/uploads/ directory (/public/uploads/...). When deploying to production Supabase Storage, upload these
-- local files to the 'training-materials' bucket and update file_url with the storage path or signed URL.
INSERT INTO public.license_training_lessons (id, chapter_id, title, description, content_type, file_url, thumbnail_url, duration, display_order, is_published)
VALUES
  ('lic_lesson_001', 'lic_ch_001', 'Module 1: IBRB Statutory Code & Agent Licensing Conduct', 'Comprehensive walkthrough of Myanmar Insurance Business Regulatory Board compliance mandates.', 'video', '/uploads/IBRB_Licensing_Agent_Code.mp4', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80', '24:18', 1, true),
  ('lic_lesson_002', 'lic_ch_001', 'Module 2: Anti-Money Laundering & Terrorist Financing (AML/CFT) Compliance', 'Core screening obligations, suspicious transaction identification, and mandatory reporting protocols.', 'pdf', '/uploads/KBZLife_AML_CFT_Compliance_2026.pdf', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', '32 Pages', 2, true),
  ('lic_lesson_003', 'lic_ch_002', 'Module 3: Fair Market Conduct & Policyholder Rights Manual', 'Detailed guidance on transparent disclosure, cooling-off rights, and claim dispute management.', 'pdf', '/uploads/Fair_Market_Conduct_Manual.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80', '28 Pages', 3, true)
ON CONFLICT (id) DO NOTHING;

-- Official License Quizzes & Grounded Question Bank (Enables Server-Side Scoring Verification)
INSERT INTO public.license_quizzes (id, chapter_id, title, description, passing_score, time_limit_minutes, is_published)
VALUES
  ('lic_quiz_001', 'lic_ch_001', 'IBRB Statutory Framework Assessment', 'Official statutory compliance and licensing exam for insurance advisors.', 80, 20, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.license_quiz_questions (id, quiz_id, question_text, options, correct_option_index, explanation, display_order)
VALUES
  ('lqq_001', 'lic_quiz_001', 'Under the Insurance Business Regulatory Board (IBRB), what is the mandatory requirement regarding policy cooling-off periods?', '["14 days from policy document delivery", "7 days from application signing", "30 days without exception", "No cooling-off period is mandated"]'::jsonb, 0, 'IBRB regulations mandate a 14-day free-look/cooling-off period starting from the date of policy document receipt.', 1),
  ('lqq_002', 'lic_quiz_001', 'Which of the following is considered a severe market conduct violation under Myanmar insurance regulations?', '["Promptly delivering policy contracts", "Churning policies solely to generate advisor commission", "Explaining exclusions before proposal signing", "Conducting annual policyholder reviews"]'::jsonb, 1, 'Policy churning and twisting solely for agent commission constitutes a direct breach of fiduciary conduct.', 2),
  ('lqq_003', 'lic_quiz_001', 'What is the primary statutory obligation of a licensed life insurance agent during the KYC (Know Your Customer) process?', '["Guarantee investment returns to the client", "Verify official identity credentials and source of funds", "Offer personal commission rebates to close sales", "Waive medical underwriting disclosures"]'::jsonb, 1, 'Agents are legally obligated under AML/CFT directives to verify official national ID and assess legitimate source of funds.', 3),
  ('lqq_004', 'lic_quiz_001', 'Under the principle of Utmost Good Faith (Uberrima Fides), what must the applicant and advisor disclose?', '["Only facts specifically inquired about by the doctor", "All material facts that could influence underwriter risk assessment", "Only positive health records from the last 12 months", "Personal financial predictions for the next decade"]'::jsonb, 1, 'Both parties must disclose every material fact that would influence a prudent underwriter in accepting the risk.', 4),
  ('lqq_005', 'lic_quiz_001', 'When is Insurable Interest legally required to exist in a standard life insurance contract?', '["At the inception of the policy when the contract is effected", "Only at the time a claim occurs", "Only when the policy is assigned to a third party", "Continuously every day until maturity"]'::jsonb, 0, 'In life insurance law, insurable interest must exist at the inception of the policy contract.', 5)
ON CONFLICT (id) DO NOTHING;

-- Company Bulletins & Directives
-- NOTE: pdf_url references valid project documents in public/uploads/. For cloud storage, upload to 'company-bulletins' bucket.
INSERT INTO public.company_bulletins (id, title, description, category, pdf_url, file_name, file_size, formatted_file_size, published, status, priority, department, reference_no)
VALUES
  ('bulletin_001', 'Official Market Conduct and Policyholder Protection Directive 2026', 'Compulsory regulatory standards and compliance benchmarks issued by the Executive Committee for all nationwide frontline advisors and bancassurance partners.', 'Governance & Policy', '/uploads/Fair_Market_Conduct_Manual.pdf', 'Fair_Market_Conduct_Manual.pdf', 2516582, '2.4 MB', true, 'published', 'urgent', 'Compliance & Legal', 'KBZ-2026-DIR01'),
  ('bulletin_002', 'Annual Anti-Money Laundering & CFT Risk Assessment Manual', 'Updated institutional handbook on customer due diligence, PEP verification, and suspicious transaction escalation for retail branch operations.', 'Regulatory Notice', '/uploads/KBZLife_AML_CFT_Compliance_2026.pdf', 'KBZLife_AML_CFT_Compliance_2026.pdf', 3250585, '3.1 MB', true, 'published', 'high', 'AML / Risk Operations', 'KBZ-2026-AML04')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 17. VERIFICATION INSTRUCTION
-- --------------------------------------------------------------------
-- Output operational readiness message
SELECT 'KBZLife LMS Hardened Master Schema successfully configured. Use the Supabase SQL Editor as postgres/service_role to run: SELECT public.bootstrap_first_super_admin(''your-superadmin-email@kbzlife.com'');' AS execution_status;
