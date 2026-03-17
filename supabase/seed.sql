-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — Seed Data
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════
-- SUBSCRIPTION PLANS
-- ═══════════════════════════════════════

INSERT INTO public.subscription_plans (name, slug, wash_plan, monthly_price, washes_per_month, description, is_active, display_order)
VALUES
  (
    'Regular Monthly',
    'regular-monthly',
    'regular',
    11900,           -- $119/month in cents
    8,
    'Exterior hand wash, tire & rim cleaning, and window cleaning. 8 washes per month.',
    true,
    1
  ),
  (
    'Interior & Exterior Monthly',
    'interior-exterior-monthly',
    'interior_exterior',
    15900,           -- $159/month in cents
    8,
    'Full exterior wash plus interior vacuum, wipe-down, and dashboard detail. 8 washes per month.',
    true,
    2
  ),
  (
    'Detailing Monthly',
    'detailing-monthly',
    'detailing',
    99900,           -- $999/month in cents
    8,
    'Premium detailing including paint correction, clay bar treatment, and interior deep clean. 8 washes per month.',
    true,
    3
  );

-- ═══════════════════════════════════════
-- SERVICE ZONES (GTA Launch Areas)
-- ═══════════════════════════════════════

INSERT INTO public.service_zones (name, postal_prefixes, is_active, launch_date)
VALUES
  (
    'Etobicoke',
    ARRAY['M8', 'M9'],
    true,
    '2026-04-01'
  ),
  (
    'Mississauga Central',
    ARRAY['L4Z', 'L5B'],
    true,
    '2026-04-01'
  ),
  (
    'Mississauga East',
    ARRAY['L5G', 'L5J'],
    true,
    '2026-04-01'
  );
