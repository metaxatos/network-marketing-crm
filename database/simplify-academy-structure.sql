-- Migration: Simplify Academy Structure
-- This migration removes duplicate academy tables and keeps only the simpler structure

-- Step 1: Drop the unnecessary complex structure tables
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS member_course_progress CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS training_courses CASCADE;

-- Step 2: Ensure training_videos has proper structure
-- Check if module_id column exists and is properly linked
ALTER TABLE training_videos 
  DROP COLUMN IF EXISTS module_id CASCADE;

-- Ensure course_id foreign key is properly set
ALTER TABLE training_videos
  DROP CONSTRAINT IF EXISTS training_videos_course_id_fkey;

ALTER TABLE training_videos
  ADD CONSTRAINT training_videos_course_id_fkey 
  FOREIGN KEY (course_id) 
  REFERENCES courses(id) 
  ON DELETE SET NULL;

-- Step 3: Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_videos_course_id ON training_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_training_videos_company_id ON training_videos(company_id);
CREATE INDEX IF NOT EXISTS idx_training_videos_order ON training_videos(order_index);

CREATE INDEX IF NOT EXISTS idx_member_progress_member_video ON member_progress(member_id, video_id);
CREATE INDEX IF NOT EXISTS idx_member_progress_completed ON member_progress(completed);

-- Step 4: Update RLS policies for member_progress if needed
ALTER TABLE member_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Members can view own progress" ON member_progress;
DROP POLICY IF EXISTS "Members can update own progress" ON member_progress;
DROP POLICY IF EXISTS "Members can insert own progress" ON member_progress;

-- Create new policies
CREATE POLICY "Members can view own progress" ON member_progress
  FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Members can update own progress" ON member_progress
  FOR UPDATE
  USING (auth.uid() = member_id);

CREATE POLICY "Members can insert own progress" ON member_progress
  FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- Step 5: Add helpful view for course with videos
CREATE OR REPLACE VIEW course_with_videos AS
SELECT 
  c.id as course_id,
  c.title as course_title,
  c.description as course_description,
  c.cover_image,
  c.is_published as course_published,
  tv.id as video_id,
  tv.title as video_title,
  tv.description as video_description,
  tv.video_url,
  tv.video_platform,
  tv.thumbnail_url,
  tv.duration_seconds,
  tv.module_name,
  tv.module_order,
  tv.lesson_order,
  tv.order_index,
  tv.is_required,
  tv.is_published as video_published
FROM courses c
LEFT JOIN training_videos tv ON tv.course_id = c.id
WHERE c.is_published = true AND tv.is_published = true
ORDER BY c.order_index, tv.module_order, tv.lesson_order, tv.order_index;

-- Grant access to the view
GRANT SELECT ON course_with_videos TO authenticated;

-- Step 6: Add comment to document the structure
COMMENT ON TABLE courses IS 'Main courses table - contains course metadata';
COMMENT ON TABLE training_videos IS 'Training videos/lessons - can be standalone or linked to a course via course_id. Use module_name to group videos within a course';
COMMENT ON TABLE member_progress IS 'Tracks member progress on individual training videos';
COMMENT ON COLUMN training_videos.course_id IS 'Links video to a course (NULL for standalone videos)';
COMMENT ON COLUMN training_videos.module_name IS 'Groups videos into modules within a course';
COMMENT ON COLUMN training_videos.module_order IS 'Order of the module within the course';
COMMENT ON COLUMN training_videos.lesson_order IS 'Order of the lesson within the module'; 