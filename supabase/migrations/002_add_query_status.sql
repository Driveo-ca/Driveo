-- Add 'query' to washer_profiles status check constraint
ALTER TABLE washer_profiles DROP CONSTRAINT IF EXISTS washer_profiles_status_check;
ALTER TABLE washer_profiles ADD CONSTRAINT washer_profiles_status_check
  CHECK (status IN ('pending','approved','suspended','rejected','query'));
