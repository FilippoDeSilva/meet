-- Meeting Recordings Table
CREATE TABLE IF NOT EXISTS meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  recording_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_user_id ON meeting_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_created_at ON meeting_recordings(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own recordings
CREATE POLICY "Users can view their own recordings"
  ON meeting_recordings
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own recordings
CREATE POLICY "Users can insert their own recordings"
  ON meeting_recordings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own recordings
CREATE POLICY "Users can update their own recordings"
  ON meeting_recordings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own recordings
CREATE POLICY "Users can delete their own recordings"
  ON meeting_recordings
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Anyone can view public recordings
CREATE POLICY "Anyone can view public recordings"
  ON meeting_recordings
  FOR SELECT
  USING (is_public = TRUE);
