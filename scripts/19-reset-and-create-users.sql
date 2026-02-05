-- Reset and Create Production Users from Scratch
-- This script deletes all existing users and creates fresh ones
-- WARNING: This will delete ALL users in the database!

-- Step 1: Delete all existing users
DELETE FROM users;

-- Step 2: Ensure PIN column exists
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

-- Step 3: Create Admin User (Full Access - Can edit users and set permissions)
INSERT INTO users (id, name, email, role, pin, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin', 'admin@gmail.com', 'admin', '1234', NOW(), NOW());

-- Step 4: Create Accountant1 User (Can view and edit accounting data)
INSERT INTO users (id, name, email, role, pin, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000002', 'Accountant1', 'accountant@gmail.com', 'accountant', '5678', NOW(), NOW());

-- Step 5: Create Regular User (View Only - Cannot edit)
INSERT INTO users (id, name, email, role, pin, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000003', 'User', 'user@gmail.com', 'user', '9012', NOW(), NOW());

-- Step 6: Verify all users were created successfully
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

-- Step 7: Show summary
SELECT 
  role,
  COUNT(*) as user_count,
  STRING_AGG(name, ', ') as user_names
FROM users
GROUP BY role
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'accountant' THEN 2 
    WHEN 'user' THEN 3 
  END;




