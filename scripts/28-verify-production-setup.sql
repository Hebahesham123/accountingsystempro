-- Production Setup Verification Script
-- Run this script to verify your production database is properly configured

-- ============================================
-- 1. CHECK RLS IS ENABLED (CRITICAL)
-- ============================================
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: All tables should show "RLS Enabled" as true

-- ============================================
-- 2. CHECK ALL REQUIRED TABLES EXIST
-- ============================================
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'users', 'account_types', 'accounts', 'accounting_periods',
      'journal_entries', 'journal_entry_lines', 'opening_balances',
      'audit_trail', 'projects', 'purchase_orders'
    ) THEN '✓ Required'
    ELSE '⚠ Optional'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: All 10 required tables should exist

-- ============================================
-- 3. CHECK PURCHASE ORDERS STATUS CONSTRAINT
-- ============================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'purchase_orders'::regclass
  AND conname LIKE '%status%';

-- Expected: Should include 'supply_done' in status check

-- ============================================
-- 4. CHECK USERS TABLE STRUCTURE
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Expected: Should have id, email, name, role, pin, created_at, updated_at

-- ============================================
-- 5. CHECK FOR TEST USERS (Should be removed in production)
-- ============================================
SELECT 
  email,
  name,
  role,
  created_at
FROM users
WHERE email IN ('admin@gmail.com', 'accountant@gmail.com', 'user@gmail.com');

-- Expected: Should return 0 rows in production (or you should delete these)

-- ============================================
-- 6. CHECK ADMIN USERS EXIST
-- ============================================
SELECT 
  email,
  name,
  role,
  created_at
FROM users
WHERE role = 'admin';

-- Expected: Should have at least one admin user with your production email

-- ============================================
-- 7. CHECK FOREIGN KEY CONSTRAINTS
-- ============================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Expected: Should show all foreign key relationships

-- ============================================
-- 8. CHECK INDEXES (Performance)
-- ============================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected: Should have indexes on frequently queried columns

-- ============================================
-- 9. SUMMARY REPORT
-- ============================================
SELECT 
  'RLS Enabled Tables' as check_item,
  COUNT(*) FILTER (WHERE rowsecurity = true) || ' / ' || COUNT(*) as result
FROM pg_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Total Tables',
  COUNT(*)::text
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
  'Admin Users',
  COUNT(*)::text
FROM users
WHERE role = 'admin'
UNION ALL
SELECT 
  'Test Users (should be 0)',
  COUNT(*)::text
FROM users
WHERE email IN ('admin@gmail.com', 'accountant@gmail.com', 'user@gmail.com');

-- ============================================
-- NOTES
-- ============================================
-- If any checks fail:
-- 1. RLS not enabled: Run scripts/26-enable-rls-policies.sql
-- 2. Missing tables: Run the appropriate create table scripts
-- 3. Test users exist: Delete them or update to production emails
-- 4. No admin users: Run scripts/27-create-production-admin.sql

