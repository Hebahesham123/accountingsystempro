-- Add PIN field to users table for authentication
-- This allows users to login with email and PIN

-- Add PIN column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'pin'
    ) THEN
        ALTER TABLE users ADD COLUMN pin VARCHAR(10);
        COMMENT ON COLUMN users.pin IS 'PIN code for user authentication (4-10 digits)';
    END IF;
END $$;

-- Update existing users with PINs if they don't have one
UPDATE users SET pin = '1234' WHERE email = 'admin@gmail.com' AND pin IS NULL;
UPDATE users SET pin = '5678' WHERE email = 'accountant@gmail.com' AND pin IS NULL;
UPDATE users SET pin = '9012' WHERE email = 'user@gmail.com' AND pin IS NULL;

-- Also update old example.com emails if they exist
UPDATE users SET pin = '1234' WHERE email = 'admin@example.com' AND pin IS NULL;
UPDATE users SET pin = '5678' WHERE email = 'accountant@example.com' AND pin IS NULL;
UPDATE users SET pin = '9012' WHERE email = 'test1@example.com' AND pin IS NULL;

-- Verify PINs were added
SELECT id, name, email, role, pin IS NOT NULL as has_pin FROM users ORDER BY role, name;

