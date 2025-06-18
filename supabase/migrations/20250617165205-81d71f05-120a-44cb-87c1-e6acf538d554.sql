
-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  codeforces_handle TEXT UNIQUE NOT NULL,
  current_rating INTEGER DEFAULT 0,
  max_rating INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  reminder_emails_sent INTEGER DEFAULT 0,
  email_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contests table
CREATE TABLE public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  contest_id TEXT NOT NULL,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  rank INTEGER,
  rating_change INTEGER DEFAULT 0,
  new_rating INTEGER,
  problems_solved INTEGER DEFAULT 0,
  total_problems INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create problems table
CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER,
  solved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verdict TEXT CHECK (verdict IN ('OK', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR')),
  contest_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sync_logs table to track data synchronization
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('scheduled', 'manual', 'handle_update')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  contests_synced INTEGER DEFAULT 0,
  problems_synced INTEGER DEFAULT 0
);

-- Create app_settings table for configuration
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_time TIME DEFAULT '02:00',
  sync_frequency TEXT DEFAULT 'daily' CHECK (sync_frequency IN ('daily', 'twiceDaily', 'weekly')),
  auto_email_enabled BOOLEAN DEFAULT true,
  inactivity_threshold_days INTEGER DEFAULT 7,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.app_settings (sync_time, sync_frequency, auto_email_enabled, inactivity_threshold_days)
VALUES ('02:00', 'daily', true, 7);

-- Create indexes for better performance
CREATE INDEX idx_students_handle ON public.students(codeforces_handle);
CREATE INDEX idx_students_active ON public.students(is_active);
CREATE INDEX idx_contests_student_date ON public.contests(student_id, date DESC);
CREATE INDEX idx_problems_student_solved ON public.problems(student_id, solved_at DESC);
CREATE INDEX idx_problems_rating ON public.problems(rating);
CREATE INDEX idx_sync_logs_student ON public.sync_logs(student_id, synced_at DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_students_updated_at 
  BEFORE UPDATE ON public.students 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at 
  BEFORE UPDATE ON public.app_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (we'll make everything public since no auth is needed)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since no auth required)
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on contests" ON public.contests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on problems" ON public.problems FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sync_logs" ON public.sync_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
