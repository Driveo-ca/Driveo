-- Add UTM tracking data to customer_profiles for marketing attribution
ALTER TABLE public.customer_profiles
  ADD COLUMN IF NOT EXISTS utm_data jsonb;

COMMENT ON COLUMN public.customer_profiles.utm_data IS 'UTM parameters captured at signup (utm_source, utm_medium, utm_campaign, utm_term, utm_content)';
