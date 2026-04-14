-- Fix Incomplete Journal Entries - Add Missing Credit Lines
-- This script adds the missing credit lines to balance entries JE-436, JE-435, and JE-415

-- Step 1: Show the problematic entries before fixing
SELECT 'Showing incomplete entries before fix:' as info;

SELECT 
    je.id,
    je.entry_number,
    je.entry_date,
    je.description,
    je.total_debit,
    je.total_credit,
    COUNT(jel.id) as line_count,
    SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END) as actual_debits,
    SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END) as actual_credits
FROM journal_entries je
LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
WHERE je.entry_number IN ('JE-436', 'JE-435', 'JE-415')
GROUP BY je.id, je.entry_number, je.entry_date, je.description, je.total_debit, je.total_credit
ORDER BY je.entry_number;

-- Step 2: Get a suitable bank/cash account to use for credits
-- We'll use account 1110 (Cash) or 1120 (Bank - Checking) if available
SELECT 'Finding suitable credit account:' as info;

SELECT 
    id,
    code,
    name
FROM accounts
WHERE code IN ('1110', '1120') OR name LIKE '%Cash%' OR name LIKE '%Bank%'
LIMIT 1;

-- Step 3: For each incomplete entry, add the missing credit line
-- Entry JE-436: $5,005 debit needs $5,005 credit
DO $$
DECLARE
    entry_id UUID;
    bank_account_id UUID;
    debit_amount DECIMAL(15,2);
    next_line_number INTEGER;
BEGIN
    -- Get the entry ID for JE-436
    SELECT id INTO entry_id FROM journal_entries WHERE entry_number = 'JE-436';
    
    -- Get the bank account ID (use 1110 Cash)
    SELECT id INTO bank_account_id FROM accounts WHERE code = '1110' LIMIT 1;
    
    IF entry_id IS NOT NULL AND bank_account_id IS NOT NULL THEN
        -- Get the debit amount
        SELECT SUM(debit_amount) INTO debit_amount FROM journal_entry_lines WHERE journal_entry_id = entry_id;
        
        -- Get the next line number
        SELECT COALESCE(MAX(line_number), 0) + 1 INTO next_line_number FROM journal_entry_lines WHERE journal_entry_id = entry_id;
        
        -- Insert the credit line
        INSERT INTO journal_entry_lines (
            id,
            journal_entry_id,
            account_id,
            line_number,
            debit_amount,
            credit_amount,
            description,
            created_at
        ) VALUES (
            gen_random_uuid(),
            entry_id,
            bank_account_id,
            next_line_number,
            0,
            debit_amount,
            'Balancing credit - Automatic',
            NOW()
        );
        
        -- Update the journal entry totals
        UPDATE journal_entries
        SET 
            total_credit = debit_amount,
            is_balanced = true,
            updated_at = NOW()
        WHERE id = entry_id;
        
        RAISE NOTICE 'Fixed JE-436: Added credit line of $%', debit_amount;
    END IF;
END $$;

-- Entry JE-435: $150,000 debit needs $150,000 credit
DO $$
DECLARE
    entry_id UUID;
    bank_account_id UUID;
    debit_amount DECIMAL(15,2);
    next_line_number INTEGER;
BEGIN
    -- Get the entry ID for JE-435
    SELECT id INTO entry_id FROM journal_entries WHERE entry_number = 'JE-435';
    
    -- Get the bank account ID (use 1110 Cash)
    SELECT id INTO bank_account_id FROM accounts WHERE code = '1110' LIMIT 1;
    
    IF entry_id IS NOT NULL AND bank_account_id IS NOT NULL THEN
        -- Get the debit amount
        SELECT SUM(debit_amount) INTO debit_amount FROM journal_entry_lines WHERE journal_entry_id = entry_id;
        
        -- Get the next line number
        SELECT COALESCE(MAX(line_number), 0) + 1 INTO next_line_number FROM journal_entry_lines WHERE journal_entry_id = entry_id;
        
        -- Insert the credit line
        INSERT INTO journal_entry_lines (
            id,
            journal_entry_id,
            account_id,
            line_number,
            debit_amount,
            credit_amount,
            description,
            created_at
        ) VALUES (
            gen_random_uuid(),
            entry_id,
            bank_account_id,
            next_line_number,
            0,
            debit_amount,
            'Balancing credit - Automatic',
            NOW()
        );
        
        -- Update the journal entry totals
        UPDATE journal_entries
        SET 
            total_credit = debit_amount,
            is_balanced = true,
            updated_at = NOW()
        WHERE id = entry_id;
        
        RAISE NOTICE 'Fixed JE-435: Added credit line of $%', debit_amount;
    END IF;
END $$;

-- Entry JE-415: $2,320 debit needs $2,320 credit
DO $$
DECLARE
    entry_id UUID;
    bank_account_id UUID;
    debit_amount DECIMAL(15,2);
    next_line_number INTEGER;
BEGIN
    -- Get the entry ID for JE-415
    SELECT id INTO entry_id FROM journal_entries WHERE entry_number = 'JE-415';
    
    -- Get the bank account ID (use 1110 Cash)
    SELECT id INTO bank_account_id FROM accounts WHERE code = '1110' LIMIT 1;
    
    IF entry_id IS NOT NULL AND bank_account_id IS NOT NULL THEN
        -- Get the debit amount
        SELECT SUM(debit_amount) INTO debit_amount FROM journal_entry_lines WHERE journal_entry_id = entry_id;
        
        -- Get the next line number
        SELECT COALESCE(MAX(line_number), 0) + 1 INTO next_line_number FROM journal_entry_lines WHERE journal_entry_id = entry_id;
        
        -- Insert the credit line
        INSERT INTO journal_entry_lines (
            id,
            journal_entry_id,
            account_id,
            line_number,
            debit_amount,
            credit_amount,
            description,
            created_at
        ) VALUES (
            gen_random_uuid(),
            entry_id,
            bank_account_id,
            next_line_number,
            0,
            debit_amount,
            'Balancing credit - Automatic',
            NOW()
        );
        
        -- Update the journal entry totals
        UPDATE journal_entries
        SET 
            total_credit = debit_amount,
            is_balanced = true,
            updated_at = NOW()
        WHERE id = entry_id;
        
        RAISE NOTICE 'Fixed JE-415: Added credit line of $%', debit_amount;
    END IF;
END $$;

-- Step 4: Verify the fix
SELECT 'Verification - Fixed entries after correction:' as info;

SELECT 
    je.id,
    je.entry_number,
    je.entry_date,
    je.description,
    je.total_debit,
    je.total_credit,
    COUNT(jel.id) as line_count,
    SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END) as actual_debits,
    SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END) as actual_credits,
    je.is_balanced
FROM journal_entries je
LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
WHERE je.entry_number IN ('JE-436', 'JE-435', 'JE-415')
GROUP BY je.id, je.entry_number, je.entry_date, je.description, je.total_debit, je.total_credit, je.is_balanced
ORDER BY je.entry_number;

-- Step 5: Show final global balance check
SELECT 'Final balance check after fix:' as info;

SELECT
    'Total Debits' as metric,
    SUM(debit_amount)::NUMERIC(15,2) as amount
FROM journal_entry_lines
UNION ALL
SELECT
    'Total Credits' as metric,
    SUM(credit_amount)::NUMERIC(15,2) as amount
FROM journal_entry_lines
UNION ALL
SELECT
    'Difference' as metric,
    (SUM(debit_amount) - SUM(credit_amount))::NUMERIC(15,2) as amount
FROM journal_entry_lines;
