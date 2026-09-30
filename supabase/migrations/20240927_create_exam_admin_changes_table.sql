-- Create exam_admin_changes table to store admin modifications to exams
CREATE TABLE IF NOT EXISTS exam_admin_changes (
  exam_id TEXT PRIMARY KEY,
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed', 'inactive', 'active', 'disabled', 'scheduled')),
  password TEXT,
  editableTitle TEXT,
  totalMarks INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Enable Row Level Security
ALTER TABLE exam_admin_changes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (ignore errors)
DROP POLICY IF EXISTS "Allow read access to exam_admin_changes" ON exam_admin_changes;
DROP POLICY IF EXISTS "Allow admins to update exam_admin_changes" ON exam_admin_changes;

-- Create policy to allow read access to exam_admin_changes
CREATE POLICY "Allow read access to exam_admin_changes" ON exam_admin_changes
  FOR SELECT
  USING (true);

-- Create policy to allow admins to update exam_admin_changes
CREATE POLICY "Allow admins to update exam_admin_changes" ON exam_admin_changes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portal_admins
      WHERE admin_id = auth.uid()::text AND is_active = true
    )
  );
