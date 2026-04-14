// Detailed investigation
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function investigate() {
  try {
    // Get all entries with is_balanced=false
    const { data: unbalanced } = await supabase
      .from('journal_entries')
      .select(`
        id, entry_number, total_debit, total_credit, is_balanced,
        journal_entry_lines!inner(debit_amount, credit_amount)
      `)
      .eq('is_balanced', false)
      .limit(10);

    console.log('=== UNBALANCED ENTRIES DETAILED ===\n');
    
    for (const entry of unbalanced || []) {
      const lines = entry.journal_entry_lines || [];
      const sumDebit = lines.reduce((s, l) => s + (parseFloat(l.debit_amount) || 0), 0);
      const sumCredit = lines.reduce((s, l) => s + (parseFloat(l.credit_amount) || 0), 0);
      const isReallybBalance = Math.abs(sumDebit - sumCredit) < 0.01;
      
      console.log(`${entry.entry_number}:`);
      console.log(`  Header: D=$${parseFloat(entry.total_debit).toFixed(2)}, C=$${parseFloat(entry.total_credit).toFixed(2)}`);
      console.log(`  Lines:  D=$${sumDebit.toFixed(2)}, C=$${sumCredit.toFixed(2)}, Lines Count: ${lines.length}`);
      console.log(`  Actually balanced: ${isReallybBalance ? 'YES' : 'NO'}`);
      console.log('');
    }

    // Get global totals one more time
    const { data: allLines } = await supabase.from('journal_entry_lines').select('debit_amount, credit_amount');
    let gd = 0, gc = 0;
    (allLines || []).forEach(l => {
      gd += parseFloat(l.debit_amount) || 0;
      gc += parseFloat(l.credit_amount) || 0;
    });

    console.log('=== GLOBAL TOTALS ===');
    console.log(`Debits: $${gd.toFixed(2)}`);
    console.log(`Credits: $${gc.toFixed(2)}`);
    console.log(`Difference: $${Math.abs(gd - gc).toFixed(2)}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

investigate();
