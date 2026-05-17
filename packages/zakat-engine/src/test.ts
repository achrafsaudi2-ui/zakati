// =============================================================================
// Engine validation — run Mohamed's case under all three views.
// =============================================================================
// Expected (new naming — Strict highest, Lenient lowest):
//   Strict:    ~SAR 20,632 net (snapshot, most inclusive)
//   Moderate:  ~SAR 13,685 net (time-weighted average)
//   Lenient:   ~SAR  7,369 net (haul-strict, lowest balance)
// =============================================================================

import { calculateZakat } from './engine';
import { buildMohamedCase } from './fixtures';

function fmtMoney(n: number, ccy = 'SAR'): string {
  return `${ccy} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function runView(view: 'Strict' | 'Moderate' | 'Lenient', expected: number): boolean {
  const input = buildMohamedCase(view);
  const out = calculateZakat(input);

  console.log('\n' + '='.repeat(80));
  console.log(`VIEW: ${view}`);
  console.log('='.repeat(80));

  console.log('\nAssumptions:');
  out.assumptions.forEach((a) => console.log('  - ' + a));

  console.log('\nLine items:');
  for (const li of out.perLineBreakdown) {
    const marker = li.included ? '✓' : '✗';
    const sign = li.zakatableInPrimary < 0 ? '' : ' ';
    console.log(
      `  ${marker} ${li.label.padEnd(45)} ${sign}${fmtMoney(li.zakatableInPrimary).padStart(15)} — ${li.reasoning}`
    );
  }

  console.log('\nTotals:');
  console.log(`  Gross zakatable wealth:    ${fmtMoney(out.totalZakatableInPrimary)}`);
  console.log(`  Liabilities (short-term):  ${fmtMoney(out.totalDeductibleLiabilitiesInPrimary)}`);
  console.log(`  Net zakatable:             ${fmtMoney(out.netZakatableInPrimary)}`);
  console.log(`  Nisab threshold:           ${fmtMoney(out.nisabThresholdInPrimary)}`);
  console.log(`  Above nisab?               ${out.isAboveNisab ? 'YES' : 'NO'}`);
  console.log(`  Zakat @ 2.5% (gross):      ${fmtMoney(out.zakatGrossInPrimary)}`);
  console.log(`  Less prepaid:              ${fmtMoney(out.prepaidInPrimary)}`);
  console.log(`  ZAKAT NET TO PAY:          ${fmtMoney(out.zakatNetInPrimary)}`);

  const diff = Math.abs(out.zakatNetInPrimary - expected);
  const tolerance = expected * 0.04; // 4% — accounts for FX rounding & estimates
  const pass = diff <= tolerance;
  console.log(`\n  Expected (~):              ${fmtMoney(expected)}`);
  console.log(`  Difference:                ${fmtMoney(diff)} (${((diff / expected) * 100).toFixed(2)}%)`);
  console.log(`  ${pass ? '✅ PASS (within 4%)' : '❌ FAIL (>4% off)'}`);

  return pass;
}

console.log('\n████████████████████████████████████████████████████████████████████████');
console.log('████ ZAKATI ENGINE — Mohamed\'s case, Eid Al-Adha 1447 (26 May 2026)  ████');
console.log('████████████████████████████████████████████████████████████████████████');

const results = [
  runView('Strict', 20632),    // snapshot of all current wealth — highest
  runView('Moderate', 13685),  // time-weighted average — middle
  runView('Lenient', 7369),    // haul-strict, lowest balance — lowest
];

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Tests passed: ${results.filter(Boolean).length} / ${results.length}`);
if (results.every(Boolean)) {
  console.log('\n🟢 All three views produce numbers within tolerance.');
  process.exit(0);
} else {
  console.log('\n🔴 Some views off. Review per-line outputs above.');
  process.exit(1);
}
