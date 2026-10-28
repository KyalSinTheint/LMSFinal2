-- ====================================================================
-- KBZLIFE Learning Management System (LMS) - Supabase Database Schema
-- Migration: 20261021_init_kbzlife_lms.sql
-- Modules: Profiles, Courses, Channels, Enrollments, Channel Access,
--          Company News, Company Videos, Top Performers, Audit Logs, Email Logs
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    account_status TEXT NOT NULL CHECK (account_status IN ('active', 'approved', 'pending', 'rejected', 'suspended', 'inactive')) DEFAULT 'active',
    employee_id TEXT,
    department TEXT DEFAULT 'KBZLife Insurance Operations',
    avatar_url TEXT,
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_sign_in_at TIMESTAMPTZ
);

-- 2. COURSES TABLE
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

-- 3. CHANNELS TABLE
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

-- 4. COURSE ENROLLMENTS TABLE
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

-- 5. CHANNEL ACCESS TABLE
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

-- 6. COMPANY NEWS TABLE
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

-- 7. COMPANY VIDEOS TABLE
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

-- 8. TOP PERFORMERS TABLE
CREATE TABLE IF NOT EXISTS public.top_performers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_name TEXT NOT NULL,
    employee_title TEXT NOT NULL,
    department TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('Alliance Channel', 'Bancassurance Channel', 'Corporate Channel')),
    achievement_title TEXT NOT NULL,
    achievement_description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    recognition_period TEXT NOT NULL,
    month_index INTEGER NOT NULL CHECK (month_index >= 1 AND month_index <= 12),
    ranking INTEGER,
    award_date DATE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. LEARNING PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completion_status TEXT NOT NULL CHECK (completion_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_modules TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- 10. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_name TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. EMAIL DELIVERY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'queued')) DEFAULT 'sent',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_company_news_status ON public.company_news(status);
CREATE INDEX IF NOT EXISTS idx_company_videos_status ON public.company_videos(status);
CREATE INDEX IF NOT EXISTS idx_top_performers_status ON public.top_performers(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_access_user ON public.channel_access(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.admin_audit_logs(created_at DESC);

-- ====================================================================
-- SECURE HELPER FUNCTIONS FOR RLS (Security Definer)
-- ====================================================================
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
      AND role = 'admin'
      AND account_status = 'active'
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

-- Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_news_updated_at ON public.company_news;
CREATE TRIGGER trigger_news_updated_at
  BEFORE UPDATE ON public.company_news
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_videos_updated_at ON public.company_videos;
CREATE TRIGGER trigger_videos_updated_at
  BEFORE UPDATE ON public.company_videos
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_top_performers_updated_at ON public.top_performers;
CREATE TRIGGER trigger_top_performers_updated_at
  BEFORE UPDATE ON public.top_performers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Auto-create profile trigger on new Supabase auth user
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can update personal profile details" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

-- Courses & Channels
CREATE POLICY "Active users can view published courses" ON public.courses FOR SELECT USING (published = true AND public.is_account_active(auth.uid()));
CREATE POLICY "Admins can manage all courses" ON public.courses FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Active users can view published channels" ON public.channels FOR SELECT USING (published = true AND public.is_account_active(auth.uid()));
CREATE POLICY "Admins can manage all channels" ON public.channels FOR ALL USING (public.is_admin(auth.uid()));

-- Enrollments & Channel Access
CREATE POLICY "Users can view own course enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id AND status = 'enrolled');
CREATE POLICY "Admins can manage all course enrollments" ON public.course_enrollments FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own channel access" ON public.channel_access FOR SELECT USING (auth.uid() = user_id AND status = 'granted');
CREATE POLICY "Admins can manage all channel access" ON public.channel_access FOR ALL USING (public.is_admin(auth.uid()));

-- Company News (Users see only published; Admins manage all)
CREATE POLICY "Active users view published news" ON public.company_news FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage all company news" ON public.company_news FOR ALL USING (public.is_admin(auth.uid()));

-- Company Videos (Users see only published; Admins manage all)
CREATE POLICY "Active users view published videos" ON public.company_videos FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage all company videos" ON public.company_videos FOR ALL USING (public.is_admin(auth.uid()));

-- Top Performers (Users see only published; Admins manage all)
CREATE POLICY "Active users view published performers" ON public.top_performers FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage all top performers" ON public.top_performers FOR ALL USING (public.is_admin(auth.uid()));

-- Progress & Audit & Email Logs
CREATE POLICY "Users view and update own progress" ON public.learning_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all progress" ON public.learning_progress FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins view and insert audit logs" ON public.admin_audit_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins view and insert email logs" ON public.email_logs FOR ALL USING (public.is_admin(auth.uid()));

-- ====================================================================
-- SUPABASE STORAGE BUCKET POLICIES
-- ====================================================================
-- Run in Supabase SQL editor to create public / restricted buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-pictures', 'profile-pictures', true),
  ('company-news', 'company-news', true),
  ('video-thumbnails', 'video-thumbnails', true),
  ('top-performers', 'top-performers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read for published media
CREATE POLICY "Public Read for Profile Pictures" ON storage.objects FOR SELECT USING (bucket_id = 'profile-pictures');
CREATE POLICY "Public Read for Company News Images" ON storage.objects FOR SELECT USING (bucket_id = 'company-news');
CREATE POLICY "Public Read for Video Thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'video-thumbnails');
CREATE POLICY "Public Read for Top Performer Images" ON storage.objects FOR SELECT USING (bucket_id = 'top-performers');

-- Storage RLS: Authenticated upload/update
CREATE POLICY "Authenticated users upload media" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins manage storage objects" ON storage.objects FOR ALL USING (public.is_admin(auth.uid()));
