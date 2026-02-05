-- Add rejection_reason column to purchase_orders table
-- Update status constraint to use 'approved' instead of 'fully_approved'

-- Step 1: Add rejection_reason column
ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Step 2: Update existing fully_approved status to approved
UPDATE purchase_orders
SET status = 'approved'
WHERE status = 'fully_approved';

-- Step 3: Update status constraint
ALTER TABLE purchase_orders
  DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

ALTER TABLE purchase_orders
  ADD CONSTRAINT purchase_orders_status_check 
  CHECK (status IN ('pending', 'first_approved', 'approved', 'rejected'));

-- Step 4: Update comments
COMMENT ON COLUMN purchase_orders.rejection_reason IS 'Reason provided when purchase order is rejected';
COMMENT ON COLUMN purchase_orders.status IS 'Order status: pending, first_approved, approved, or rejected';




