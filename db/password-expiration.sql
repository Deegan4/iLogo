-- Create a password_policies table to store global settings
CREATE TABLE IF NOT EXISTS auth.password_policies (
  id SERIAL PRIMARY KEY,
  policy_name VARCHAR(255) NOT NULL UNIQUE,
  policy_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default password expiration policy (90 days)
INSERT INTO auth.password_policies (policy_name, policy_value)
VALUES ('password_expiration', '{"days": 90, "enabled": true}')
ON CONFLICT (policy_name) DO NOTHING;

-- Add password_last_changed and password_expires_at columns to auth.users if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'auth' AND table_name = 'users' 
                AND column_name = 'password_last_changed') THEN
    ALTER TABLE auth.users ADD COLUMN password_last_changed TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'auth' AND table_name = 'users' 
                AND column_name = 'password_expires_at') THEN
    ALTER TABLE auth.users ADD COLUMN password_expires_at TIMESTAMPTZ;
  END IF;
END$$;

-- Create a function to update password_expires_at when password changes
CREATE OR REPLACE FUNCTION auth.set_password_expiration()
RETURNS TRIGGER AS $$
DECLARE
  expiration_days INTEGER;
  is_enabled BOOLEAN;
BEGIN
  -- Get the current expiration policy
  SELECT 
    (policy_value->>'days')::INTEGER,
    (policy_value->>'enabled')::BOOLEAN
  INTO expiration_days, is_enabled
  FROM auth.password_policies
  WHERE policy_name = 'password_expiration';
  
  -- Set default values if policy not found
  expiration_days := COALESCE(expiration_days, 90);
  is_enabled := COALESCE(is_enabled, true);
  
  -- Update the password change timestamp
  NEW.password_last_changed := NOW();
  
  -- Set the expiration date if enabled
  IF is_enabled THEN
    NEW.password_expires_at := NOW() + (expiration_days || ' days')::INTERVAL;
  ELSE
    NEW.password_expires_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update password expiration when encrypted_password changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_password_expiration' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER update_password_expiration
    BEFORE UPDATE OF encrypted_password ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.set_password_expiration();
  END IF;
END$$;

-- Update existing users to set initial password expiration
UPDATE auth.users
SET 
  password_last_changed = COALESCE(password_last_changed, updated_at),
  password_expires_at = COALESCE(
    password_expires_at, 
    updated_at + ((SELECT (policy_value->>'days')::INTEGER FROM auth.password_policies WHERE policy_name = 'password_expiration') || ' days')::INTERVAL
  )
WHERE encrypted_password IS NOT NULL;

-- Create a function to check if a password has expired
CREATE OR REPLACE FUNCTION auth.has_password_expired(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_expired BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN u.password_expires_at IS NULL THEN false
      WHEN u.password_expires_at < NOW() THEN true
      ELSE false
    END INTO is_expired
  FROM auth.users u
  WHERE u.id = user_id;
  
  RETURN COALESCE(is_expired, false);
END;
$$ LANGUAGE plpgsql;
