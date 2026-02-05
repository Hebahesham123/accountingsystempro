-- Restore Data from Backup
-- This script template shows how to restore data from a backup file
-- 
-- IMPORTANT: Before restoring, consider:
-- 1. Do you want to restore to a new database or overwrite existing?
-- 2. Do you want to keep existing data or replace it?
-- 3. Have you backed up current data before restoring?

-- ============================================
-- OPTION 1: RESTORE TO EMPTY DATABASE
-- ============================================
-- If restoring to a fresh database, just run your backup .sql file
-- The INSERT statements will create all the data

-- ============================================
-- OPTION 2: RESTORE TO EXISTING DATABASE (Safe - Keeps existing data)
-- ============================================

-- Use INSERT ... ON CONFLICT DO NOTHING to avoid duplicates
-- Example for users:
-- INSERT INTO users (id, email, name, role, pin, created_at, updated_at)
-- VALUES (...)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- OPTION 3: RESTORE TO EXISTING DATABASE (Overwrite - Replaces existing data)
-- ============================================

-- Step 1: Delete existing data (CAREFUL - This deletes everything!)
-- Uncomment only if you want to completely replace data

/*
-- Delete in reverse order of dependencies
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM opening_balances;
DELETE FROM purchase_orders;
DELETE FROM audit_trail;
DELETE FROM projects;
DELETE FROM accounts;
DELETE FROM account_types;
DELETE FROM accounting_periods;
-- Keep users or delete them too:
-- DELETE FROM users;
*/

-- Step 2: Run your backup INSERT statements

-- ============================================
-- VERIFICATION AFTER RESTORE
-- ============================================

-- Check record counts
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'account_types', COUNT(*) FROM account_types
UNION ALL
SELECT 'accounts', COUNT(*) FROM accounts
UNION ALL
SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL
SELECT 'journal_entry_lines', COUNT(*) FROM journal_entry_lines
UNION ALL
SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'accounting_periods', COUNT(*) FROM accounting_periods
UNION ALL
SELECT 'opening_balances', COUNT(*) FROM opening_balances
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'audit_trail', COUNT(*) FROM audit_trail
ORDER BY table_name;

-- ============================================
-- NOTES
-- ============================================
-- 
-- RESTORE PROCEDURE:
-- 
-- 1. Open your backup .sql file (e.g., backup-2024-01-15.sql)
-- 2. Copy all INSERT statements
-- 3. Paste into Supabase SQL Editor
-- 4. Run the script
-- 5. Verify data using the verification queries above
-- 
-- IF RESTORING TO PRODUCTION:
-- - Always backup current production data first!
-- - Test restore on a development database first
-- - Verify all data is correct before going live
-- 
-- ============================================




