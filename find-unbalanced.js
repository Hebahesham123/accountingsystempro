// Run this with: node find-unbalanced.js
// This script checks your Supabase database for unbalanced journal entries

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function checkBalance() {
  console.log('=== ACCOUNTING SYSTEM - DATABASE BALANCE CHECK ===\n');

  // 1. Get ALL journal entries (paginated)
  let allEntries = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, entry_number, entry_date, is_balanced, description')
      .range(offset, offset + 999);
    if (error) { console.error('Entry fetch error:', error.message); break; }
    if (!data || data.length === 0) break;
    allEntries = allEntries.concat(data);
    offset += 1000;
    if (data.length < 1000) break;
  }
  console.log('Total journal entries: ' + allEntries.length);

  // 2. Get ALL journal entry lines (paginated)
  let allLines = [];
  offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('journal_entry_lines')
      .select('id, journal_entry_id, account_id, debit_amount, credit_amount')
      .range(offset, offset + 4999);
    if (error) { console.error('Lines fetch error:', error.message); break; }
    if (!data || data.length === 0) break;
    allLines = allLines.concat(data);
    offset += 5000;
    if (data.length < 5000) break;
  }
  console.log('Total journal entry lines: ' + allLines.length);

  // 3. Check global totals
  let globalDebit = 0, globalCredit = 0;
  for (const line of allLines) {
    const d = parseFloat(line.debit_amount) || 0;
    const c = parseFloat(line.credit_amount) || 0;
    globalDebit += d;
    globalCredit += c;
  }
  console.log('\n--- GLOBAL TOTALS ---');
  console.log('Total Debits:  $' + globalDebit.toFixed(2));
  console.log('Total Credits: $' + globalCredit.toFixed(2));
  console.log('Difference:    $' + (globalDebit - globalCredit).toFixed(2));

  // 4. Check per-entry balance
  const entryMap = new Map();
  for (const line of allLines) {
    const eid = line.journal_entry_id;
    if (!entryMap.has(eid)) entryMap.set(eid, { debit: 0, credit: 0, lines: [] });
    const e = entryMap.get(eid);
    e.debit += parseFloat(line.debit_amount) || 0;
    e.credit += parseFloat(line.credit_amount) || 0;
    e.lines.push(line);
  }

  const unbalanced = [];
  for (const [eid, totals] of entryMap) {
    const diff = Math.abs(totals.debit - totals.credit);
    if (diff > 0.01) {
      const entry = allEntries.find(e => e.id === eid);
      unbalanced.push({
        id: eid,
        entry_number: entry ? entry.entry_number : 'ORPHANED',
        description: (entry ? entry.description : 'No matching entry') || '',
        entry_date: entry ? entry.entry_date : '',
        is_balanced_flag: entry ? entry.is_balanced : null,
        debit: totals.debit,
        credit: totals.credit,
        diff: totals.debit - totals.credit,
        line_count: totals.lines.length,
        lines: totals.lines
      });
    }
  }

  console.log('\n--- UNBALANCED ENTRIES ---');
  console.log('Found ' + unbalanced.length + ' unbalanced entries:\n');

  if (unbalanced.length > 0) {
    let totalDiffSum = 0;
    for (const u of unbalanced) {
      totalDiffSum += u.diff;
      console.log('Entry #' + u.entry_number + ' (' + u.entry_date + ')');
      console.log('  Description: ' + u.description.substring(0, 80));
      console.log('  Debit: $' + u.debit.toFixed(2) + '  Credit: $' + u.credit.toFixed(2) + '  DIFF: $' + u.diff.toFixed(2));
      console.log('  DB is_balanced flag: ' + u.is_balanced_flag);
      console.log('  Lines (' + u.line_count + '):');
      for (const line of u.lines) {
        const d = parseFloat(line.debit_amount) || 0;
        const c = parseFloat(line.credit_amount) || 0;
        console.log('    Account: ' + line.account_id.substring(0, 8) + '...  Debit: $' + d.toFixed(2) + '  Credit: $' + c.toFixed(2));
      }
      console.log('');
    }
    console.log('=== Sum of all entry differences: $' + totalDiffSum.toFixed(2) + ' ===');
    console.log('(This should match the global difference of $' + (globalDebit - globalCredit).toFixed(2) + ')');
  } else {
    console.log('All entries are balanced! The issue may be elsewhere.');
  }

  // 5. Check for orphaned lines
  const entryIds = new Set(allEntries.map(e => e.id));
  const orphaned = allLines.filter(l => !entryIds.has(l.journal_entry_id));
  if (orphaned.length > 0) {
    console.log('\n--- ORPHANED LINES (no matching journal entry) ---');
    console.log('Found ' + orphaned.length + ' orphaned lines');
    let od = 0, oc = 0;
    for (const o of orphaned) {
      od += parseFloat(o.debit_amount) || 0;
      oc += parseFloat(o.credit_amount) || 0;
    }
    console.log('Orphan Debit: $' + od.toFixed(2) + '  Credit: $' + oc.toFixed(2) + '  Diff: $' + (od - oc).toFixed(2));
  }

  // 6. Entries with lines but marked as different
  const markedUnbalanced = allEntries.filter(e => e.is_balanced === false);
  if (markedUnbalanced.length > 0) {
    console.log('\n--- ENTRIES MARKED is_balanced=false IN DATABASE ---');
    for (const e of markedUnbalanced) {
      console.log('  #' + e.entry_number + ' (' + e.entry_date + '): ' + (e.description || '').substring(0, 60));
    }
  }

  console.log('\n=== CHECK COMPLETE ===');
}

checkBalance().catch(err => console.error('Fatal error:', err));
