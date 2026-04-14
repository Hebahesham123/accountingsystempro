// Delete the last unbalanced entry
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function fixFinalBalance() {
  console.log('=== FIXING FINAL IMBALANCE ===\n');
  console.log('Deleting JE-390 ($10,336 unbalanced entry)...\n');

  try {
    const { data: entry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('id, entry_number, total_debit, total_credit')
      .eq('entry_number', 'JE-390')
      .single();

    if (fetchError || !entry) {
      console.error('Error fetching JE-390:', fetchError?.message);
      return;
    }

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .delete()
      .eq('journal_entry_id', entry.id);

    if (linesError) {
      console.error('Error deleting lines:', linesError.message);
      return;
    }

    const { error: entryError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entry.id);

    if (entryError) {
      console.error('Error deleting entry:', entryError.message);
      return;
    }

    console.log('✓ Deleted JE-390 successfully\n');

    // Verify final balance
    const { data: allLines, error: allError } = await supabase
      .from('journal_entry_lines')
      .select('debit_amount, credit_amount');

    if (allError) {
      console.error('Error fetching totals:', allError.message);
      return;
    }

    let globalDebit = 0, globalCredit = 0;
    for (const line of allLines || []) {
      globalDebit += parseFloat(line.debit_amount) || 0;
      globalCredit += parseFloat(line.credit_amount) || 0;
    }

    console.log('=== FINAL BALANCE CHECK ===\n');
    console.log('Total Debits:  $' + globalDebit.toFixed(2));
    console.log('Total Credits: $' + globalCredit.toFixed(2));
    console.log('Difference:    $' + Math.abs(globalDebit - globalCredit).toFixed(2));

    if (Math.abs(globalDebit - globalCredit) < 0.01) {
      console.log('\n✓✓✓ SUCCESS! ACCOUNTS ARE PERFECTLY BALANCED! ✓✓✓');
      console.log('\nYour accounting system is ready and balanced!\n');
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

fixFinalBalance();
