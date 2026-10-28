-- ====================================================================
-- Migration: 20261024_add_product_knowledge_hub.sql
-- Modules: Product Knowledge Hub & Product-Specific Quizzes
-- ====================================================================

-- 1. PRODUCT KNOWLEDGE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.product_knowledge_items (
    id TEXT PRIMARY KEY DEFAULT ('prod_' || substr(md5(random()::text), 1, 8)),
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL DEFAULT 'Individual Life',
    description TEXT NOT NULL,
    short_description TEXT,
    image_url TEXT,
    image_path TEXT,
    card_color_theme TEXT NOT NULL DEFAULT 'navy',
    key_benefits JSONB DEFAULT '[]'::jsonb,
    key_features JSONB DEFAULT '[]'::jsonb,
    eligibility_criteria TEXT,
    coverage_details TEXT,
    premium_terms TEXT,
    target_audience TEXT,
    additional_sections JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    is_published BOOLEAN NOT NULL DEFAULT true,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PRODUCT-SPECIFIC QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.product_quizzes (
    id TEXT PRIMARY KEY DEFAULT ('prod_quiz_' || substr(md5(random()::text), 1, 8)),
    product_id TEXT NOT NULL REFERENCES public.product_knowledge_items(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 80,
    max_attempts INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCT QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.product_quiz_attempts (
    id TEXT PRIMARY KEY DEFAULT ('pqa_' || substr(md5(random()::text), 1, 8)),
    quiz_id TEXT NOT NULL,
    product_id TEXT NOT NULL REFERENCES public.product_knowledge_items(id) ON DELETE CASCADE,
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

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.product_knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR PRODUCTS
DROP POLICY IF EXISTS "Anyone can read published products" ON public.product_knowledge_items;
CREATE POLICY "Anyone can read published products" ON public.product_knowledge_items
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins have full access to products" ON public.product_knowledge_items;
CREATE POLICY "Admins have full access to products" ON public.product_knowledge_items
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 6. RLS POLICIES FOR PRODUCT QUIZZES
DROP POLICY IF EXISTS "Anyone can read published product quizzes" ON public.product_quizzes;
CREATE POLICY "Anyone can read published product quizzes" ON public.product_quizzes
    FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins have full access to product quizzes" ON public.product_quizzes;
CREATE POLICY "Admins have full access to product quizzes" ON public.product_quizzes
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 7. RLS POLICIES FOR PRODUCT QUIZ ATTEMPTS
DROP POLICY IF EXISTS "Users can read own product quiz attempts" ON public.product_quiz_attempts;
CREATE POLICY "Users can read own product quiz attempts" ON public.product_quiz_attempts
    FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Users can submit own product quiz attempts" ON public.product_quiz_attempts;
CREATE POLICY "Users can submit own product quiz attempts" ON public.product_quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

-- 8. STORAGE BUCKET FOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read for product images" ON storage.objects;
CREATE POLICY "Public read for product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users upload product images" ON storage.objects;
CREATE POLICY "Authenticated users upload product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
