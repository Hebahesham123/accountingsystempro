-- =====================================================================
-- DIAGNOSTIC: Find the source of the $2,500 balance sheet imbalance
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =====================================================================

-- ---------------------------------------------------------------------
-- TEST 1: Unbalanced journal entries (debits != credits on the header)
-- This is the MOST LIKELY source of a $2,500 imbalance.
-- ---------------------------------------------------------------------
SELECT
  'TEST 1: Header totals mismatch' AS test,
  je.id,
  je.entry_number,
  je.entry_date,
  je.description,
  je.total_debit,
  je.total_credit,
  (je.total_debit - je.total_credit) AS difference
FROM journal_entries je
WHERE ABS(COALESCE(je.total_debit,0) - COALESCE(je.total_credit,0)) > 0.01
ORDER BY ABS(COALESCE(je.total_debit,0) - COALESCE(je.total_credit,0)) DESC;

-- ---------------------------------------------------------------------
-- TEST 2: Journal entries where LINE totals don't match HEADER totals
-- (header says X but the actual lines sum to Y)
-- ---------------------------------------------------------------------
SELECT
  'TEST 2: Lines vs header mismatch' AS test,
  je.id,
  je.entry_number,
  je.entry_date,
  je.total_debit   AS header_debit,
  je.total_credit  AS header_credit,
  COALESCE(SUM(jel.debit_amount), 0)  AS lines_debit,
  COALESCE(SUM(jel.credit_amount), 0) AS lines_credit,
  (COALESCE(SUM(jel.debit_amount),0) - COALESCE(SUM(jel.credit_amount),0)) AS lines_difference
FROM journal_entries je
LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
GROUP BY je.id, je.entry_number, je.entry_date, je.total_debit, je.total_credit
HAVING ABS(COALESCE(SUM(jel.debit_amount),0) - COALESCE(SUM(jel.credit_amount),0)) > 0.01
    OR ABS(COALESCE(SUM(jel.debit_amount),0) - COALESCE(je.total_debit,0))   > 0.01
    OR ABS(COALESCE(SUM(jel.credit_amount),0) - COALESCE(je.total_credit,0)) > 0.01
ORDER BY ABS(COALESCE(SUM(jel.debit_amount),0) - COALESCE(SUM(jel.credit_amount),0)) DESC;

-- ---------------------------------------------------------------------
-- TEST 3: Orphaned journal lines (pointing at an account that no
-- longer exists in the chart of accounts)
-- ---------------------------------------------------------------------
SELECT
  'TEST 3: Orphaned lines' AS test,
  jel.id,
  jel.journal_entry_id,
  jel.account_id,
  jel.debit_amount,
  jel.credit_amount
FROM journal_entry_lines jel
LEFT JOIN accounts a ON a.id = jel.account_id
WHERE a.id IS NULL;

-- ---------------------------------------------------------------------
-- TEST 4: Orphaned lines (pointing at an INACTIVE account that is
-- therefore filtered out of every report)
-- ---------------------------------------------------------------------
SELECT
  'TEST 4: Lines on inactive accounts' AS test,
  a.code,
  a.name,
  a.is_active,
  SUM(jel.debit_amount)  AS total_debit,
  SUM(jel.credit_amount) AS total_credit,
  SUM(jel.debit_amount - jel.credit_amount) AS net
FROM journal_entry_lines jel
JOIN accounts a ON a.id = jel.account_id
WHERE a.is_active = FALSE
GROUP BY a.code, a.name, a.is_active;

-- ---------------------------------------------------------------------
-- TEST 5: Grand totals across the ledger
-- If this is non-zero, you have a fundamental data integrity issue.
-- ---------------------------------------------------------------------
SELECT
  'TEST 5: Grand totals' AS test,
  SUM(jel.debit_amount)  AS grand_debit,
  SUM(jel.credit_amount) AS grand_credit,
  SUM(jel.debit_amount) - SUM(jel.credit_amount) AS difference
FROM journal_entry_lines jel
JOIN journal_entries je ON je.id = jel.journal_entry_id;

-- ---------------------------------------------------------------------
-- TEST 6: Opening balances - check that they also net to zero
-- ---------------------------------------------------------------------
SELECT
  'TEST 6: Opening balances total' AS test,
  SUM(COALESCE(ob.balance, 0)
      * CASE WHEN ob.balance_type = 'debit' THEN 1 ELSE -1 END
  ) AS net_opening_balance,
  SUM(CASE WHEN ob.balance_type = 'debit'  THEN ob.balance ELSE 0 END) AS total_debit_openings,
  SUM(CASE WHEN ob.balance_type = 'credit' THEN ob.balance ELSE 0 END) AS total_credit_openings
FROM opening_balances ob;

-- ---------------------------------------------------------------------
-- TEST 7: Accounts whose account_type_id doesn't match the
-- account_type VARCHAR column (stale data)
-- ---------------------------------------------------------------------
SELECT
  'TEST 7: Type mismatch on accounts' AS test,
  a.code,
  a.name,
  a.account_type   AS string_type,
  at.name          AS lookup_type,
  at.normal_balance
FROM accounts a
LEFT JOIN account_types at ON at.id = a.account_type_id
WHERE at.name IS NULL
   OR (a.account_type <> at.name
       AND a.account_type <> REPLACE(REPLACE(REPLACE(at.name,'Assets','Asset'),'Liabilities','Liability'),'Expenses','Expense'));

-- ---------------------------------------------------------------------
-- TEST 8: account_types.normal_balance sanity check
-- Assets + Expenses must be 'debit'; Liabilities + Equity + Revenue
-- must be 'credit'. If any row is wrong, every balance will flip sign.
-- ---------------------------------------------------------------------
SELECT
  'TEST 8: normal_balance config' AS test,
  id, name, normal_balance
FROM account_types
ORDER BY name;
