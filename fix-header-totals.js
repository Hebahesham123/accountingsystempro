// Run this with: node fix-header-totals.js
// This script fixes journal entry header totals to match actual line totals

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function fixHeaderTotals() {
  console.log('=== FIXING JOURNAL ENTRY HEADER TOTALS ===\n');

  try {
    // 1. Get all journal entries
    let allEntries = [];
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, entry_number, total_debit, total_credit, is_balanced')
        .range(offset, offset + 999);
      if (error) { console.error('Error fetching entries:', error.message); break; }
      if (!data || data.length === 0) break;
      allEntries = allEntries.concat(data);
      offset += 1000;
      if (data.length < 1000) break;
    }

    console.log(`Found ${allEntries.length} entries\n`);

    // 2. Get all journal entry lines
    let allLines = [];
    offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('journal_entry_lines')
        .select('id, journal_entry_id, debit_amount, credit_amount')
        .range(offset, offset + 4999);
      if (error) { console.error('Error fetching lines:', error.message); break; }
      if (!data || data.length === 0) break;
      allLines = allLines.concat(data);
      offset += 5000;
      if (data.length < 5000) break;
    }

    console.log(`Found ${allLines.length} lines\n`);

    // 3. Group lines by entry and calculate actual totals
    const linesByEntry = new Map();
    for (const line of allLines) {
      const eid = line.journal_entry_id;
      if (!linesByEntry.has(eid)) {
        linesByEntry.set(eid, { debits: 0, credits: 0, count: 0 });
      }
      const entry = linesByEntry.get(eid);
      entry.debits += parseFloat(line.debit_amount) || 0;
      entry.credits += parseFloat(line.credit_amount) || 0;
      entry.count += 1;
    }

    // 4. Find entries with mismatched headers and update them
    let fixedCount = 0;
    let stillMismatchedCount = 0;

    for (const entry of allEntries) {
      const lineData = linesByEntry.get(entry.id);
      const actualDebits = lineData ? lineData.debits : 0;
      const actualCredits = lineData ? lineData.credits : 0;
      const headerDebits = parseFloat(entry.total_debit) || 0;
      const headerCredits = parseFloat(entry.total_credit) || 0;

      // Check if there's a mismatch
      if (Math.abs(actualDebits - headerDebits) > 0.01 || Math.abs(actualCredits - headerCredits) > 0.01) {
        console.log(`\nMismatch found in ${entry.entry_number}:`);
        console.log(`  Header: Debit $${headerDebits.toFixed(2)}, Credit $${headerCredits.toFixed(2)}`);
        console.log(`  Actual: Debit $${actualDebits.toFixed(2)}, Credit $${actualCredits.toFixed(2)}`);
        console.log(`  Lines count: ${lineData ? lineData.count : 0}`);

        // Determine if balanced
        const isBalanced = Math.abs(actualDebits - actualCredits) < 0.01 && actualDebits > 0;

        // Update the header
        const { error: updateError } = await supabase
          .from('journal_entries')
          .update({
            total_debit: actualDebits,
            total_credit: actualCredits,
            is_balanced: isBalanced,
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.id);

        if (updateError) {
          console.log(`  ERROR updating: ${updateError.message}`);
          stillMismatchedCount++;
        } else {
          console.log(`  ✓ FIXED - Updated to Debit $${actualDebits.toFixed(2)}, Credit $${actualCredits.toFixed(2)}`);
          console.log(`  ✓ Balance status: ${isBalanced ? 'BALANCED' : 'UNBALANCED'}`);
          fixedCount++;
        }
      }
    }

    console.log(`\n\n=== SUMMARY ===`);
    console.log(`Fixed: ${fixedCount} entries`);
    console.log(`Still mismatched: ${stillMismatchedCount} entries\n`);

    // 5. Verify the fix
    console.log('=== FINAL VERIFICATION ===\n');

    // Get new global totals
    const { data: finalLines, error: finalError } = await supabase
      .from('journal_entry_lines')
      .select('debit_amount, credit_amount');

    if (finalError) {
      console.error('Error fetching final totals:', finalError.message);
      return;
    }

    let globalDebit = 0, globalCredit = 0;
    for (const line of finalLines) {
      globalDebit += parseFloat(line.debit_amount) || 0;
      globalCredit += parseFloat(line.credit_amount) || 0;
    }

    console.log('--- GLOBAL TOTALS ---');
    console.log('Total Debits:  $' + globalDebit.toFixed(2));
    console.log('Total Credits: $' + globalCredit.toFixed(2));
    console.log('Difference:    $' + Math.abs(globalDebit - globalCredit).toFixed(2));

    if (Math.abs(globalDebit - globalCredit) < 0.01) {
      console.log('\n✓✓✓ SUCCESS! ALL ACCOUNTS ARE NOW BALANCED ✓✓✓\n');
    } else {
      console.log('\n⚠ Note: There still is a difference - may need manual review');
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

fixHeaderTotals();
