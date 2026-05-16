-- =====================================================================
-- EXTRACT: All treasury/cash movements (حركه الخزنه) from the system
--
-- This query pulls every journal entry line that touches cash accounts
-- (1110 Cash & Equivalents, 1111 Petty Cash, 1112 Bank Account)
-- and shows them in a format comparable to the Excel treasury report.
--
-- Run this in Supabase SQL Editor, then compare with your Excel file.
-- =====================================================================

-- -------- STEP 1: List all cash/treasury movements ------------------
SELECT
  je.entry_number                          AS "رقم القيد",
  je.entry_date                            AS "التاريخ",
  je.description                           AS "بيان القيد",
  jel.description                          AS "بيان السطر",
  a.code                                   AS "كود الحساب",
  a.name                                   AS "اسم الحساب",
  jel.debit_amount                         AS "مدين (داخل)",
  jel.credit_amount                        AS "دائن (خارج)",
  (jel.debit_amount - jel.credit_amount)   AS "صافي الحركه"
FROM journal_entry_lines jel
JOIN journal_entries je ON je.id = jel.journal_entry_id
JOIN accounts a ON a.id = jel.account_id
WHERE a.code IN ('1110', '1111', '1112')
   OR a.parent_account_id IN (
        SELECT id FROM accounts WHERE code IN ('1110')
      )
ORDER BY je.entry_date, je.entry_number, jel.line_number;


-- -------- STEP 2: Summary by date for quick comparison --------------
SELECT
  je.entry_date                            AS "التاريخ",
  COUNT(*)                                 AS "عدد الحركات",
  SUM(jel.debit_amount)                    AS "اجمالي داخل",
  SUM(jel.credit_amount)                   AS "اجمالي خارج",
  SUM(jel.debit_amount - jel.credit_amount) AS "صافي"
FROM journal_entry_lines jel
JOIN journal_entries je ON je.id = jel.journal_entry_id
JOIN accounts a ON a.id = jel.account_id
WHERE a.code IN ('1110', '1111', '1112')
   OR a.parent_account_id IN (
        SELECT id FROM accounts WHERE code IN ('1110')
      )
GROUP BY je.entry_date
ORDER BY je.entry_date;


-- -------- STEP 3: Date range filter (Jan 2026 - Apr 2026) ----------
-- This matches the date range visible in your Excel sheet
SELECT
  je.entry_number                          AS "رقم القيد",
  je.entry_date                            AS "التاريخ",
  je.description                           AS "بيان القيد",
  jel.debit_amount                         AS "مدين (داخل)",
  jel.credit_amount                        AS "دائن (خارج)",
  a.code                                   AS "كود الحساب"
FROM journal_entry_lines jel
JOIN journal_entries je ON je.id = jel.journal_entry_id
JOIN accounts a ON a.id = jel.account_id
WHERE (a.code IN ('1110', '1111', '1112')
       OR a.parent_account_id IN (
            SELECT id FROM accounts WHERE code IN ('1110')
          ))
  AND je.entry_date BETWEEN '2026-01-01' AND '2026-04-30'
ORDER BY je.entry_date, je.entry_number;


-- -------- STEP 4: Check specific dates from Excel -------------------
-- These are the dates visible in your Excel screenshot.
-- Entries on these dates that are NOT in the system = missing entries.
SELECT
  d.excel_date,
  COALESCE(system_count, 0) AS system_entries_count,
  CASE WHEN system_count IS NULL THEN 'NO ENTRIES IN SYSTEM'
       ELSE 'HAS ENTRIES'
  END AS status
FROM (
  VALUES
    ('2026-01-12'::date),
    ('2026-01-19'::date),
    ('2026-02-09'::date),
    ('2026-02-24'::date),
    ('2026-03-03'::date),
    ('2026-03-09'::date),
    ('2026-03-16'::date),
    ('2026-03-20'::date),
    ('2026-04-21'::date)
) AS d(excel_date)
LEFT JOIN (
  SELECT je.entry_date, COUNT(*) AS system_count
  FROM journal_entry_lines jel
  JOIN journal_entries je ON je.id = jel.journal_entry_id
  JOIN accounts a ON a.id = jel.account_id
  WHERE (a.code IN ('1110', '1111', '1112')
         OR a.parent_account_id IN (
              SELECT id FROM accounts WHERE code IN ('1110')
            ))
  GROUP BY je.entry_date
) sys ON sys.entry_date = d.excel_date
ORDER BY d.excel_date;
