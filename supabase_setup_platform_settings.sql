-- Run this in your Supabase SQL Editor to enable the Launch Website feature

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default "not launched" state
INSERT INTO public.platform_settings (key, value)
VALUES ('is_launched', 'false')
ON CONFLICT (key) DO NOTHING;

-- Allow anyone to READ the launch state (so users on other browsers can see it)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform_settings"
  ON public.platform_settings FOR SELECT
  USING (true);

-- Only authenticated users can UPDATE (admin will be authenticated)
CREATE POLICY "Authenticated users can update platform_settings"
  ON public.platform_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can INSERT
CREATE POLICY "Authenticated users can insert platform_settings"
  ON public.platform_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Enable realtime so other browsers update instantly when admin clicks Launch
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_settings;
