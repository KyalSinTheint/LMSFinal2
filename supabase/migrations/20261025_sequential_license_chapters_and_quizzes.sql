-- ====================================================================
-- Migration: 20261025_sequential_license_chapters_and_quizzes.sql
-- Modules: Licence Training Sequential Chapters, Distinct PDF Progress,
--          Chapter Quizzes, and Granular Progression Tracking
-- ====================================================================

-- 1. LICENSE CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.license_chapters (
    id TEXT PRIMARY KEY DEFAULT ('lic_ch_' || substr(md5(random()::text), 1, 8)),
    chapter_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 80,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. LICENSE QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.license_quizzes (
    id TEXT PRIMARY KEY DEFAULT ('lic_quiz_' || substr(md5(random()::text), 1, 8)),
    chapter_id TEXT REFERENCES public.license_chapters(id) ON DELETE CASCADE,
    lesson_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 80,
    is_published BOOLEAN NOT NULL DEFAULT true,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. LICENSE QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.license_quiz_attempts (
    id TEXT PRIMARY KEY DEFAULT ('lqa_' || substr(md5(random()::text), 1, 8)),
    quiz_id TEXT NOT NULL,
    chapter_id TEXT REFERENCES public.license_chapters(id) ON DELETE CASCADE,
    lesson_id TEXT,
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

-- 4. CHAPTER COMPLETIONS TABLE
CREATE TABLE IF NOT EXISTS public.chapter_completions (
    id TEXT PRIMARY KEY DEFAULT ('ch_comp_' || substr(md5(random()::text), 1, 8)),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL REFERENCES public.license_chapters(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('locked', 'in_progress', 'quiz_available', 'passed', 'completed')) DEFAULT 'locked',
    materials_completed BOOLEAN NOT NULL DEFAULT false,
    quiz_passed BOOLEAN NOT NULL DEFAULT false,
    highest_quiz_score INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_chapter UNIQUE (user_id, chapter_id)
);

-- 5. EXTEND LEARNING PROGRESS TABLE IF NEEDED
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS lesson_id TEXT;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS chapter_id TEXT;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS viewed_pages INTEGER[] DEFAULT ARRAY[]::INTEGER[];
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS last_page INTEGER DEFAULT 1;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS watched_seconds REAL DEFAULT 0;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS total_duration_seconds REAL DEFAULT 0;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS watched_intervals JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS last_position REAL DEFAULT 0;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS quiz_score INTEGER;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS quiz_attempts_count INTEGER DEFAULT 0;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMPTZ;
ALTER TABLE public.learning_progress ADD COLUMN IF NOT EXISTS overall_completed BOOLEAN DEFAULT false;

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.license_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_completions ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR LICENSE CHAPTERS
DROP POLICY IF EXISTS "Anyone can read published license chapters" ON public.license_chapters;
CREATE POLICY "Anyone can read published license chapters" ON public.license_chapters
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins have full access to license chapters" ON public.license_chapters;
CREATE POLICY "Admins have full access to license chapters" ON public.license_chapters
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 8. RLS POLICIES FOR LICENSE QUIZZES
DROP POLICY IF EXISTS "Anyone can read published license quizzes" ON public.license_quizzes;
CREATE POLICY "Anyone can read published license quizzes" ON public.license_quizzes
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins have full access to license quizzes" ON public.license_quizzes;
CREATE POLICY "Admins have full access to license quizzes" ON public.license_quizzes
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 9. RLS POLICIES FOR QUIZ ATTEMPTS
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.license_quiz_attempts;
CREATE POLICY "Users can read own quiz attempts" ON public.license_quiz_attempts
    FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.license_quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts" ON public.license_quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

-- 10. RLS POLICIES FOR CHAPTER COMPLETIONS
DROP POLICY IF EXISTS "Users can read own chapter completions" ON public.chapter_completions;
CREATE POLICY "Users can read own chapter completions" ON public.chapter_completions
    FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Users can upsert own chapter completions" ON public.chapter_completions;
CREATE POLICY "Users can upsert own chapter completions" ON public.chapter_completions
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 11. SEED DEFAULT LICENSE CHAPTERS IF NONE EXIST
INSERT INTO public.license_chapters (id, chapter_number, title, description, passing_score, display_order, is_published)
VALUES
    ('lic_ch_001', 1, 'Chapter 1: Regulatory Foundations & Anti-Money Laundering', 'Master statutory licensing regulations under the Insurance Business Regulatory Board (IBRB), core advisor ethics, and compulsory Anti-Money Laundering (AML/CFT) frameworks.', 80, 1, true),
    ('lic_ch_002', 2, 'Chapter 2: Underwriting Fundamentals & Fair Market Conduct', 'Learn field underwriting discipline, medical & financial hazard disclosure principles, policyholder rights, and transparency standards.', 80, 2, true),
    ('lic_ch_003', 3, 'Chapter 3: Bancassurance & Point-of-Sale Governance', 'Guidelines on co-branded banking distributions, suitability evaluation, client consent records, and ethical customer solicitation.', 80, 3, true)
ON CONFLICT (id) DO NOTHING;
