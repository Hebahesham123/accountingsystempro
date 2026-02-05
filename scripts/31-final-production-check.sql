-- Final Production Readiness Check
-- Run this script to verify everything is ready for real users

-- ============================================
-- 1. CHECK RLS IS ENABLED (CRITICAL)
-- ============================================
SELECT 
  'RLS Status' as check_name,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✓ Enabled'
    ELSE '✗ DISABLED - RUN scripts/26-enable-rls-policies.sql'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'account_types', 'accounts', 'accounting_periods',
    'journal_entries', 'journal_entry_lines', 'opening_balances',
    'audit_trail', 'projects', 'purchase_orders'
  )
ORDER BY rowsecurity, tablename;

-- ============================================
-- 2. CHECK FOREIGN KEYS FOR USER DELETION
-- ============================================
SELECT 
  'Foreign Key Check' as check_name,
  tc.table_name,
  kcu.column_name,
  CASE 
    WHEN rc.delete_rule = 'SET NULL' THEN '✓ OK'
    WHEN rc.delete_rule = 'NO ACTION' THEN '✗ FIX NEEDED - RUN scripts/30-fix-user-deletion-foreign-keys.sql'
    ELSE '⚠ ' || rc.delete_rule
  END as delete_rule_status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 3. CHECK PRODUCTION USERS EXIST
-- ============================================
SELECT 
  'Production Users' as check_name,
  email,
  name,
  role,
  CASE 
    WHEN pin IS NULL THEN '✗ NO PIN'
    WHEN pin = '1234' AND email NOT LIKE '%@gmail.com' THEN '⚠ TEMPORARY PIN'
    ELSE '✓ OK'
  END as pin_status
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
-- 4. CHECK TEST USERS (Should be removed)
-- ============================================
SELECT 
  'Test Users Check' as check_name,
  email,
  name,
  role,
  CASE 
    WHEN email IN ('admin@gmail.com', 'accountant@gmail.com', 'user@gmail.com') 
    THEN '⚠ TEST USER - Consider deleting'
    ELSE '✓ OK'
  END as status
FROM users
WHERE email IN ('admin@gmail.com', 'accountant@gmail.com', 'user@gmail.com');

-- ============================================
-- 5. CHECK PURCHASE ORDERS STATUS CONSTRAINT
-- ============================================
SELECT 
  'Purchase Orders Status' as check_name,
  conname as constraint_name,
  CASE 
    WHEN pg_get_constraintdef(oid) LIKE '%supply_done%' THEN '✓ OK - supply_done included'
    ELSE '⚠ Check if supply_done is in constraint'
  END as status,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'purchase_orders'::regclass
  AND conname LIKE '%status%';

-- ============================================
-- 6. SUMMARY REPORT
-- ============================================
SELECT 
  '=== PRODUCTION READINESS SUMMARY ===' as summary;

-- RLS Status
SELECT 
  'RLS Enabled Tables' as metric,
  COUNT(*) FILTER (WHERE rowsecurity = true) || ' / ' || COUNT(*) as value
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'account_types', 'accounts', 'accounting_periods',
    'journal_entries', 'journal_entry_lines', 'opening_balances',
    'audit_trail', 'projects', 'purchase_orders'
  );

-- Production Users Count
SELECT 
  'Production Users' as metric,
  COUNT(*)::text as value
FROM users
WHERE email IN (
  'ayayounes139@icloud.com',
  'ahmednassar701@gmail.com',
  'eliteeee1010@gmail.com',
  'acc.abdelrahman.saberr@gmail.com',
  'samhmoha@gmail.com'
);

-- Test Users Count
SELECT 
  'Test Users (should be 0)' as metric,
  COUNT(*)::text as value
FROM users
WHERE email IN ('admin@gmail.com', 'accountant@gmail.com', 'user@gmail.com');

-- Foreign Keys Status
SELECT 
  'Foreign Keys with SET NULL' as metric,
  COUNT(*) FILTER (WHERE rc.delete_rule = 'SET NULL') || ' / ' || COUNT(*) as value
FROM information_schema.table_constraints AS tc
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage AS ccu
    WHERE ccu.constraint_name = tc.constraint_name
    AND ccu.table_name = 'users'
  );

-- ============================================
-- 7. FINAL CHECKLIST
-- ============================================
SELECT 
  '=== FINAL CHECKLIST ===' as checklist;

SELECT 
  CASE 
    WHEN COUNT(*) FILTER (WHERE rowsecurity = false) = 0 
    THEN '✓ RLS enabled on all tables'
    ELSE '✗ RLS NOT enabled - RUN scripts/26-enable-rls-policies.sql'
  END as item
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'account_types', 'accounts', 'accounting_periods',
    'journal_entries', 'journal_entry_lines', 'opening_balances',
    'audit_trail', 'projects', 'purchase_orders'
  )

UNION ALL

SELECT 
  CASE 
    WHEN COUNT(*) FILTER (WHERE rc.delete_rule != 'SET NULL') = 0
    THEN '✓ All user foreign keys allow deletion'
    ELSE '✗ Foreign keys need fixing - RUN scripts/30-fix-user-deletion-foreign-keys.sql'
  END
FROM information_schema.table_constraints AS tc
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage AS ccu
    WHERE ccu.constraint_name = tc.constraint_name
    AND ccu.table_name = 'users'
  )

UNION ALL

SELECT 
  CASE 
    WHEN COUNT(*) = 5
    THEN '✓ All 5 production users created'
    ELSE '✗ Production users missing - RUN scripts/29-create-production-users.sql'
  END
FROM users
WHERE email IN (
  'ayayounes139@icloud.com',
  'ahmednassar701@gmail.com',
  'eliteeee1010@gmail.com',
  'acc.abdelrahman.saberr@gmail.com',
  'samhmoha@gmail.com'
)

UNION ALL

SELECT 
  CASE 
    WHEN COUNT(*) = 0
    THEN '✓ Test users removed (or not present)'
    ELSE '⚠ Test users still exist - Consider deleting them'
  END
FROM users
WHERE email IN ('admin@gmail.com', 'accountant@gmail.com', 'user@gmail.com');

-- ============================================
-- NOTES
-- ============================================
-- 
-- If all checks pass (all show ✓):
-- ✅ System is ready for production!
-- 
-- If any checks fail (show ✗):
-- 1. Run the suggested SQL script
-- 2. Re-run this verification script
-- 3. Repeat until all checks pass
--
-- If warnings appear (show ⚠):
-- - Review and decide if action is needed
-- - Test users can be kept for testing, but consider removing
-- ============================================




