-- Update Purchase Orders Table for Two-Step Approval
-- This script migrates the existing purchase_orders table to support two approvals

-- Step 1: Add new columns for two-step approval
ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS approved_by_1 UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at_1 TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS approved_by_2 UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at_2 TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Migrate existing data (if any)
-- If there's an existing approved_by, move it to approved_by_1
UPDATE purchase_orders
SET 
  approved_by_1 = approved_by,
  approved_at_1 = approved_at,
  status = CASE 
    WHEN status = 'approved' THEN 'fully_approved'
    ELSE status
  END
WHERE approved_by IS NOT NULL AND approved_by_1 IS NULL;

-- Step 3: Update status constraint to include new statuses
ALTER TABLE purchase_orders
  DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

ALTER TABLE purchase_orders
  ADD CONSTRAINT purchase_orders_status_check 
  CHECK (status IN ('pending', 'first_approved', 'fully_approved', 'rejected'));

-- Step 4: Remove old columns (optional - comment out if you want to keep them for reference)
-- ALTER TABLE purchase_orders
--   DROP COLUMN IF EXISTS approved_by,
--   DROP COLUMN IF EXISTS approved_at;

-- Step 5: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approved_by_1 ON purchase_orders(approved_by_1);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approved_by_2 ON purchase_orders(approved_by_2);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_rejected_by ON purchase_orders(rejected_by);

-- Step 6: Update comments
COMMENT ON COLUMN purchase_orders.status IS 'Order status: pending, first_approved, fully_approved, or rejected';
COMMENT ON COLUMN purchase_orders.approved_by_1 IS 'First user who approved the purchase order (admin or accountant)';
COMMENT ON COLUMN purchase_orders.approved_by_2 IS 'Second user who approved the purchase order (admin or accountant)';
COMMENT ON COLUMN purchase_orders.rejected_by IS 'User who rejected the purchase order (admin or accountant)';




