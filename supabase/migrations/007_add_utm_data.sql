-- Add UTM tracking data to customer_profiles
-- Stores the marketing attribution params that brought each customer to Driveo
ALTER TABLE public.customer_profiles
  ADD COLUMN IF NOT EXISTS utm_data jsonb DEFAULT NULL;

COMMENT ON COLUMN public.customer_profiles.utm_data IS
  'UTM marketing attribution: {utm_source, utm_medium, utm_campaign, utm_content, utm_term}';
