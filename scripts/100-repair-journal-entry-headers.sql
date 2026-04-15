-- =====================================================================
-- REPAIR: Recompute journal_entries.total_debit / total_credit from
-- the actual journal_entry_lines. Fixes JE-398 and every other entry
-- whose stored header drifted from its lines.
--
-- Run order:
--   1) Run the SELECT first to see what WILL change.
--   2) Run the UPDATE to apply the fix.
--   3) Re-run the diagnostic script (99-diagnose-2500-imbalance.sql).
-- =====================================================================

-- -------- PREVIEW ----------------------------------------------------
SELECT
  je.entry_number,
  je.entry_date,
  je.total_debit   AS old_debit,
  je.total_credit  AS old_credit,
  COALESCE(s.sum_debit,  0) AS new_debit,
  COALESCE(s.sum_credit, 0) AS new_credit
FROM journal_entries je
LEFT JOIN (
  SELECT journal_entry_id,
         SUM(debit_amount)  AS sum_debit,
         SUM(credit_amount) AS sum_credit
  FROM journal_entry_lines
  GROUP BY journal_entry_id
) s ON s.journal_entry_id = je.id
WHERE ABS(COALESCE(je.total_debit,0)  - COALESCE(s.sum_debit,0))  > 0.01
   OR ABS(COALESCE(je.total_credit,0) - COALESCE(s.sum_credit,0)) > 0.01
ORDER BY je.entry_date;

-- -------- APPLY -----------------------------------------------------
UPDATE journal_entries je
SET
  total_debit  = COALESCE(s.sum_debit,  0),
  total_credit = COALESCE(s.sum_credit, 0)
FROM (
  SELECT journal_entry_id,
         SUM(debit_amount)  AS sum_debit,
         SUM(credit_amount) AS sum_credit
  FROM journal_entry_lines
  GROUP BY journal_entry_id
) s
WHERE s.journal_entry_id = je.id
  AND ( ABS(COALESCE(je.total_debit,0)  - COALESCE(s.sum_debit,0))  > 0.01
     OR ABS(COALESCE(je.total_credit,0) - COALESCE(s.sum_credit,0)) > 0.01 );

-- Any entry with zero lines but a non-zero header? Zero it out.
UPDATE journal_entries je
SET total_debit = 0, total_credit = 0
WHERE NOT EXISTS (
  SELECT 1 FROM journal_entry_lines jel WHERE jel.journal_entry_id = je.id
)
AND (COALESCE(je.total_debit,0) <> 0 OR COALESCE(je.total_credit,0) <> 0);

-- -------- VERIFY ----------------------------------------------------
SELECT
  COUNT(*)                                         AS total_entries,
  COUNT(*) FILTER (WHERE ABS(total_debit - total_credit) > 0.01) AS still_unbalanced,
  SUM(total_debit)  AS grand_debit,
  SUM(total_credit) AS grand_credit
FROM journal_entries;
