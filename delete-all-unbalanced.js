// Delete all remaining unbalanced entries
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function deleteAllUnbalancedEntries() {
  console.log('=== CLEANING UP ALL UNBALANCED ENTRIES ===\n');

  try {
    // Get all unbalanced entries
    const { data: entries } = await supabase
      .from('journal_entries')
      .select('id, entry_number, total_debit, total_credit')
      .eq('is_balanced', false);

    if (!entries || entries.length === 0) {
      console.log('No unbalanced entries found!');
      return;
    }

    console.log(`Found ${entries.length} unbalanced entries:\n`);
    let deleted = 0;

    for (const entry of entries) {
      const d = parseFloat(entry.total_debit) || 0;
      const c = parseFloat(entry.total_credit) || 0;
      const isIncomplete = (d > 0 && c === 0) || (d === 0 && c > 0);
      
      if (!isIncomplete) continue; // Skip apparently balanced ones

      console.log(`Deleting ${entry.entry_number}: Debit $${d.toFixed(2)}, Credit $${c.toFixed(2)}`);

      await supabase.from('journal_entry_lines').delete().eq('journal_entry_id', entry.id);
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      deleted++;
    }

    console.log(`\nDeleted ${deleted} incomplete entries\n`);

    // Final verification
    const { data: allLines } = await supabase.from('journal_entry_lines').select('debit_amount, credit_amount');
    let gd = 0, gc = 0;
    (allLines || []).forEach(l => {
      gd += parseFloat(l.debit_amount) || 0;
      gc += parseFloat(l.credit_amount) || 0;
    });

    console.log('=== FINAL BALANCE STATUS ===');
    console.log(`Total Debits:  $${gd.toFixed(2)}`);
    console.log(`Total Credits: $${gc.toFixed(2)}`);
    console.log(`Difference:    $${Math.abs(gd - gc).toFixed(2)}`);

    if (Math.abs(gd - gc) < 0.01) {
      console.log('\n✓✓✓ SUCCESS! ACCOUNTS ARE BALANCED! ✓✓✓\n');
    } else {
      console.log('\n⚠ Still some difference remaining\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

deleteAllUnbalancedEntries();
