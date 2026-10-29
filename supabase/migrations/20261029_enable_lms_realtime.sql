-- Enable Supabase Realtime for LMS tables so updates made on one device
-- can trigger refreshes on other connected devices.
-- Safe to re-run: only existing tables not already in the publication are added.

DO $$
DECLARE
  table_name TEXT;
  lms_tables TEXT[] := ARRAY[
    'profiles',
    'courses',
    'channels',
    'course_enrollments',
    'channel_access',
    'learning_progress',
    'admin_audit_logs',
    'company_news',
    'company_videos',
    'top_performers',
    'hod_motto',
    'ld_team_members',
    'license_chapters',
    'license_training_lessons',
    'license_quizzes',
    'license_quiz_questions',
    'license_quiz_attempts',
    'skill_categories',
    'skill_development_resources',
    'skill_quizzes',
    'skill_quiz_attempts',
    'product_knowledge_items',
    'product_quizzes',
    'product_quiz_attempts',
    'company_bulletins'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    RAISE NOTICE 'Publication supabase_realtime does not exist; skipping Realtime publication setup.';
    RETURN;
  END IF;

  FOREACH table_name IN ARRAY lms_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL
       AND NOT EXISTS (
         SELECT 1
         FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime'
           AND schemaname = 'public'
           AND tablename = table_name
       ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END $$;
