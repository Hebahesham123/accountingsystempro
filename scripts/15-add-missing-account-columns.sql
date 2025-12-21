-- Add missing columns to accounts table
-- This script adds is_header and cash_flow_category columns if they don't exist

-- Add is_header column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' 
        AND column_name = 'is_header'
    ) THEN
        ALTER TABLE accounts ADD COLUMN is_header BOOLEAN DEFAULT false;
        COMMENT ON COLUMN accounts.is_header IS 'Indicates if this is a header account that groups other accounts';
        CREATE INDEX IF NOT EXISTS idx_accounts_is_header ON accounts(is_header);
    END IF;
END $$;

-- Add cash_flow_category column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' 
        AND column_name = 'cash_flow_category'
    ) THEN
        ALTER TABLE accounts 
        ADD COLUMN cash_flow_category VARCHAR(20) DEFAULT 'operating' 
        CHECK (cash_flow_category IN ('operating', 'investing', 'financing'));
        
        CREATE INDEX IF NOT EXISTS idx_accounts_cash_flow_category ON accounts(cash_flow_category);
        
        -- Update existing accounts to have default 'operating' category
        UPDATE accounts 
        SET cash_flow_category = 'operating' 
        WHERE cash_flow_category IS NULL;
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'accounts' 
AND column_name IN ('is_header', 'cash_flow_category')
ORDER BY column_name;

