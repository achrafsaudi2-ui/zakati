// =============================================================================
// Zakati — Calculation Engine
// =============================================================================
// Pure functions. No I/O. Deterministic.
// =============================================================================

import type {
  Asset,
  BusinessAssets,
  CalcInput,
  CalcOutput,
  CashAccount,
  CashOnHand,
  Crypto,
  Currency,
  FxRates,
  IslamicDeposit,
  Liability,
  LineItem,
  NisabConfig,
  P2PInvestment,
  PreciousMetal,
  PrepaidZakat,
  Receivable,
  RentalIncomeCash,
  Stock,
  View,
} from './types';

// -----------------------------------------------------------------------------
// Constants (admin-overridable via CMS in production)
// -----------------------------------------------------------------------------

export const ZAKAT_RATE = 0.025;
export const HAUL_DAYS = 354; // lunar year approximation

/** Stock proxy by view. AAOIFI Standard #35 = 25%. Same across all views. */
export const STOCK_PROXY: Record<View, number> = {
  Lenient: 0.25,
  Moderate: 0.25,
  Strict: 0.25,
};

// -----------------------------------------------------------------------------
// Currency conversion
// -----------------------------------------------------------------------------

export function convert(amount: number, from: Currency, to: Currency, fx: FxRates): number {
  if (from === to) return amount;
  const fromRate = from === fx.base ? 1 : fx.rates[from];
  const toRate = to === fx.base ? 1 : fx.rates[to];
  if (fromRate === undefined) throw new Error(`No FX rate for ${from}`);
  if (toRate === undefined) throw new Error(`No FX rate for ${to}`);
  // Convert `from` -> base -> `to`
  const inBase = amount / fromRate;
  return inBase * toRate;
}

// -----------------------------------------------------------------------------
// Nisab
// -----------------------------------------------------------------------------

export function nisabThreshold(nisab: NisabConfig, primary: Currency, fx: FxRates): number {
  const gold = nisab.goldGrams * nisab.goldPricePerGramInBase;
  const silver = nisab.silverGrams * nisab.silverPricePerGramInBase;
  const chosen = nisab.preferred === 'silver' ? silver : gold;
  return convert(chosen, nisab.base, primary, fx);
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function mkExcluded(category: string, label: string, currency: Currency, reasoning: string): LineItem {
  return { category, label, originalAmount: 0, originalCurrency: currency, zakatableInPrimary: 0, reasoning, included: false };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// -----------------------------------------------------------------------------
// Per-category calculators
// -----------------------------------------------------------------------------

function calcCashAccount(a: CashAccount, v: View, fx: FxRates, p: Currency): LineItem {
  let amount: number;
  let reasoning: string;

  if (a.isStable) {
    amount = a.currentBalance;
    reasoning = 'Steady balance — current value used in all views.';
  } else if (v === 'Lenient') {
    if (!a.heldOverHaul) {
      return mkExcluded('cash_account', a.label, a.currency, 'Lenient view: not held continuously for full lunar year.');
    }
    amount = a.lowestBalance ?? a.currentBalance;
    reasoning = 'Lenient view: lowest balance during the haul.';
  } else if (v === 'Moderate') {
    amount = a.averageBalance ?? a.currentBalance;
    reasoning = 'Moderate view: average balance during the haul.';
  } else {
    amount = a.currentBalance;
    reasoning = 'Strict view (snapshot): current balance on zakat date.';
  }

  return {
    category: 'cash_account',
    label: a.label,
    originalAmount: amount,
    originalCurrency: a.currency,
    zakatableInPrimary: convert(amount, a.currency, p, fx),
    reasoning,
    included: true,
  };
}

function calcCashOnHand(a: CashOnHand, v: View, fx: FxRates, p: Currency): LineItem {
  // Moderate + Lenient require haul; Strict doesn't.
  const requiresHaul = v === 'Lenient' || v === 'Moderate';
  if (requiresHaul && !a.heldOverYear) {
    return mkExcluded('cash_on_hand', 'Cash on hand', a.currency, `${v} view: cash on hand not held ≥1 lunar year.`);
  }
  return {
    category: 'cash_on_hand',
    label: 'Cash on hand',
    originalAmount: a.amount,
    originalCurrency: a.currency,
    zakatableInPrimary: convert(a.amount, a.currency, p, fx),
    reasoning: 'Cash on hand counts as zakatable wealth.',
    included: true,
  };
}

function calcPreciousMetal(a: PreciousMetal, v: View, fx: FxRates, p: Currency, nisab: NisabConfig): LineItem {
  const include = v === 'Lenient' || !a.isRegularlyWorn;
  const pricePerGramInBase = a.type === 'gold' ? nisab.goldPricePerGramInBase : nisab.silverPricePerGramInBase;
  const valueInBase = include ? a.pureGrams * pricePerGramInBase : 0;
  return {
    category: 'precious_metal',
    label: `${a.type === 'gold' ? 'Gold' : 'Silver'}${a.isRegularlyWorn ? ' (worn)' : ''}`,
    originalAmount: a.pureGrams,
    originalCurrency: a.type === 'gold' ? 'g_gold' : 'g_silver',
    zakatableInPrimary: convert(valueInBase, nisab.base, p, fx),
    reasoning: include ? `${a.pureGrams}g × spot price.` : 'Worn jewellery exempt under Moderate / Lenient (non-Hanafi schools).',
    included: include,
  };
}

function calcStock(a: Stock, v: View, fx: FxRates, p: Currency): LineItem {
  // Pick the right basis per view
  let basis: number;
  let basisLabel: string;

  if (v === 'Lenient') {
    if (!a.heldOverYear) {
      return mkExcluded('stock', a.label, a.currency, 'Lenient view: position acquired during haul.');
    }
    basis = a.haulCompletedMarketValue ?? a.marketValue;
    basisLabel = 'haul-completed value at current prices';
  } else if (v === 'Moderate') {
    basis = a.averageMarketValue ?? a.marketValue;
    basisLabel = 'time-weighted average market value';
  } else {
    basis = a.marketValue;
    basisLabel = 'current market value (snapshot)';
  }

  const proxy = a.intent === 'long_term' ? STOCK_PROXY[v] : 1.0;
  const zakatableNative = basis * proxy;

  return {
    category: 'stock',
    label: a.label,
    originalAmount: basis,
    originalCurrency: a.currency,
    zakatableInPrimary: convert(zakatableNative, a.currency, p, fx),
    reasoning:
      a.intent === 'long_term'
        ? `Long-term × ${(proxy * 100).toFixed(0)}% proxy (AAOIFI Standard 35), basis = ${basisLabel}.`
        : `Trading — full ${basisLabel}.`,
    included: true,
  };
}

function calcCrypto(a: Crypto, v: View, fx: FxRates, p: Currency): LineItem {
  // Moderate + Lenient require haul; Strict doesn't.
  const requiresHaul = v === 'Lenient' || v === 'Moderate';
  if (requiresHaul && !a.heldOverYear) {
    return mkExcluded('crypto', a.token, a.token, `${v} view: not held ≥1 lunar year.`);
  }
  const valueInBase = a.quantity * a.priceInBase;
  return {
    category: 'crypto',
    label: `${a.token} (${a.quantity})`,
    originalAmount: a.quantity,
    originalCurrency: a.token,
    zakatableInPrimary: convert(valueInBase, fx.base, p, fx),
    reasoning: a.isStablecoin ? 'Stablecoin treated as cash.' : 'Tradable digital asset at spot price.',
    included: true,
  };
}

function calcIslamicDeposit(a: IslamicDeposit, v: View, fx: FxRates, p: Currency): LineItem {
  const total = a.principal + (a.accruedProfit ?? 0);
  const daysHeld = a.daysHeldInHaul ?? HAUL_DAYS;

  if (v === 'Lenient') {
    if (!a.heldOverHaul) {
      return mkExcluded('islamic_deposit', a.label, a.currency, 'Lenient view: deposit funded during haul, not haul-completed.');
    }
    return {
      category: 'islamic_deposit',
      label: a.label,
      originalAmount: total,
      originalCurrency: a.currency,
      zakatableInPrimary: convert(total, a.currency, p, fx),
      reasoning: 'Murabaha/Sukuk principal — held full haul.',
      included: true,
    };
  }

  if (v === 'Moderate') {
    const weight = Math.min(daysHeld / HAUL_DAYS, 1);
    const weighted = total * weight;
    return {
      category: 'islamic_deposit',
      label: a.label,
      originalAmount: weighted,
      originalCurrency: a.currency,
      zakatableInPrimary: convert(weighted, a.currency, p, fx),
      reasoning: `Moderate: time-weighted (${daysHeld}/${HAUL_DAYS} days) = ${(weight * 100).toFixed(1)}%.`,
      included: true,
    };
  }

  // Strict (snapshot)
  return {
    category: 'islamic_deposit',
    label: a.label,
    originalAmount: total,
    originalCurrency: a.currency,
    zakatableInPrimary: convert(total, a.currency, p, fx),
    reasoning: 'Strict view (snapshot): principal at face value.',
    included: true,
  };
}

function calcP2P(a: P2PInvestment, v: View, fx: FxRates, p: Currency): LineItem[] {
  // Wallet
  let wallet: number;
  let walletReason: string;
  if (v === 'Moderate') {
    wallet = a.averageWalletBalance ?? a.walletBalance;
    walletReason = 'Moderate: average wallet balance during haul.';
  } else {
    wallet = a.walletBalance;
    walletReason = v === 'Lenient' ? 'Lenient: current wallet (platform held >1yr).' : 'Strict view (snapshot): current wallet.';
  }

  // Outstanding
  let outstandingBase: number;
  if (v === 'Moderate') {
    outstandingBase = a.averageOutstanding ?? a.outstandingPrincipal;
  } else {
    outstandingBase = a.outstandingPrincipal;
  }
  const haircut = a.defaultRiskPercent / 100;
  const adjustedOutstanding = outstandingBase * (1 - haircut);

  return [
    {
      category: 'p2p_wallet',
      label: `${a.platform} — wallet`,
      originalAmount: wallet,
      originalCurrency: a.currency,
      zakatableInPrimary: convert(wallet, a.currency, p, fx),
      reasoning: walletReason,
      included: true,
    },
    {
      category: 'p2p_outstanding',
      label: `${a.platform} — outstanding (${(haircut * 100).toFixed(1)}% default haircut)`,
      originalAmount: adjustedOutstanding,
      originalCurrency: a.currency,
      zakatableInPrimary: convert(adjustedOutstanding, a.currency, p, fx),
      reasoning: `Outstanding × (1 − ${(haircut * 100).toFixed(1)}% default risk).`,
      included: true,
    },
  ];
}

function calcReceivable(a: Receivable, v: View, fx: FxRates, p: Currency): LineItem {
  if (a.status === 'lost') return mkExcluded('receivable', a.label, a.currency, 'Lost / written off — excluded.');
  if (v === 'Lenient' && !a.heldOverYear) return mkExcluded('receivable', a.label, a.currency, 'Lenient view: haul not completed on this receivable.');
  if (a.status === 'doubtful' && v === 'Lenient') return mkExcluded('receivable', a.label, a.currency, 'Lenient view: doubtful debt excluded until received.');
  return {
    category: 'receivable',
    label: a.label,
    originalAmount: a.amount,
    originalCurrency: a.currency,
    zakatableInPrimary: convert(a.amount, a.currency, p, fx),
    reasoning: a.status === 'good_debt' ? 'Good debt — expected repayment.' : 'Doubtful debt — included annually (option a).',
    included: true,
  };
}

function calcBusiness(a: BusinessAssets, _v: View, fx: FxRates, p: Currency): LineItem {
  const total = a.inventoryValue + a.cashBalance + a.receivables;
  return {
    category: 'business',
    label: a.label,
    originalAmount: total,
    originalCurrency: a.currency,
    zakatableInPrimary: convert(total, a.currency, p, fx),
    reasoning: 'Inventory + cash + receivables (fixed assets excluded).',
    included: true,
  };
}

function calcRentalIncome(a: RentalIncomeCash, v: View, fx: FxRates, p: Currency): LineItem {
  const requiresHaul = v === 'Lenient' || v === 'Moderate';
  if (requiresHaul && !a.heldOverYear) return mkExcluded('rental_income_cash', a.label, a.currency, `${v} view: accumulated rent <1 lunar year.`);
  return {
    category: 'rental_income_cash',
    label: a.label,
    originalAmount: a.retainedCash,
    originalCurrency: a.currency,
    zakatableInPrimary: convert(a.retainedCash, a.currency, p, fx),
    reasoning: 'Retained rental income (property capital excluded).',
    included: true,
  };
}

function calcLiability(l: Liability, fx: FxRates, p: Currency): LineItem {
  if (!l.dueWithin12Months) {
    return {
      category: 'liability',
      label: l.label,
      originalAmount: l.amount,
      originalCurrency: l.currency,
      zakatableInPrimary: 0,
      reasoning: 'Long-term liability — not deductible.',
      included: false,
    };
  }
  return {
    category: 'liability',
    label: l.label,
    originalAmount: l.amount,
    originalCurrency: l.currency,
    zakatableInPrimary: -convert(l.amount, l.currency, p, fx),
    reasoning: 'Short-term debt — deductible.',
    included: true,
  };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export function calculateZakat(input: CalcInput): CalcOutput {
  const { view, zakatDate, primaryCurrency: p, fxRates: fx, nisab, assets, liabilities, prepaid } = input;

  const lines: LineItem[] = [];
  for (const a of assets) {
    switch (a.kind) {
      case 'cash_account':       lines.push(calcCashAccount(a, view, fx, p)); break;
      case 'cash_on_hand':       lines.push(calcCashOnHand(a, view, fx, p)); break;
      case 'precious_metal':     lines.push(calcPreciousMetal(a, view, fx, p, nisab)); break;
      case 'stock':              lines.push(calcStock(a, view, fx, p)); break;
      case 'crypto':             lines.push(calcCrypto(a, view, fx, p)); break;
      case 'islamic_deposit':    lines.push(calcIslamicDeposit(a, view, fx, p)); break;
      case 'p2p_investment':     lines.push(...calcP2P(a, view, fx, p)); break;
      case 'receivable':         lines.push(calcReceivable(a, view, fx, p)); break;
      case 'business':           lines.push(calcBusiness(a, view, fx, p)); break;
      case 'rental_income_cash': lines.push(calcRentalIncome(a, view, fx, p)); break;
    }
  }
  const liabilityLines = liabilities.map((l) => calcLiability(l, fx, p));

  const totalZakatable = lines.filter((l) => l.included).reduce((s, l) => s + l.zakatableInPrimary, 0);
  const totalDeductible = -liabilityLines.filter((l) => l.included).reduce((s, l) => s + l.zakatableInPrimary, 0);
  const net = totalZakatable - totalDeductible;
  const threshold = nisabThreshold(nisab, p, fx);
  const above = net >= threshold;
  const gross = above ? net * ZAKAT_RATE : 0;
  const prepaidTotal = prepaid.reduce((s, pp) => s + convert(pp.amount, pp.currency, p, fx), 0);
  const netZakat = Math.max(0, gross - prepaidTotal);

  return {
    view,
    zakatDate,
    primaryCurrency: p,
    fxAsOf: fx.asOf,
    fxSource: fx.source,
    totalZakatableInPrimary: round2(totalZakatable),
    totalDeductibleLiabilitiesInPrimary: round2(totalDeductible),
    netZakatableInPrimary: round2(net),
    nisabThresholdInPrimary: round2(threshold),
    isAboveNisab: above,
    zakatRate: ZAKAT_RATE,
    zakatGrossInPrimary: round2(gross),
    prepaidInPrimary: round2(prepaidTotal),
    zakatNetInPrimary: round2(netZakat),
    perLineBreakdown: lines.concat(liabilityLines).map((li) => ({
      ...li,
      originalAmount: round2(li.originalAmount),
      zakatableInPrimary: round2(li.zakatableInPrimary),
    })),
    assumptions: [
      `View: ${view}`,
      `Zakat date: ${zakatDate}`,
      `Primary currency: ${p}`,
      `FX rates from ${fx.source}, as of ${fx.asOf}`,
      `Nisab preference: ${nisab.preferred} (${nisab.preferred === 'silver' ? nisab.silverGrams : nisab.goldGrams}g)`,
      `Nisab threshold in ${p}: ${threshold.toFixed(2)}`,
      `Stock proxy: ${(STOCK_PROXY[view] * 100).toFixed(0)}% for long-term holdings`,
      `Zakat rate: ${(ZAKAT_RATE * 100).toFixed(1)}%`,
    ],
  };
}
