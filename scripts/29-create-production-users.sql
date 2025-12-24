-- Create Production Users
-- This script creates all production users with their assigned roles
-- IMPORTANT: PINs will be sent via WhatsApp to the numbers provided

-- ============================================
-- ADMIN USERS
-- ============================================

-- Admin 1: المهندسة ايه (Engineer Aya)
INSERT INTO users (email, name, role, pin, created_at, updated_at)
VALUES (
  'ayayounes139@icloud.com',
  'المهندسة ايه',
  'admin',
  '5126',  -- TEMPORARY PIN - Send via WhatsApp: 01008015126
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    pin = EXCLUDED.pin,
    updated_at = NOW();

-- Admin 2: الدكتور احمد (Dr. Ahmed)
INSERT INTO users (email, name, role, pin, created_at, updated_at)
VALUES (
  'ahmednassar701@gmail.com',
  'الدكتور احمد',
  'admin',
  '2589',  -- TEMPORARY PIN - Send via WhatsApp
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    pin = EXCLUDED.pin,
    updated_at = NOW();

-- ============================================
-- ACCOUNTANT USERS (محاسب)
-- ============================================

-- Accountant 1
INSERT INTO users (email, name, role, pin, created_at, updated_at)
VALUES (
  'eliteeee1010@gmail.com',
  'محاسب 1',
  'accountant',
  '4317',  -- TEMPORARY PIN - Send via WhatsApp: 01040064317
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    pin = EXCLUDED.pin,
    updated_at = NOW();

-- Accountant 2
INSERT INTO users (email, name, role, pin, created_at, updated_at)
VALUES (
  'acc.abdelrahman.saberr@gmail.com',
  'محاسب 2',
  'accountant',
  '6360',  -- TEMPORARY PIN - Send via WhatsApp: 01095996360
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    pin = EXCLUDED.pin,
    updated_at = NOW();

-- ============================================
-- REGULAR USER (مدير المشتريات - Purchase Manager)
-- ============================================

-- Purchase Manager: مدير المشتريات
INSERT INTO users (email, name, role, pin, created_at, updated_at)
VALUES (
  'samhmoha@gmail.com',
  'مدير المشتريات',
  'user',
  '5572',  -- TEMPORARY PIN - Send via WhatsApp: 01128185572
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    pin = EXCLUDED.pin,
    updated_at = NOW();

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all users were created
SELECT 
  email,
  name,
  role,
  CASE 
    WHEN role = 'admin' THEN 'مدير'
    WHEN role = 'accountant' THEN 'محاسب'
    WHEN role = 'user' THEN 'مستخدم'
  END as role_arabic,
  created_at
FROM users
WHERE email IN (
  'ayayounes139@icloud.com',
  'ahmednassar701@gmail.com',
  'eliteeee1010@gmail.com',
  'acc.abdelrahman.saberr@gmail.com',
  'samhmoha@gmail.com'
)
ORDER BY role, email;

-- ============================================
-- USER SUMMARY
-- ============================================
SELECT 
  role,
  COUNT(*) as user_count
FROM users
WHERE email IN (
  'ayayounes139@icloud.com',
  'ahmednassar701@gmail.com',
  'eliteeee1010@gmail.com',
  'acc.abdelrahman.saberr@gmail.com',
  'samhmoha@gmail.com'
)
GROUP BY role
ORDER BY role;

-- ============================================
-- NOTES
-- ============================================
-- 
-- USER CREDENTIALS TO SEND VIA WHATSAPP:
--
-- 1. Admin - المهندسة ايه
--    Email: ayayounes139@icloud.com
--    PIN: 5126 (TEMPORARY - Change on first login)
--    WhatsApp: 01008015126
--
-- 2. Admin - الدكتور احمد
--    Email: ahmednassar701@gmail.com
--    PIN: 2589 (TEMPORARY - Change on first login)
--    WhatsApp: (Contact directly)
--
-- 3. Accountant 1 - محاسب 1
--    Email: eliteeee1010@gmail.com
--    PIN: 4317 (TEMPORARY - Change on first login)
--    WhatsApp: 01040064317
--
-- 4. Accountant 2 - محاسب 2
--    Email: acc.abdelrahman.saberr@gmail.com
--    PIN: 6360 (TEMPORARY - Change on first login)
--    WhatsApp: 01095996360
--
-- 5. Purchase Manager - مدير المشتريات
--    Email: samhmoha@gmail.com
--    PIN: 5572 (TEMPORARY - Change on first login)
--    WhatsApp: 01128185572
--
-- IMPORTANT:
-- - All users should change their PIN on first login
-- - Send credentials via WhatsApp to the numbers provided
-- - Consider generating unique PINs for each user for better security
-- ============================================

