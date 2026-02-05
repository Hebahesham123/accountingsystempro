-- Quick Backup Verification
-- Run this before and after backups to verify data integrity

-- ============================================
-- DATA COUNTS (Before Backup)
-- ============================================
SELECT 
  '=== DATA COUNTS ===' as section;

SELECT 
  'users' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM users

UNION ALL

SELECT 
  'journal_entries',
  COUNT(*),
  MIN(created_at),
  MAX(created_at)
FROM journal_entries

UNION ALL

SELECT 
  'purchase_orders',
  COUNT(*),
  MIN(created_at),
  MAX(created_at)
FROM purchase_orders

UNION ALL

SELECT 
  'accounts',
  COUNT(*),
  MIN(created_at),
  MAX(created_at)
FROM accounts

ORDER BY table_name;

-- ============================================
-- DATA INTEGRITY CHECKS
-- ============================================
SELECT 
  '=== DATA INTEGRITY ===' as section;

-- Check for orphaned journal entry lines
SELECT 
  'Orphaned Journal Entry Lines' as check_name,
  COUNT(*) as count
FROM journal_entry_lines jel
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.id IS NULL;

-- Check for orphaned accounts
SELECT 
  'Orphaned Accounts (no account type)' as check_name,
  COUNT(*) as count
FROM accounts a
LEFT JOIN account_types at ON a.account_type_id = at.id
WHERE a.account_type_id IS NOT NULL AND at.id IS NULL;

-- Check for purchase orders with invalid status
SELECT 
  'Purchase Orders with Invalid Status' as check_name,
  COUNT(*) as count
FROM purchase_orders
WHERE status NOT IN ('pending', 'first_approved', 'approved', 'rejected', 'supply_done');

-- Check for users without PINs
SELECT 
  'Users without PIN' as check_name,
  COUNT(*) as count
FROM users
WHERE pin IS NULL OR pin = '';

-- ============================================
-- FINANCIAL DATA CHECKS
-- ============================================
SELECT 
  '=== FINANCIAL DATA ===' as section;

-- Total journal entries
SELECT 
  'Total Journal Entries' as metric,
  COUNT(*)::text as value
FROM journal_entries

UNION ALL

-- Total purchase orders amount
SELECT 
  'Total Purchase Orders Amount',
  COALESCE(SUM(amount), 0)::text
FROM purchase_orders

UNION ALL

-- Total accounts
SELECT 
  'Total Accounts',
  COUNT(*)::text
FROM accounts

UNION ALL

-- Active accounts
SELECT 
  'Active Accounts',
  COUNT(*)::text
FROM accounts
WHERE is_active = true;

-- ============================================
-- BACKUP RECOMMENDATIONS
-- ============================================
SELECT 
  '=== BACKUP STATUS ===' as section;

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Data exists - Backup recommended'
    ELSE '⚠ No data - Backup not needed'
  END as backup_status,
  'Last backup: [Check your backup files]' as last_backup_date
FROM users;

-- ============================================
-- NOTES
-- ============================================
-- 
-- Run this script:
-- 1. Before creating a backup (to know what you're backing up)
-- 2. After restoring from backup (to verify restore was successful)
-- 3. Weekly (to monitor data growth)
-- 
-- If any integrity checks show issues:
-- - Investigate before backup/restore
-- - Fix data issues first
-- - Then create fresh backup
-- 
-- ============================================




