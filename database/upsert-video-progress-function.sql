-- Atomic Video Progress Upsert Function
-- Prevents race conditions when multiple tabs update the same video progress

CREATE OR REPLACE FUNCTION upsert_video_progress(
  p_member_id UUID,
  p_video_id TEXT,
  p_progress_seconds INTEGER,
  p_completed BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Validate inputs
  IF p_member_id IS NULL OR p_video_id IS NULL OR p_progress_seconds < 0 THEN
    RAISE EXCEPTION 'Invalid input parameters';
  END IF;

  -- Upsert with conflict resolution
  INSERT INTO member_progress (
    member_id, 
    video_id, 
    progress_seconds, 
    completed, 
    last_watched_at,
    created_at,
    updated_at
  ) VALUES (
    p_member_id,
    p_video_id,
    p_progress_seconds,
    p_completed,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (member_id, video_id) 
  DO UPDATE SET
    -- Always take the maximum progress (prevents backwards progress)
    progress_seconds = GREATEST(member_progress.progress_seconds, p_progress_seconds),
    -- Mark as completed if either the existing or new record says it's completed
    completed = member_progress.completed OR p_completed,
    last_watched_at = NOW(),
    updated_at = NOW()
  RETURNING to_jsonb(member_progress.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error for debugging but don't expose details to client
    RAISE LOG 'upsert_video_progress error for member % video %: %', p_member_id, p_video_id, SQLERRM;
    RAISE EXCEPTION 'Failed to update video progress';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_video_progress(UUID, TEXT, INTEGER, BOOLEAN) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION upsert_video_progress IS 'Atomically updates video progress, preventing race conditions between multiple tabs/clients';

-- Example usage:
-- SELECT upsert_video_progress(
--   'user-uuid-here',
--   'video-123', 
--   150, -- progress in seconds
--   false -- not completed yet
-- ); 