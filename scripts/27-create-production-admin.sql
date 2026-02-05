-- Create Production Admin User
-- Run this script to create your production admin account
-- IMPORTANT: Change the email and PIN before running!

-- Option 1: Create new admin (if email doesn't exist)
INSERT INTO users (email, name, role, pin, created_at, updated_at)
VALUES (
  'admin@yourcompany.com',  -- CHANGE THIS to your admin email
  'Administrator',           -- CHANGE THIS to admin name
  'admin',
  '1234',                    -- CHANGE THIS to a secure PIN (minimum 4 digits)
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Option 2: Update existing user to admin (if user already exists)
-- UPDATE users 
-- SET role = 'admin', 
--     pin = '1234',  -- CHANGE THIS to a secure PIN
--     updated_at = NOW()
-- WHERE email = 'admin@yourcompany.com';  -- CHANGE THIS to your admin email

-- Verify the admin was created
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'admin@yourcompany.com';  -- CHANGE THIS to your admin email

-- Optional: Remove test users (uncomment if you want to remove them)
-- DELETE FROM users WHERE email IN (
--   'admin@gmail.com',
--   'accountant@gmail.com',
--   'user@gmail.com'
-- );




