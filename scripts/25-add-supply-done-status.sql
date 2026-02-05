
-- Add supply_done status to purchase_orders table
-- This allows users to mark approved purchase orders as supply done

-- Step 1: Update status constraint to include 'supply_done'
ALTER TABLE purchase_orders
  DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

ALTER TABLE purchase_orders
  ADD CONSTRAINT purchase_orders_status_check 
  CHECK (status IN ('pending', 'first_approved', 'approved', 'rejected', 'supply_done'));

-- Step 2: Update comments
COMMENT ON COLUMN purchase_orders.status IS 'Order status: pending, first_approved, approved, rejected, or supply_done';




