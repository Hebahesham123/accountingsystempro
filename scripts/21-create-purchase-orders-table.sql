-- Create Purchase Orders Table
-- This table stores purchase orders with two-step approval workflow

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) NOT NULL UNIQUE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  image_data TEXT, -- Base64 encoded image
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'first_approved', 'fully_approved', 'rejected')),
  approved_by_1 UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at_1 TIMESTAMP WITH TIME ZONE,
  approved_by_2 UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at_2 TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approved_by_1 ON purchase_orders(approved_by_1);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approved_by_2 ON purchase_orders(approved_by_2);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_rejected_by ON purchase_orders(rejected_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at DESC);

-- Add comments
COMMENT ON TABLE purchase_orders IS 'Purchase orders with two-step approval workflow';
COMMENT ON COLUMN purchase_orders.po_number IS 'Unique purchase order number (e.g., PO-001)';
COMMENT ON COLUMN purchase_orders.status IS 'Order status: pending, first_approved, fully_approved, or rejected';
COMMENT ON COLUMN purchase_orders.approved_by_1 IS 'First user who approved the purchase order (admin or accountant)';
COMMENT ON COLUMN purchase_orders.approved_by_2 IS 'Second user who approved the purchase order (admin or accountant)';
COMMENT ON COLUMN purchase_orders.rejected_by IS 'User who rejected the purchase order (admin or accountant)';
COMMENT ON COLUMN purchase_orders.image_data IS 'Base64 encoded image data for the purchase order';

