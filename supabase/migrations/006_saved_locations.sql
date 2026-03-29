-- Saved locations for customers (Home, Work, etc.)
CREATE TABLE public.saved_locations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label       text NOT NULL,                 -- "Home", "Work", "Gym", etc.
  address     text NOT NULL,
  lat         numeric(10,7) NOT NULL,
  lng         numeric(10,7) NOT NULL,
  notes       text,                          -- parking notes, gate code, etc.
  is_default  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_saved_locations_customer ON public.saved_locations(customer_id);

-- RLS
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;

-- Customers can only see/manage their own locations
CREATE POLICY "Users can read own saved locations"
  ON public.saved_locations FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own saved locations"
  ON public.saved_locations FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own saved locations"
  ON public.saved_locations FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete own saved locations"
  ON public.saved_locations FOR DELETE
  USING (auth.uid() = customer_id);
