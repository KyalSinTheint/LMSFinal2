-- ====================================================================
-- Migration: 20261023_add_skill_categories_and_updates.sql
-- Modules: Skill Development Categories & Enhanced Resource Management
-- ====================================================================

-- 1. SKILL CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id TEXT PRIMARY KEY DEFAULT ('sk_cat_' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. SKILL DEVELOPMENT RESOURCES TABLE (Ensure full schema)
CREATE TABLE IF NOT EXISTS public.skill_development_resources (
    id TEXT PRIMARY KEY DEFAULT ('sk_res_' || substr(md5(random()::text), 1, 8)),
    title TEXT NOT NULL,
    description TEXT,
    category_id TEXT REFERENCES public.skill_categories(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'General',
    topic TEXT NOT NULL DEFAULT 'General',
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'pdf', 'link')) DEFAULT 'video',
    file_url TEXT,
    content_url TEXT,
    external_url TEXT,
    file_path TEXT,
    storage_path TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    file_size_formatted TEXT,
    duration TEXT,
    video_duration TEXT,
    thumbnail_url TEXT,
    thumbnail_path TEXT,
    instructor_name TEXT DEFAULT 'KBZ Life Insurance',
    instructor_role TEXT DEFAULT 'Lead Specialist',
    instructor_title TEXT DEFAULT 'Lead Specialist',
    instructor_avatar TEXT,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    lesson_count INTEGER DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    is_published BOOLEAN NOT NULL DEFAULT true,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- If table already existed, add missing columns safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skill_development_resources' AND column_name = 'category_id') THEN
        ALTER TABLE public.skill_development_resources ADD COLUMN category_id TEXT REFERENCES public.skill_categories(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skill_development_resources' AND column_name = 'category') THEN
        ALTER TABLE public.skill_development_resources ADD COLUMN category TEXT NOT NULL DEFAULT 'General';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skill_development_resources' AND column_name = 'is_published') THEN
        ALTER TABLE public.skill_development_resources ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skill_development_resources' AND column_name = 'external_url') THEN
        ALTER TABLE public.skill_development_resources ADD COLUMN external_url TEXT;
    END IF;
END $$;

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_development_resources ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR SKILL CATEGORIES
DROP POLICY IF EXISTS "Anyone can read published skill categories" ON public.skill_categories;
CREATE POLICY "Anyone can read published skill categories" ON public.skill_categories
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins have full access to skill categories" ON public.skill_categories;
CREATE POLICY "Admins have full access to skill categories" ON public.skill_categories
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 5. RLS POLICIES FOR SKILL DEVELOPMENT RESOURCES
DROP POLICY IF EXISTS "Anyone can read published skill resources" ON public.skill_development_resources;
CREATE POLICY "Anyone can read published skill resources" ON public.skill_development_resources
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins have full access to skill resources" ON public.skill_development_resources;
CREATE POLICY "Admins have full access to skill resources" ON public.skill_development_resources
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 6. SEED INITIAL SKILL CATEGORIES
INSERT INTO public.skill_categories (id, name, description, display_order, is_published)
VALUES
    ('sk_cat_001', 'Business English', 'Professional terminology, client consultation dialogue, and formal correspondence.', 1, true),
    ('sk_cat_002', 'Excel & Data Analytics', 'Financial modeling, automated reporting, formulas, and policy analytics dashboards.', 2, true),
    ('sk_cat_003', 'Leadership & Management', 'Team coaching, emotional intelligence, and frontline operational leadership.', 3, true),
    ('sk_cat_004', 'Technology & Digital Tools', 'Cloud collaboration suites, digital signatures, and paperless branch workflows.', 4, true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published;

-- 7. SEED INITIAL SKILL RESOURCES
INSERT INTO public.skill_development_resources (
    id, title, description, category_id, category, topic, content_type,
    content_url, file_url, external_url, file_name, file_size_bytes,
    duration, video_duration, thumbnail_url, instructor_name, instructor_role,
    instructor_title, instructor_avatar, rating, lesson_count, display_order,
    status, is_published
)
VALUES
(
    'sk_res_001',
    'English for Insurance Professionals: Client Advisory & Presentation',
    'Essential business English vocabulary, empathetic email writing, and professional consultative terminology for modern insurance advisors.',
    'sk_cat_001',
    'Business English',
    'Business English',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    NULL,
    'English_Insurance_Advisory.mp4',
    52000000,
    '28:15',
    '28:15',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    'Daw Eleanor Pena',
    'Corporate Language Specialist',
    'Corporate Language Specialist',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    5.0,
    16,
    1,
    'published',
    true
),
(
    'sk_res_002',
    'Excel Mastery: Financial Modeling & Actuarial Reporting',
    'Master advanced formulas (XLOOKUP, INDEX/MATCH), dynamic Pivot Tables, and automated dashboard reporting for policy portfolio analytics.',
    'sk_cat_002',
    'Excel & Data Analytics',
    'Excel & Data Analytics',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    NULL,
    'Excel_Financial_Modeling.mp4',
    78000000,
    '35:40',
    '35:40',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    'U Dianne Russell',
    'Financial Analytics Lead',
    'Financial Analytics Lead',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    5.0,
    24,
    2,
    'published',
    true
),
(
    'sk_res_003',
    'Excel Advanced Formulas & Automation Handbook',
    'Comprehensive quick-reference manual featuring automated macro scripts, conditional formatting blueprints, and validation rules for branch managers.',
    'sk_cat_002',
    'Excel & Data Analytics',
    'Excel & Data Analytics',
    'pdf',
    '/uploads/KBZLife_Excel_Automation_Handbook.pdf',
    '/uploads/KBZLife_Excel_Automation_Handbook.pdf',
    NULL,
    'KBZLife_Excel_Automation_Handbook.pdf',
    58198,
    NULL,
    NULL,
    '',
    'U Min Htet Aung',
    'Senior L&D Manager',
    'Senior L&D Manager',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    5.0,
    8,
    3,
    'published',
    true
),
(
    'sk_res_004',
    'Everyday Business English for Frontline Branch Service',
    'Practical customer interaction dialogs, objection handling phrases, and polite formal correspondence guides for customer care advisors.',
    'sk_cat_001',
    'Business English',
    'Business English',
    'pdf',
    '/uploads/Everyday_Business_English_Frontline.pdf',
    '/uploads/Everyday_Business_English_Frontline.pdf',
    NULL,
    'Everyday_Business_English_Frontline.pdf',
    58198,
    NULL,
    NULL,
    '',
    'Daw Su Myat Noe',
    'Sales Enablement Specialist',
    'Sales Enablement Specialist',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    5.0,
    12,
    4,
    'published',
    true
),
(
    'sk_res_005',
    'Leading Teams: Developing High-Performance Insurance Leaders',
    'External leadership briefing focusing on team coaching, emotional intelligence in underwriting, and building psychological safety in high-stress sales environments.',
    'sk_cat_003',
    'Leadership & Management',
    'Leadership & Management',
    'link',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    NULL,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    NULL,
    NULL,
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'Guy Hawkins',
    'HR & Talent Governance Director',
    'HR & Talent Governance Director',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    5.0,
    38,
    5,
    'published',
    true
),
(
    'sk_res_006',
    'Digital Systems & Cloud Collaboration for Insurance Operations',
    'Hands-on workflow tutorial on modern cloud suites, secure document processing, digital signatures, and paperless policy issuance.',
    'sk_cat_004',
    'Technology & Digital Tools',
    'Technology & Digital Tools',
    'video',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    NULL,
    'Digital_Cloud_Workflows.mp4',
    42000000,
    '21:10',
    '21:10',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'U Zin Min Oo',
    'Lead Systems Trainer',
    'Lead Systems Trainer',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80',
    5.0,
    10,
    6,
    'published',
    true
)
ON CONFLICT (id) DO NOTHING;
