-- Run this SQL in your Supabase dashboard SQL Editor
-- at https://supabase.com/dashboard/project/kccrpozqbtrdwrldddcd/sql

-- Create exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  description TEXT,
  scheduled_date DATE,
  status TEXT NOT NULL CHECK (status IN ('active', 'ongoing', 'upcoming', 'completed', 'inactive')),
  stream TEXT CHECK (stream IN ('natural', 'social')),
  password TEXT,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Create policies for exams
CREATE POLICY "Enable read access for all users" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.exams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.exams FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.exams FOR DELETE USING (auth.role() = 'authenticated');

-- Create exam_results table
CREATE TABLE IF NOT EXISTS public.exam_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage NUMERIC NOT NULL,
  answers JSONB,
  flagged_questions TEXT[],
  time_spent INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  results_visible BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'cancelled'))
);

-- Enable RLS for exam_results
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Create policies for exam_results
CREATE POLICY "Enable read access for all users" ON public.exam_results FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.exam_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.exam_results FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.exam_results FOR DELETE USING (auth.role() = 'authenticated');

-- Create programmes table
CREATE TABLE IF NOT EXISTS public.programmes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  stream TEXT NOT NULL CHECK (stream IN ('natural', 'social')),
  grade_level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  exam_date DATE,
  start_time TIME,
  end_time TIME,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for programmes
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;

-- Create policies for programmes
CREATE POLICY "Enable read access for all users" ON public.programmes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.programmes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.programmes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.programmes FOR DELETE USING (auth.role() = 'authenticated');

-- Create violations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.violations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  admission_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tab_switch', 'copy_attempt', 'paste_attempt', 'fullscreen_exit', 'suspicious_activity', 'screenshot_attempt')),
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high'))
);

-- Enable RLS for violations
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Create policies for violations
CREATE POLICY "Enable read access for all users" ON public.violations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.violations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.violations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.violations FOR DELETE USING (auth.role() = 'authenticated');
