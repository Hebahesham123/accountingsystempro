// Run this with: node fix-unbalanced.js
// This script finds and fixes entries where is_balanced flag is wrong in the database

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function fixUnbalancedEntries() {
  console.log('=== FIXING UNBALANCED ENTRIES ===\n');

  // 1. Get ALL journal entries
  let allEntries = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, entry_number, entry_date, is_balanced, description')
      .range(offset, offset + 999);
    if (error) { console.error('Error:', error.message); break; }
    if (!data || data.length === 0) break;
    allEntries = allEntries.concat(data);
    offset += 1000;
    if (data.length < 1000) break;
  }

  // 2. Get ALL lines
  let allLines = [];
  offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('journal_entry_lines')
      .select('id, journal_entry_id, debit_amount, credit_amount')
      .range(offset, offset + 4999);
    if (error) { console.error('Error:', error.message); break; }
    if (!data || data.length === 0) break;
    allLines = allLines.concat(data);
    offset += 5000;
    if (data.length < 5000) break;
  }

  console.log('Entries: ' + allEntries.length + ', Lines: ' + allLines.length);

  // 3. Group lines by entry
  const entryMap = new Map();
  for (const line of allLines) {
    const eid = line.journal_entry_id;
    if (!entryMap.has(eid)) entryMap.set(eid, { debit: 0, credit: 0 });
    const e = entryMap.get(eid);
    e.debit += parseFloat(line.debit_amount) || 0;
    e.credit += parseFloat(line.credit_amount) || 0;
  }

  // 4. Find entries where is_balanced flag is WRONG
  let fixCount = 0;
  for (const entry of allEntries) {
    const totals = entryMap.get(entry.id);
    let actuallyBalanced;

    if (!totals) {
      // No lines at all — definitely not balanced
      actuallyBalanced = false;
    } else {
      actuallyBalanced = Math.abs(totals.debit - totals.credit) < 0.01 && totals.debit > 0;
    }

    if (entry.is_balanced !== actuallyBalanced) {
      fixCount++;
      console.log('\nFIXING Entry #' + entry.entry_number + ' (' + entry.entry_date + ')');
      console.log('  DB flag: is_balanced=' + entry.is_balanced + ' -> should be ' + actuallyBalanced);
      if (totals) {
        console.log('  Debit: $' + totals.debit.toFixed(2) + ', Credit: $' + totals.credit.toFixed(2));
      } else {
        console.log('  No lines found');
      }

      // Update the flag
      const { error } = await supabase
        .from('journal_entries')
        .update({ is_balanced: actuallyBalanced })
        .eq('id', entry.id);

      if (error) {
        console.log('  ERROR updating: ' + error.message);
      } else {
        console.log('  FIXED successfully');
      }
    }
  }

  if (fixCount === 0) {
    console.log('\nAll entries already have correct is_balanced flags.');
  } else {
    console.log('\n=== Fixed ' + fixCount + ' entries ===');
  }

  // 5. Show remaining global totals
  let globalDebit = 0, globalCredit = 0;
  for (const line of allLines) {
    globalDebit += parseFloat(line.debit_amount) || 0;
    globalCredit += parseFloat(line.credit_amount) || 0;
  }
  console.log('\nGlobal Debit: $' + globalDebit.toFixed(2));
  console.log('Global Credit: $' + globalCredit.toFixed(2));
  console.log('Difference: $' + (globalDebit - globalCredit).toFixed(2));
  console.log('\nNote: The $' + (globalDebit - globalCredit).toFixed(2) + ' difference is because entries');
  console.log('JE-436 ($5,005), JE-435 ($150,000), JE-415 ($2,320) each have only a');
  console.log('debit line with no credit counterpart. You need to either:');
  console.log('  1. Add the missing credit lines to these entries, OR');
  console.log('  2. Delete these entries if they are incorrect');
}

fixUnbalancedEntries().catch(err => console.error('Fatal:', err));
