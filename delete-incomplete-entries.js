// Run this with: node delete-incomplete-entries.js
// This script safely deletes the 3 incomplete journal entries

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function deleteIncompleteEntries() {
  console.log('=== DELETING INCOMPLETE JOURNAL ENTRIES ===\n');

  const entriesToDelete = [
    { number: 'JE-436', amount: '$5,005', description: 'Painting works - missing credit' },
    { number: 'JE-435', amount: '$150,000', description: 'Upholstery works - missing credit' },
    { number: 'JE-415', amount: '$2,320', description: 'Electrical work - missing credit' }
  ];

  console.log('Entries to DELETE:\n');
  for (const entry of entriesToDelete) {
    console.log(`  • ${entry.number}: ${entry.amount} - ${entry.description}`);
  }
  console.log('\nTotal imbalance being fixed: $157,325\n');

  try {
    // Step 1: Get the IDs of entries to delete
    const { data: entries, error: fetchError } = await supabase
      .from('journal_entries')
      .select('id, entry_number, total_debit, total_credit')
      .in('entry_number', ['JE-436', 'JE-435', 'JE-415']);

    if (fetchError) {
      console.error('Error fetching entries:', fetchError.message);
      return;
    }

    console.log(`Found ${entries.length} entries to delete\n`);

    let deletedSuccessfully = 0;
    let deleteFailed = 0;

    for (const entry of entries) {
      console.log(`\nDeleting ${entry.entry_number}...`);
      console.log(`  Debit: $${parseFloat(entry.total_debit).toFixed(2)}, Credit: $${parseFloat(entry.total_credit).toFixed(2)}`);

      // Step 2: Delete journal entry lines first
      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .delete()
        .eq('journal_entry_id', entry.id);

      if (linesError) {
        console.log(`  ✗ Error deleting lines: ${linesError.message}`);
        deleteFailed++;
        continue;
      }

      // Step 3: Delete the journal entry
      const { error: entryError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id);

      if (entryError) {
        console.log(`  ✗ Error deleting entry: ${entryError.message}`);
        deleteFailed++;
        continue;
      }

      console.log(`  ✓ DELETED successfully`);
      deletedSuccessfully++;
    }

    console.log(`\n\n=== DELETION SUMMARY ===`);
    console.log(`Successfully deleted: ${deletedSuccessfully} entries`);
    console.log(`Failed deletion: ${deleteFailed} entries\n`);

    if (deletedSuccessfully === 3) {
      console.log('=== FINAL VERIFICATION ===\n');

      // Get new global totals
      const { data: allLines, error: allError } = await supabase
        .from('journal_entry_lines')
        .select('debit_amount, credit_amount');

      if (allError) {
        console.error('Error fetching final totals:', allError.message);
        return;
      }

      let globalDebit = 0, globalCredit = 0;
      for (const line of allLines || []) {
        globalDebit += parseFloat(line.debit_amount) || 0;
        globalCredit += parseFloat(line.credit_amount) || 0;
      }

      console.log('--- GLOBAL BALANCE AFTER FIX ---');
      console.log('Total Debits:  $' + globalDebit.toFixed(2));
      console.log('Total Credits: $' + globalCredit.toFixed(2));

      const diff = Math.abs(globalDebit - globalCredit);
      console.log('Difference:    $' + diff.toFixed(2));

      if (diff < 0.01) {
        console.log('\n✓✓✓ SUCCESS! THE ACCOUNTS ARE NOW PERFECTLY BALANCED ✓✓✓');
        console.log('\nYour accounting system is ready for use!');
      } else {
        console.log('\n⚠ Note: There still is a difference of $' + diff.toFixed(2));
      }
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

deleteIncompleteEntries();
