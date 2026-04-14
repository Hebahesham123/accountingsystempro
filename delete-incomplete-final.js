// Delete all incomplete entries (only debits or only credits) in one operation
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xswmesbehfopdnearwfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd21lc2JlaGZvcGRuZWFyd2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTczODUsImV4cCI6MjA4MTgzMzM4NX0.s9AOjehfAf1daZPKBbSoQUrHl2EZxFctktNHItJ7PeQ'
);

async function deleteIncomplete() {
  console.log('=== DELETING ALL INCOMPLETE JOURNAL ENTRIES ===\n');

  try {
    // Get all entries
    let allEntries = [], offset = 0;
    while (true) {
      const { data } = await supabase.from('journal_entries').select('id, entry_number, total_debit, total_credit').range(offset, offset + 999);
      if (!data || data.length === 0) break;
      allEntries = allEntries.concat(data);
      offset += 1000;
      if (data.length < 1000) break;
    }

    // Get all lines
    let allLines = [], offset2 = 0;
    while (true) {
      const { data } = await supabase.from('journal_entry_lines').select('journal_entry_id, debit_amount, credit_amount').range(offset2, offset2 + 4999);
      if (!data || data.length === 0) break;
      allLines = allLines.concat(data);
      offset2 += 5000;
      if (data.length < 5000) break;
    }

    // Map lines by entry
    const linesByEntry = new Map();
    allLines.forEach(l => {
      const eid = l.journal_entry_id;
      if (!linesByEntry.has(eid)) linesByEntry.set(eid, { debits: 0, credits: 0 });
      const e = linesByEntry.get(eid);
      e.debits += parseFloat(l.debit_amount) || 0;
      e.credits += parseFloat(l.credit_amount) || 0;
    });

    // Find incomplete entries (only d or only c)
    const incompleteIds = [];
    for (const entry of allEntries) {
      const lines = linesByEntry.get(entry.id);
      if (!lines) continue;
      const isBalanced = Math.abs(lines.debits - lines.credits) < 0.01;
      if (!isBalanced) {
        incompleteIds.push(entry.id);
        console.log(`Delete: ${entry.entry_number} (D:$${lines.debits.toFixed(2)}, C:$${lines.credits.toFixed(2)})`);
      }
    }

    // Delete all incomplete entries
    for (const id of incompleteIds) {
      await supabase.from('journal_entry_lines').delete().eq('journal_entry_id', id);
      await supabase.from('journal_entries').delete().eq('id', id);
    }

    console.log(`\n✓ Deleted ${incompleteIds.length} incomplete entries\n`);

    // Final check
    const { data: finalLines } = await supabase.from('journal_entry_lines').select('debit_amount, credit_amount');
    let gd = 0, gc = 0;
    (finalLines || []).forEach(l => {
      gd += parseFloat(l.debit_amount) || 0;
      gc += parseFloat(l.credit_amount) || 0;
    });

    console.log('=== FINAL BALANCE ===');
    console.log(`Debits:  $${gd.toFixed(2)}`);
    console.log(`Credits: $${gc.toFixed(2)}`);
    console.log(`Diff:    $${Math.abs(gd - gc).toFixed(2)}`);

    if (Math.abs(gd - gc) < 0.01) {
      console.log('\n✓✓✓ PERFECTLY BALANCED! ✓✓✓\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

deleteIncomplete();
