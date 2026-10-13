-- ==============================================================================
-- SUPABASE DATABASE MIGRATION SCRIPT FOR DARUL ULOOM NOORANI MADRASA
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLE: daily_lessons
CREATE TABLE IF NOT EXISTS public.daily_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_date DATE NOT NULL,
    category TEXT NOT NULL DEFAULT 'noorani',
    class_level TEXT NOT NULL DEFAULT 'shishu',
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_category_class_date UNIQUE (category, class_level, lesson_date)
);

-- 3. CREATE TABLE: lesson_items
CREATE TABLE IF NOT EXISTS public.lesson_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_lesson_id UUID NOT NULL REFERENCES public.daily_lessons(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL CHECK (section_type IN ('madrasah', 'home')),
    item_order INTEGER NOT NULL DEFAULT 1,
    lesson_text TEXT NOT NULL,
    book_name TEXT,
    teacher_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_daily_lessons_public
ON public.daily_lessons (category, class_level, published, lesson_date DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_items_daily_lesson
ON public.lesson_items (daily_lesson_id, section_type, item_order ASC);

-- 5. TRIGGER FOR AUTOMATIC UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_daily_lessons_updated_at ON public.daily_lessons;
CREATE TRIGGER trg_daily_lessons_updated_at
    BEFORE UPDATE ON public.daily_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_lesson_items_updated_at ON public.lesson_items;
CREATE TRIGGER trg_lesson_items_updated_at
    BEFORE UPDATE ON public.lesson_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES FOR PUBLIC READ ACCESS
ALTER TABLE public.daily_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_items ENABLE ROW LEVEL SECURITY;

-- Allow public unauthenticated read access to published daily lessons
DROP POLICY IF EXISTS "Public users can view published daily lessons" ON public.daily_lessons;
CREATE POLICY "Public users can view published daily lessons"
ON public.daily_lessons
FOR SELECT
USING (published = true);

-- Allow public unauthenticated read access to items of published daily lessons
DROP POLICY IF EXISTS "Public users can view lesson items of published daily lessons" ON public.lesson_items;
CREATE POLICY "Public users can view lesson items of published daily lessons"
ON public.lesson_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.daily_lessons
        WHERE public.daily_lessons.id = lesson_items.daily_lesson_id
        AND public.daily_lessons.published = true
    )
);
