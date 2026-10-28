-- ====================================================================
-- Migration: 20261022_add_ld_team_and_hod_motto.sql
-- Modules: Head of Department (HOD) Motto, L&D Team Members & Interns
-- ====================================================================

-- 1. HOD MOTTO TABLE
CREATE TABLE IF NOT EXISTS public.hod_motto (
    id TEXT PRIMARY KEY DEFAULT 'hod_motto_001',
    motto_text TEXT NOT NULL,
    hod_name TEXT DEFAULT 'Daw Khin Thida',
    hod_title TEXT DEFAULT 'Head of Learning & Development, KBZLife Insurance',
    photo_url TEXT,
    statement_context TEXT DEFAULT 'Leadership guidance for continuous professional growth and capability development.',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. L&D TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.ld_team_members (
    id TEXT PRIMARY KEY DEFAULT ('tm_' || substr(md5(random()::text), 1, 8)),
    full_name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Learning & Development',
    member_type TEXT NOT NULL CHECK (member_type IN ('team_member', 'intern')) DEFAULT 'team_member',
    photo_path TEXT,
    photo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS POLICIES
ALTER TABLE public.hod_motto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ld_team_members ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated users can read published records
CREATE POLICY "Anyone can read published HOD motto" ON public.hod_motto
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can read published team members" ON public.ld_team_members
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

-- Authenticated admins can insert, update, delete
CREATE POLICY "Admins have full access to HOD motto" ON public.hod_motto
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins have full access to team members" ON public.ld_team_members
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Seed Initial HOD Motto if not present
INSERT INTO public.hod_motto (id, motto_text, hod_name, hod_title, photo_url, statement_context, is_published)
VALUES (
    'hod_motto_001',
    '“Learning is not a one-time milestone; it is our ongoing commitment to professional excellence. In the Learning and Development Hub, our mission is to empower every KBZLife employee with the knowledge, modern skills, and unwavering ethics needed to protect Myanmar families with utmost trust and capability.”',
    'Daw Khin Thida',
    'Head of Learning & Development, KBZLife Insurance',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'Leadership statement for all KBZLife operational and advisory employees nationwide.',
    true
)
ON CONFLICT (id) DO NOTHING;
