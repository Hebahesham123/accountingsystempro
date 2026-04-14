// Delete JE-392 specifically and investigate
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function fixUnbalance() {
  try {
    // Delete JE-392
    const { data: entry } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('entry_number', 'JE-392')
      .single();

    if (entry) {
      await supabase.from('journal_entry_lines').delete().eq('journal_entry_id', entry.id);
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      console.log('✓ Deleted JE-392');
    }

    // Get global totals
    const { data: allLines } = await supabase.from('journal_entry_lines').select('debit_amount, credit_amount');
    let gd = 0, gc = 0;
    (allLines || []).forEach(l => {
      gd += parseFloat(l.debit_amount) || 0;
      gc += parseFloat(l.credit_amount) || 0;
    });

    console.log(`Debits: $${gd.toFixed(2)}, Credits: $${gc.toFixed(2)}`);
    console.log(`Difference: $${Math.abs(gd - gc).toFixed(2)}`);

    if (Math.abs(gd - gc) < 0.01) {
      console.log('\n✓✓✓ BALANCED! ✓✓✓');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixUnbalance();
