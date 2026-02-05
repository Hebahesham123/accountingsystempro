-- Add cash flow category field to accounts table
-- This allows users to categorize accounts for Cash Flow Statement
-- Default is 'operating' for all accounts

ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS cash_flow_category VARCHAR(20) DEFAULT 'operating' 
CHECK (cash_flow_category IN ('operating', 'investing', 'financing'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_cash_flow_category ON accounts(cash_flow_category);

-- Update existing accounts to have default 'operating' category
UPDATE accounts 
SET cash_flow_category = 'operating' 
WHERE cash_flow_category IS NULL;




