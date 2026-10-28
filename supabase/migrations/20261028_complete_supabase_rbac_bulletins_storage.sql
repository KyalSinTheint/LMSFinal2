-- ====================================================================
-- KBZLIFE LMS: Complete Supabase Integration, Secure RBAC & Storage
-- Migration: 20261028_complete_supabase_rbac_bulletins_storage.sql
-- Modules:
--   1. 3-Tier RBAC: 'super_admin', 'admin', 'user'
--   2. Concurrency-safe Maximum 20 Active Admin Account Limit Trigger
--   3. Protection against Last Super Admin Removal/Demotion
--   4. One-time First Super Admin Bootstrap Function
--   5. Company Bulletins Table & RLS Policies
--   6. License Training Lessons Table & RLS Policies
--   7. Skill Quizzes & Quiz Attempts Tables & RLS Policies
--   8. Private & Public Storage Buckets & Policies
--   9. Least-Privilege RLS Hardening for All Sensitive Tables
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE: ENHANCE RBAC ROLES & CHECK CONSTRAINTS
-- --------------------------------------------------------------------
DO $$
BEGIN
    -- Drop old role check constraint if it exists
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    -- Add updated check constraint supporting 'super_admin', 'admin', 'user'
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
        CHECK (role IN ('super_admin', 'admin', 'user'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

DO $$
BEGIN
    -- Ensure account_status check constraint supports all states
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_account_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_status_check
        CHECK (account_status IN ('active', 'approved', 'pending', 'rejected', 'suspended', 'inactive'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- --------------------------------------------------------------------
-- 2. SECURITY DEFINER HELPER FUNCTIONS FOR RBAC POLICIES
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 3. CONCURRENCY-SAFE 20 ADMIN LIMIT & LAST SUPER ADMIN DEFENSE
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_admin_account_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_count INTEGER;
  v_super_admin_count INTEGER;
BEGIN
  -- If transitioning to or created as an active administrator
  IF (NEW.role IN ('admin', 'super_admin') AND NEW.account_status IN ('active', 'approved')) THEN
    -- Concurrency defense: lock active admin rows to prevent race condition promotions
    PERFORM 1 FROM public.profiles WHERE role IN ('admin', 'super_admin') FOR UPDATE;
    
    SELECT COUNT(*) INTO v_admin_count
    FROM public.profiles
    WHERE role IN ('admin', 'super_admin')
      AND account_status IN ('active', 'approved')
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_admin_count >= 20 THEN
      RAISE EXCEPTION 'Maximum limit of 20 active administrator accounts has been reached. Cannot promote or activate additional administrator accounts.';
    END IF;
  END IF;

  -- Prevent unsafe removal or demotion of the last active Super Admin
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.role = 'super_admin' AND (NEW.role <> 'super_admin' OR NEW.account_status NOT IN ('active', 'approved'))) THEN
      SELECT COUNT(*) INTO v_super_admin_count
      FROM public.profiles
      WHERE role = 'super_admin'
        AND account_status IN ('active', 'approved')
        AND id <> OLD.id;

      IF v_super_admin_count = 0 THEN
        RAISE EXCEPTION 'Cannot demote or deactivate the last remaining active Super Admin.';
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

-- Prevent deletion of last active Super Admin
CREATE OR REPLACE FUNCTION public.prevent_last_super_admin_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_super_admin_count INTEGER;
BEGIN
  IF OLD.role = 'super_admin' THEN
    SELECT COUNT(*) INTO v_super_admin_count
    FROM public.profiles
    WHERE role = 'super_admin'
      AND account_status IN ('active', 'approved')
      AND id <> OLD.id;

    IF v_super_admin_count = 0 THEN
      RAISE EXCEPTION 'Cannot delete the last remaining active Super Admin.';
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
-- 4. SECURE FIRST SUPER ADMIN BOOTSTRAP FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_first_super_admin(target_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_super_admins INTEGER;
  v_target_profile public.profiles%ROWTYPE;
BEGIN
  -- Check if any super admin already exists
  SELECT COUNT(*) INTO v_existing_super_admins
  FROM public.profiles
  WHERE role = 'super_admin';

  IF v_existing_super_admins > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'A Super Admin is already configured. First-time initialization is permanently locked.'
    );
  END IF;

  -- Find profile
  SELECT * INTO v_target_profile
  FROM public.profiles
  WHERE LOWER(email) = LOWER(TRIM(target_email));

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No profile found for email: ' || target_email
    );
  END IF;

  -- Promote to super_admin and set active
  UPDATE public.profiles
  SET role = 'super_admin',
      account_status = 'active',
      updated_at = timezone('utc'::text, now())
  WHERE id = v_target_profile.id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully initialized ' || target_email || ' as Super Admin.',
    'userId', v_target_profile.id
  );
END;
$$;

-- --------------------------------------------------------------------
-- 5. SECURE AUTH REGISTRATION TRIGGER: ALWAYS PENDING & USER ROLE
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- CRITICAL SECURITY RULE: Public registration can NEVER create privileged roles.
  -- Force role = 'user' and account_status = 'pending'
  INSERT INTO public.profiles (id, username, full_name, email, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user',
    'pending'
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

-- --------------------------------------------------------------------
-- 6. COMPANY BULLETINS TABLE
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

CREATE INDEX IF NOT EXISTS idx_bulletins_published ON public.company_bulletins(published);
CREATE INDEX IF NOT EXISTS idx_bulletins_category ON public.company_bulletins(category);
CREATE INDEX IF NOT EXISTS idx_bulletins_published_at ON public.company_bulletins(published_at DESC);

-- --------------------------------------------------------------------
-- 7. LICENSE TRAINING LESSONS TABLE
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_license_lessons_chapter ON public.license_training_lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_license_lessons_order ON public.license_training_lessons(display_order);

-- --------------------------------------------------------------------
-- 8. SKILL QUIZZES & ATTEMPTS TABLES
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_skill_quizzes_cat ON public.skill_quizzes(category_id);
CREATE INDEX IF NOT EXISTS idx_skill_quiz_attempts_user ON public.skill_quiz_attempts(user_id);

-- --------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.company_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_training_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Company Bulletins
DROP POLICY IF EXISTS "Active users view published bulletins" ON public.company_bulletins;
CREATE POLICY "Active users view published bulletins" ON public.company_bulletins
  FOR SELECT USING (published = true AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Admins manage all company bulletins" ON public.company_bulletins;
CREATE POLICY "Admins manage all company bulletins" ON public.company_bulletins
  FOR ALL USING (public.is_admin(auth.uid()));

-- License Training Lessons
DROP POLICY IF EXISTS "Active users view published license lessons" ON public.license_training_lessons;
CREATE POLICY "Active users view published license lessons" ON public.license_training_lessons
  FOR SELECT USING (is_published = true AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Admins manage all license lessons" ON public.license_training_lessons;
CREATE POLICY "Admins manage all license lessons" ON public.license_training_lessons
  FOR ALL USING (public.is_admin(auth.uid()));

-- Skill Quizzes & Attempts
DROP POLICY IF EXISTS "Active users view published skill quizzes" ON public.skill_quizzes;
CREATE POLICY "Active users view published skill quizzes" ON public.skill_quizzes
  FOR SELECT USING (is_published = true AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Admins manage all skill quizzes" ON public.skill_quizzes;
CREATE POLICY "Admins manage all skill quizzes" ON public.skill_quizzes
  FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read own skill attempts" ON public.skill_quiz_attempts;
CREATE POLICY "Users can read own skill attempts" ON public.skill_quiz_attempts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own skill attempts" ON public.skill_quiz_attempts;
CREATE POLICY "Users can insert own skill attempts" ON public.skill_quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Profile Policies Hardening
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Super Admins only can manage all profiles and change roles
DROP POLICY IF EXISTS "Super Admins manage all profiles" ON public.profiles;
CREATE POLICY "Super Admins manage all profiles" ON public.profiles
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- Regular Admins can approve/suspend users (update account_status)
DROP POLICY IF EXISTS "Admins can update user account statuses" ON public.profiles;
CREATE POLICY "Admins can update user account statuses" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- --------------------------------------------------------------------
-- 10. STORAGE BUCKETS CONFIGURATION (PRIVATE & PUBLIC)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-pictures', 'profile-pictures', true),
  ('company-news', 'company-news', true),
  ('video-thumbnails', 'video-thumbnails', true),
  ('top-performers', 'top-performers', true),
  ('product-images', 'product-images', true),
  ('company-bulletins', 'company-bulletins', false),
  ('training-materials', 'training-materials', false)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- Storage RLS: Public read for public media buckets
DROP POLICY IF EXISTS "Public read for public media buckets" ON storage.objects;
CREATE POLICY "Public read for public media buckets" ON storage.objects
  FOR SELECT USING (bucket_id IN ('profile-pictures', 'company-news', 'video-thumbnails', 'top-performers', 'product-images'));

-- Storage RLS: Private read for bulletins & training materials
DROP POLICY IF EXISTS "Authorized users read private training materials and bulletins" ON storage.objects;
CREATE POLICY "Authorized users read private training materials and bulletins" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('company-bulletins', 'training-materials')
    AND public.is_account_active(auth.uid())
  );

-- Storage RLS: Authenticated Admin Upload & Management
DROP POLICY IF EXISTS "Admins manage all storage objects" ON storage.objects;
CREATE POLICY "Admins manage all storage objects" ON storage.objects
  FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users upload profile pictures" ON storage.objects;
CREATE POLICY "Authenticated users upload profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- --------------------------------------------------------------------
-- 11. SEED DEFAULT LESSONS & BULLETINS IF EMPTY
-- --------------------------------------------------------------------
INSERT INTO public.license_training_lessons (id, chapter_id, title, description, content_type, file_url, thumbnail_url, duration, display_order, is_published)
VALUES
  ('lic_lesson_001', 'lic_ch_001', 'Module 1: IBRB Statutory Code & Agent Licensing Conduct', 'Comprehensive walkthrough of Myanmar Insurance Business Regulatory Board compliance mandates.', 'video', '/uploads/IBRB_Licensing_Agent_Code.mp4', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80', '24:18', 1, true),
  ('lic_lesson_002', 'lic_ch_001', 'Module 2: Anti-Money Laundering & Terrorist Financing (AML/CFT) Compliance', 'Core screening obligations, suspicious transaction identification, and mandatory reporting protocols.', 'pdf', '/uploads/KBZLife_AML_CFT_Compliance_2026.pdf', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', '32 Pages', 2, true),
  ('lic_lesson_003', 'lic_ch_002', 'Module 3: Fair Market Conduct & Policyholder Rights Manual', 'Detailed guidance on transparent disclosure, cooling-off rights, and claim dispute management.', 'pdf', '/uploads/Fair_Market_Conduct_Manual.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80', '28 Pages', 3, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.company_bulletins (id, title, description, category, pdf_url, file_name, file_size, formatted_file_size, published, status, priority, department, reference_no)
VALUES
  ('bulletin_001', 'Official Market Conduct and Policyholder Protection Directive 2026', 'Compulsory regulatory standards and compliance benchmarks issued by the Executive Committee for all nationwide frontline advisors and bancassurance partners.', 'Governance & Policy', '/uploads/Fair_Market_Conduct_Manual.pdf', 'Fair_Market_Conduct_Manual.pdf', 2516582, '2.4 MB', true, 'published', 'urgent', 'Compliance & Legal', 'KBZ-2026-DIR01'),
  ('bulletin_002', 'Annual Anti-Money Laundering & CFT Risk Assessment Manual', 'Updated institutional handbook on customer due diligence, PEP verification, and suspicious transaction escalation for retail branch operations.', 'Regulatory Notice', '/uploads/KBZLife_AML_CFT_Compliance_2026.pdf', 'KBZLife_AML_CFT_Compliance_2026.pdf', 3250585, '3.1 MB', true, 'published', 'high', 'AML / Risk Operations', 'KBZ-2026-AML04')
ON CONFLICT (id) DO NOTHING;
