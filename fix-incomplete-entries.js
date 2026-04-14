// Run this with: node fix-incomplete-entries.js
// This script adds missing credit lines to balance incomplete journal entries

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function fixIncompleteEntries() {
  console.log('=== FIXING INCOMPLETE JOURNAL ENTRIES ===\n');

  try {
    // 1. Get the bank account (Cash account 1110)
    const { data: bankAccounts, error: bankError } = await supabase
      .from('accounts')
      .select('id, code, name')
      .eq('code', '1110')
      .limit(1);

    if (bankError) {
      console.error('Error fetching bank account:', bankError.message);
      return;
    }

    if (!bankAccounts || bankAccounts.length === 0) {
      console.error('ERROR: Could not find bank account (Code 1110)');
      return;
    }

    const bankAccountId = bankAccounts[0].id;
    console.log('Using bank account:', bankAccounts[0].code, '-', bankAccounts[0].name);
    console.log('Account ID:', bankAccountId, '\n');

    // 2. Define the entries to fix
    const entriesToFix = ['JE-436', 'JE-435', 'JE-415'];

    for (const entryNumber of entriesToFix) {
      console.log(`\n--- Fixing ${entryNumber} ---`);

      // Get the entry
      const { data: entries, error: entryError } = await supabase
        .from('journal_entries')
        .select('id, entry_number, entry_date, description, total_debit, total_credit, is_balanced')
        .eq('entry_number', entryNumber)
        .single();

      if (entryError) {
        console.error(`Error fetching ${entryNumber}:`, entryError.message);
        continue;
      }

      const entryId = entries.id;
      console.log(`Entry Date: ${entries.entry_date}`);
      console.log(`Description: ${entries.description.substring(0, 60)}...`);
      console.log(`Current Debit: $${parseFloat(entries.total_debit).toFixed(2)}`);
      console.log(`Current Credit: $${parseFloat(entries.total_credit).toFixed(2)}`);

      // Get the current debit amount
      const { data: lines, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select('*')
        .eq('journal_entry_id', entryId);

      if (linesError) {
        console.error(`Error fetching lines for ${entryNumber}:`, linesError.message);
        continue;
      }

      const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit_amount) || 0), 0);
      const nextLineNumber = Math.max(...lines.map(l => l.line_number || 0), 0) + 1;

      console.log(`Total Debit from lines: $${totalDebit.toFixed(2)}`);
      console.log(`Next line number: ${nextLineNumber}`);

      // Create the balancing credit line
      const { error: insertError } = await supabase
        .from('journal_entry_lines')
        .insert([{
          journal_entry_id: entryId,
          account_id: bankAccountId,
          line_number: nextLineNumber,
          debit_amount: 0,
          credit_amount: totalDebit,
          description: 'Balancing credit - Automatic',
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error(`Error inserting credit line for ${entryNumber}:`, insertError.message);
        continue;
      }

      console.log(`✓ Added credit line: $${totalDebit.toFixed(2)}`);

      // Update the journal entry totals and balance flag
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({
          total_credit: totalDebit,
          is_balanced: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (updateError) {
        console.error(`Error updating entry ${entryNumber}:`, updateError.message);
        continue;
      }

      console.log(`✓ Entry ${entryNumber} FIXED - now balanced`);
    }

    // 3. Verify the fix
    console.log('\n\n=== VERIFICATION ===\n');

    // Get new global totals
    const { data: allLines, error: allLinesError } = await supabase
      .from('journal_entry_lines')
      .select('debit_amount, credit_amount');

    if (allLinesError) {
      console.error('Error fetching all lines:', allLinesError.message);
      return;
    }

    let globalDebit = 0, globalCredit = 0;
    for (const line of allLines) {
      globalDebit += parseFloat(line.debit_amount) || 0;
      globalCredit += parseFloat(line.credit_amount) || 0;
    }

    console.log('--- GLOBAL TOTALS AFTER FIX ---');
    console.log('Total Debits:  $' + globalDebit.toFixed(2));
    console.log('Total Credits: $' + globalCredit.toFixed(2));
    console.log('Difference:    $' + Math.abs(globalDebit - globalCredit).toFixed(2));

    if (Math.abs(globalDebit - globalCredit) < 0.01) {
      console.log('\n✓✓✓ SUCCESS! The accounts are now BALANCED ✓✓✓');
    } else {
      console.log('\nNote: Still some difference - may need additional review');
    }

    // Show the fixed entries
    console.log('\n--- FIXED ENTRIES ---');
    for (const entryNumber of entriesToFix) {
      const { data: entries, error: entryError } = await supabase
        .from('journal_entries')
        .select('id, entry_number, entry_date, total_debit, total_credit, is_balanced')
        .eq('entry_number', entryNumber)
        .single();

      if (!entryError && entries) {
        const dbMatch = parseFloat(entries.total_debit) === parseFloat(entries.total_credit);
        console.log(`\n${entryNumber}:`);
        console.log(`  Debit:  $${parseFloat(entries.total_debit).toFixed(2)}`);
        console.log(`  Credit: $${parseFloat(entries.total_credit).toFixed(2)}`);
        console.log(`  Balanced: ${entries.is_balanced ? 'YES ✓' : 'NO'} (D=C: ${dbMatch ? 'YES' : 'NO'})`);
      }
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

fixIncompleteEntries();
