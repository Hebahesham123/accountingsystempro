-- Production Users Setup
-- This script creates/updates 4 production users with real email addresses and PINs
-- Run this script after running scripts/17-add-pin-to-users.sql

-- Ensure PIN column exists (from script 17)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'pin'
    ) THEN
        ALTER TABLE users ADD COLUMN pin VARCHAR(10);
    END IF;
END $$;

-- Update or Insert Admin User (Full Access - Can edit users and set permissions)
-- First try to update if exists by email
UPDATE users 
SET 
  name = 'Admin', 
  role = 'admin', 
  pin = '1234', 
  updated_at = NOW()
WHERE email = 'admin@gmail.com';

-- If no rows were updated, insert new user
INSERT INTO users (id, name, email, role, pin)
SELECT 
  '00000000-0000-0000-0000-000000000001', 
  'Admin', 
  'admin@gmail.com', 
  'admin', 
  '1234'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@gmail.com');

-- Update or Insert Accountant1 User (Can view and edit accounting data)
UPDATE users 
SET 
  name = 'Accountant1', 
  role = 'accountant', 
  pin = '5678', 
  updated_at = NOW()
WHERE email = 'accountant@gmail.com';

INSERT INTO users (id, name, email, role, pin)
SELECT 
  '00000000-0000-0000-0000-000000000002', 
  'Accountant1', 
  'accountant@gmail.com', 
  'accountant', 
  '5678'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'accountant@gmail.com');

-- Update or Insert Regular User (View Only - Cannot edit)
UPDATE users 
SET 
  name = 'User', 
  role = 'user', 
  pin = '9012', 
  updated_at = NOW()
WHERE email = 'user@gmail.com';

INSERT INTO users (id, name, email, role, pin)
SELECT 
  '00000000-0000-0000-0000-000000000003', 
  'User', 
  'user@gmail.com', 
  'user', 
  '9012'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@gmail.com');

-- Verify all users were created/updated
SELECT 
  id, 
  name, 
  email, 
  role, 
  CASE WHEN pin IS NOT NULL THEN '***' || RIGHT(pin, 1) ELSE 'No PIN' END as pin_preview,
  created_at,
  updated_at
FROM users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'accountant' THEN 2 
    WHEN 'user' THEN 3 
  END, 
  name;

-- Summary
SELECT 
  role,
  COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'accountant' THEN 2 
    WHEN 'user' THEN 3 
  END;

