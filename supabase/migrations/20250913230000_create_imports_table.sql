-- Create imports table for LeetCode/HackerRank data
CREATE TABLE public.imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  import_data JSONB,
  problems_count INTEGER NOT NULL DEFAULT 0,
  contest_rating INTEGER NOT NULL DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  last_synced TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own imports"
ON public.imports
FOR ALL
USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.imports
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- Indexes
CREATE INDEX idx_imports_user_id_platform ON public.imports(user_id, platform);
