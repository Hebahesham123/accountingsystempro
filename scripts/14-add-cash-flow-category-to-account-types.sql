-- Add cash flow category field to account_types table
-- This allows setting default cash flow category for each account type
-- Default is 'operating' for all account types

ALTER TABLE account_types 
ADD COLUMN IF NOT EXISTS cash_flow_category VARCHAR(20) DEFAULT 'operating' 
CHECK (cash_flow_category IN ('operating', 'investing', 'financing'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_account_types_cash_flow_category ON account_types(cash_flow_category);

-- Update existing account types with sensible defaults
UPDATE account_types 
SET cash_flow_category = 'operating' 
WHERE cash_flow_category IS NULL;

-- Set specific defaults for certain account types (optional - can be changed later)
-- Revenue and Expense are typically operating
UPDATE account_types 
SET cash_flow_category = 'operating' 
WHERE name IN ('Revenue', 'Expense');

-- Assets like Equipment, Property are typically investing
-- But we'll leave them as operating by default and let users change





