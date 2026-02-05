-- Complete Data Backup Script
-- This script exports all your data in a format that can be restored
-- Run this regularly and save the output to a .sql file

-- ============================================
-- BACKUP USERS
-- ============================================
SELECT 
  '-- Users Backup' as backup_section,
  'INSERT INTO users (id, email, name, role, pin, created_at, updated_at) VALUES' as insert_statement;

SELECT 
  '(' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(email) || ', ' ||
  quote_literal(name) || ', ' ||
  quote_literal(role) || ', ' ||
  COALESCE(quote_literal(pin), 'NULL') || ', ' ||
  quote_literal(created_at::text) || ', ' ||
  quote_literal(COALESCE(updated_at::text, created_at::text)) ||
  ');' as backup_data
FROM users
ORDER BY created_at;

-- ============================================
-- BACKUP ACCOUNT TYPES
-- ============================================
SELECT 
  '-- Account Types Backup' as backup_section;

SELECT 
  'INSERT INTO account_types (id, name, description, normal_balance, is_system, is_active, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  quote_literal(normal_balance) || ', ' ||
  is_system || ', ' ||
  is_active || ', ' ||
  quote_literal(created_at::text) || ', ' ||
  quote_literal(COALESCE(updated_at::text, created_at::text)) ||
  ');' as backup_data
FROM account_types
ORDER BY created_at;

-- ============================================
-- BACKUP ACCOUNTS
-- ============================================
SELECT 
  '-- Accounts Backup' as backup_section;

SELECT 
  'INSERT INTO accounts (id, code, name, description, account_type_id, parent_account_id, level, is_active, is_header, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(code) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  COALESCE(quote_literal(account_type_id::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(parent_account_id::text), 'NULL') || ', ' ||
  level || ', ' ||
  is_active || ', ' ||
  COALESCE(is_header::text, 'false') || ', ' ||
  quote_literal(created_at::text) || ', ' ||
  quote_literal(COALESCE(updated_at::text, created_at::text)) ||
  ');' as backup_data
FROM accounts
ORDER BY code;

-- ============================================
-- BACKUP JOURNAL ENTRIES
-- ============================================
SELECT 
  '-- Journal Entries Backup' as backup_section;

SELECT 
  'INSERT INTO journal_entries (id, entry_number, entry_date, description, reference, total_debit, total_credit, is_balanced, period_id, created_by, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(entry_number) || ', ' ||
  quote_literal(entry_date::text) || ', ' ||
  quote_literal(description) || ', ' ||
  COALESCE(quote_literal(reference), 'NULL') || ', ' ||
  total_debit || ', ' ||
  total_credit || ', ' ||
  is_balanced || ', ' ||
  COALESCE(quote_literal(period_id::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(created_by::text), 'NULL') || ', ' ||
  quote_literal(created_at::text) || ', ' ||
  quote_literal(COALESCE(updated_at::text, created_at::text)) ||
  ');' as backup_data
FROM journal_entries
ORDER BY entry_date DESC, created_at DESC;

-- ============================================
-- BACKUP JOURNAL ENTRY LINES
-- ============================================
SELECT 
  '-- Journal Entry Lines Backup' as backup_section;

SELECT 
  'INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, project_id, description, debit_amount, credit_amount, line_number, created_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(journal_entry_id::text) || ', ' ||
  quote_literal(account_id::text) || ', ' ||
  COALESCE(quote_literal(project_id::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  debit_amount || ', ' ||
  credit_amount || ', ' ||
  COALESCE(line_number::text, 'NULL') || ', ' ||
  quote_literal(created_at::text) ||
  ');' as backup_data
FROM journal_entry_lines
ORDER BY journal_entry_id, line_number;

-- ============================================
-- BACKUP PURCHASE ORDERS
-- ============================================
SELECT 
  '-- Purchase Orders Backup' as backup_section;

SELECT 
  'INSERT INTO purchase_orders (id, po_number, amount, description, image_data, status, approved_by_1, approved_at_1, approved_by_2, approved_at_2, rejected_by, rejected_at, rejection_reason, created_by, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(po_number) || ', ' ||
  amount || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  COALESCE(quote_literal(image_data), 'NULL') || ', ' ||
  quote_literal(status) || ', ' ||
  COALESCE(quote_literal(approved_by_1::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(approved_at_1::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(approved_by_2::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(approved_at_2::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(rejected_by::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(rejected_at::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(rejection_reason), 'NULL') || ', ' ||
  COALESCE(quote_literal(created_by::text), 'NULL') || ', ' ||
  quote_literal(created_at::text) || ', ' ||
  quote_literal(COALESCE(updated_at::text, created_at::text)) ||
  ');' as backup_data
FROM purchase_orders
ORDER BY created_at DESC;

-- ============================================
-- BACKUP ACCOUNTING PERIODS
-- ============================================
SELECT 
  '-- Accounting Periods Backup' as backup_section;

SELECT 
  'INSERT INTO accounting_periods (id, name, start_date, end_date, is_locked, created_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(name) || ', ' ||
  quote_literal(start_date::text) || ', ' ||
  quote_literal(end_date::text) || ', ' ||
  is_locked || ', ' ||
  quote_literal(created_at::text) ||
  ');' as backup_data
FROM accounting_periods
ORDER BY start_date DESC;

-- ============================================
-- BACKUP OPENING BALANCES
-- ============================================
SELECT 
  '-- Opening Balances Backup' as backup_section;

SELECT 
  'INSERT INTO opening_balances (id, account_id, period_id, balance, balance_type, created_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(account_id::text) || ', ' ||
  quote_literal(period_id::text) || ', ' ||
  balance || ', ' ||
  quote_literal(balance_type) || ', ' ||
  quote_literal(created_at::text) ||
  ');' as backup_data
FROM opening_balances
ORDER BY period_id, account_id;

-- ============================================
-- BACKUP PROJECTS
-- ============================================
SELECT 
  '-- Projects Backup' as backup_section;

SELECT 
  'INSERT INTO projects (id, name, description, is_active, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  is_active || ', ' ||
  quote_literal(created_at::text) || ', ' ||
  quote_literal(COALESCE(updated_at::text, created_at::text)) ||
  ');' as backup_data
FROM projects
ORDER BY created_at DESC;

-- ============================================
-- BACKUP AUDIT TRAIL
-- ============================================
SELECT 
  '-- Audit Trail Backup' as backup_section;

SELECT 
  'INSERT INTO audit_trail (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at) VALUES (' ||
  quote_literal(id::text) || ', ' ||
  quote_literal(table_name) || ', ' ||
  quote_literal(record_id::text) || ', ' ||
  quote_literal(action) || ', ' ||
  COALESCE(quote_literal(old_values::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(new_values::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(changed_by::text), 'NULL') || ', ' ||
  quote_literal(changed_at::text) ||
  ');' as backup_data
FROM audit_trail
ORDER BY changed_at DESC;

-- ============================================
-- NOTES
-- ============================================
-- 
-- HOW TO USE THIS BACKUP:
-- 
-- 1. Run this script in Supabase SQL Editor
-- 2. Copy all the output (INSERT statements)
-- 3. Save to a .sql file with date: backup-YYYY-MM-DD.sql
-- 4. Store in cloud storage (Google Drive, Dropbox, etc.)
-- 
-- HOW TO RESTORE:
-- 
-- 1. Open the backup .sql file
-- 2. Run in Supabase SQL Editor
-- 3. If restoring to existing database, you may need to:
--    - Delete existing data first, OR
--    - Use INSERT ... ON CONFLICT DO NOTHING
-- 
-- RECOMMENDED BACKUP SCHEDULE:
-- - Weekly: Full backup
-- - Monthly: Archive backup to long-term storage
-- - Before major changes: Always backup first
-- 
-- ============================================

