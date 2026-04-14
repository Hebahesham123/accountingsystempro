// Fix all header totals to match actual line totals
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function fixAllHeaders() {
  console.log('=== FIXING ALL JOURNAL ENTRY HEADERS ===\n');

  try {
    // Get all entries with lines
    const { data: entries } = await supabase
      .from('journal_entries')
      .select('id, entry_number');

    if (!entries) return;

    console.log(`Processing ${entries.length} entries...\n`);

    let fixedCount = 0;

    for (const entry of entries) {
      // Get lines for this entry
      const { data: lines } = await supabase
        .from('journal_entry_lines')
        .select('debit_amount, credit_amount')
        .eq('journal_entry_id', entry.id);

      if (!lines) continue;

      const sumDebit = lines.reduce((s, l) => s + (parseFloat(l.debit_amount) || 0), 0);
      const sumCredit = lines.reduce((s, l) => s + (parseFloat(l.credit_amount) || 0), 0);
      const isBalanced = Math.abs(sumDebit - sumCredit) < 0.01 && sumDebit > 0;

      // Update header
      const { error } = await supabase
        .from('journal_entries')
        .update({
          total_debit: sumDebit,
          total_credit: sumCredit,
          is_balanced: isBalanced
        })
        .eq('id', entry.id);

      if (!error) {
        fixedCount++;
        if (fixedCount % 50 === 0) console.log(`Fixed ${fixedCount} entries...`);
      }
    }

    console.log(`\n✓ Fixed ${fixedCount} entries\n`);

    // Verify
    const { data: allLines } = await supabase.from('journal_entry_lines').select('debit_amount, credit_amount');
    let gd = 0, gc = 0;
    (allLines || []).forEach(l => {
      gd += parseFloat(l.debit_amount) || 0;
      gc += parseFloat(l.credit_amount) || 0;
    });

    console.log('=== FINAL GLOBAL BALANCE ===');
    console.log(`Debits:  $${gd.toFixed(2)}`);
    console.log(`Credits: $${gc.toFixed(2)}`);
    console.log(`Difference: $${Math.abs(gd - gc).toFixed(2)}`);

    if (Math.abs(gd - gc) < 0.01) {
      console.log('\n✓✓✓ SUCCESS! ACCOUNTS ARE PERFECTLY BALANCED! ✓✓✓\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixAllHeaders();
