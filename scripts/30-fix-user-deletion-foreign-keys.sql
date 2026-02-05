-- Fix Foreign Key Constraints for User Deletion
-- This script updates all foreign keys that reference users table
-- to allow user deletion by setting references to NULL

-- ============================================
-- FIX JOURNAL ENTRIES FOREIGN KEY
-- ============================================

-- Drop existing constraint if it exists
ALTER TABLE journal_entries 
  DROP CONSTRAINT IF EXISTS journal_entries_created_by_fkey;

-- Recreate with ON DELETE SET NULL
ALTER TABLE journal_entries
  ADD CONSTRAINT journal_entries_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- ============================================
-- FIX AUDIT TRAIL FOREIGN KEY
-- ============================================

-- Drop existing constraint if it exists
ALTER TABLE audit_trail 
  DROP CONSTRAINT IF EXISTS audit_trail_changed_by_fkey;

-- Recreate with ON DELETE SET NULL
ALTER TABLE audit_trail
  ADD CONSTRAINT audit_trail_changed_by_fkey
  FOREIGN KEY (changed_by)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- ============================================
-- VERIFY PURCHASE ORDERS (Should already be correct)
-- ============================================

-- Purchase orders should already have ON DELETE SET NULL
-- But let's verify and fix if needed

-- Fix created_by if needed
ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS purchase_orders_created_by_fkey;

ALTER TABLE purchase_orders
  ADD CONSTRAINT purchase_orders_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Fix approved_by_1 if needed
ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS purchase_orders_approved_by_1_fkey;

ALTER TABLE purchase_orders
  ADD CONSTRAINT purchase_orders_approved_by_1_fkey
  FOREIGN KEY (approved_by_1)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Fix approved_by_2 if needed
ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS purchase_orders_approved_by_2_fkey;

ALTER TABLE purchase_orders
  ADD CONSTRAINT purchase_orders_approved_by_2_fkey
  FOREIGN KEY (approved_by_2)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Fix rejected_by if needed
ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS purchase_orders_rejected_by_fkey;

ALTER TABLE purchase_orders
  ADD CONSTRAINT purchase_orders_rejected_by_fkey
  FOREIGN KEY (rejected_by)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all foreign keys that reference users
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
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

-- Expected: All should show delete_rule = 'SET NULL' or 'NO ACTION' (which we'll fix)

-- ============================================
-- NOTES
-- ============================================
-- 
-- After running this script:
-- - You can delete users even if they have created journal entries
-- - The created_by, approved_by, rejected_by fields will be set to NULL
-- - Historical data is preserved (journal entries remain, just without user reference)
-- 
-- IMPORTANT: 
-- - This preserves data integrity while allowing user deletion
-- - Deleted users' actions will show as "Unknown" in the UI
-- ============================================




