-- Why is Total Assets showing -$7.6M?
-- This script finds out which specific asset sub-accounts are pushing the total negative.

-- TEST A: Own balance per root account (not including children)
SELECT
  a.code,
  a.name,
  at.name AS type,
  at.normal_balance,
  COALESCE(SUM(jel.debit_amount),  0) AS total_debits,
  COALESCE(SUM(jel.credit_amount), 0) AS total_credits,
  CASE WHEN at.normal_balance = 'debit'
       THEN COALESCE(SUM(jel.debit_amount),0)  - COALESCE(SUM(jel.credit_amount),0)
       ELSE COALESCE(SUM(jel.credit_amount),0) - COALESCE(SUM(jel.debit_amount),0)
  END AS own_balance_signed
FROM accounts a
LEFT JOIN account_types at ON at.id = a.account_type_id
LEFT JOIN journal_entry_lines jel ON jel.account_id = a.id
WHERE a.parent_account_id IS NULL
GROUP BY a.code, a.name, at.name, at.normal_balance
ORDER BY a.code;

-- TEST B: All Asset-typed accounts, sorted by most-negative balance
SELECT
  a.code,
  a.name,
  COALESCE(SUM(jel.debit_amount),  0) AS total_debits,
  COALESCE(SUM(jel.credit_amount), 0) AS total_credits,
  (COALESCE(SUM(jel.debit_amount),0) - COALESCE(SUM(jel.credit_amount),0)) AS signed_balance
FROM accounts a
JOIN account_types at ON at.id = a.account_type_id
LEFT JOIN journal_entry_lines jel ON jel.account_id = a.id
WHERE at.name IN ('Asset', 'Assets')
GROUP BY a.code, a.name
HAVING COALESCE(SUM(jel.debit_amount),0) - COALESCE(SUM(jel.credit_amount),0) < 0
ORDER BY signed_balance ASC
LIMIT 20;

-- TEST C: Are there accounts whose account_type_id is NULL or mis-linked?
SELECT
  a.code,
  a.name,
  a.account_type    AS string_type,
  a.account_type_id,
  at.name           AS resolved_type
FROM accounts a
LEFT JOIN account_types at ON at.id = a.account_type_id
WHERE a.account_type_id IS NULL OR at.id IS NULL;
