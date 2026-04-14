// Delete JE-393
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function deleteJE393() {
  try {
    const { data: entry } = await supabase.from('journal_entries').select('id').eq('entry_number', 'JE-393').single();
    if (entry) {
      await supabase.from('journal_entry_lines').delete().eq('journal_entry_id', entry.id);
      const { error } = await supabase.from('journal_entries').delete().eq('id', entry.id);
      if (error) {
        console.log('Error:', error);
        return;
      }
      console.log('✓ Deleted JE-393\n');
    }

    // Verify
    const { data: allLines } = await supabase.from('journal_entry_lines').select('debit_amount, credit_amount');
    let gd = 0, gc = 0;
    (allLines || []).forEach(l => {
      gd += parseFloat(l.debit_amount) || 0;
      gc += parseFloat(l.credit_amount) || 0;
    });

    console.log('=== FINAL BALANCE CHECK ===');
    console.log(`Debits:  $${gd.toFixed(2)}`);
    console.log(`Credits: $${gc.toFixed(2)}`);
    console.log(`Diff:    $${Math.abs(gd - gc).toFixed(2)}`);

    if (Math.abs(gd - gc) < 0.01) {
      console.log('\n✓✓✓ PERFECT BALANCE ACHIEVED! ✓✓✓\n');
    }
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

deleteJE393();
