// =============================================================================
// Zakati — Type Definitions
// =============================================================================
// Pure types. Engine logic lives in engine.ts.
// =============================================================================

/** ISO 4217 currency code (e.g. 'SAR', 'USD', 'EUR', 'MAD') */
export type Currency = string;

/** Methodology view */
export type View = 'Strict' | 'Moderate' | 'Lenient';

/** ISO 8601 date string (YYYY-MM-DD) */
export type ISODate = string;

// -----------------------------------------------------------------------------
// FX & Nisab
// -----------------------------------------------------------------------------

export interface FxRates {
  base: Currency;
  rates: Record<Currency, number>;
  asOf: ISODate;
  source: string;
}

export interface NisabConfig {
  goldGrams: number;
  silverGrams: number;
  goldPricePerGramInBase: number;
  silverPricePerGramInBase: number;
  preferred: 'gold' | 'silver';
  base: Currency;
}

// -----------------------------------------------------------------------------
// Assets — discriminated union
// -----------------------------------------------------------------------------
//
// Pattern: fluctuating assets carry up to three values:
//   current   → Strict (snapshot)
//   average   → Moderate
//   lowest / haul-completed → Strict
//
// Each falls back to the previous if not provided.
//

export interface CashAccount {
  kind: 'cash_account';
  id: string;
  label: string;
  currency: Currency;
  currentBalance: number;
  averageBalance?: number;
  lowestBalance?: number;
  /** True = current balance used in all views (skip averaging). */
  isStable: boolean;
  /** Continuously held during the haul? Strict gate. */
  heldOverHaul: boolean;
}

export interface CashOnHand {
  kind: 'cash_on_hand';
  id: string;
  amount: number;
  currency: Currency;
  /** Moderate & Lenient exclude if false; Strict includes regardless. */
  heldOverYear: boolean;
}

export interface PreciousMetal {
  kind: 'precious_metal';
  id: string;
  type: 'gold' | 'silver';
  pureGrams: number;
  isRegularlyWorn: boolean;
}

export interface Stock {
  kind: 'stock';
  id: string;
  label: string;
  currency: Currency;
  marketValue: number;
  /** Time-weighted average market value during haul (Moderate view). */
  averageMarketValue?: number;
  /** Value at current prices of positions that completed haul (Strict view). */
  haulCompletedMarketValue?: number;
  intent: 'long_term' | 'trading';
  heldOverYear: boolean;
}

export interface Crypto {
  kind: 'crypto';
  id: string;
  token: string;
  quantity: number;
  priceInBase: number;
  isStablecoin: boolean;
  /** Moderate & Lenient gate; Strict ignores. */
  heldOverYear: boolean;
}

export interface IslamicDeposit {
  kind: 'islamic_deposit';
  id: string;
  label: string;
  depositType: 'murabaha' | 'sukuk' | 'other';
  currency: Currency;
  principal: number;
  accruedProfit?: number;
  /** Continuously held during the haul? Strict gate. */
  heldOverHaul: boolean;
  /** Days during haul the deposit was funded (≤354). Moderate weights by days/354. */
  daysHeldInHaul?: number;
}

export interface P2PInvestment {
  kind: 'p2p_investment';
  id: string;
  platform: string;
  currency: Currency;
  walletBalance: number;
  averageWalletBalance?: number;
  outstandingPrincipal: number;
  averageOutstanding?: number;
  defaultRiskPercent: number;
  defaultedAmount: number;
  expectedProfit?: number;
}

export interface Receivable {
  kind: 'receivable';
  id: string;
  label: string;
  amount: number;
  currency: Currency;
  status: 'good_debt' | 'doubtful' | 'lost';
  heldOverYear: boolean;
}

export interface BusinessAssets {
  kind: 'business';
  id: string;
  label: string;
  currency: Currency;
  inventoryValue: number;
  cashBalance: number;
  receivables: number;
}

export interface RentalIncomeCash {
  kind: 'rental_income_cash';
  id: string;
  label: string;
  retainedCash: number;
  currency: Currency;
  heldOverYear: boolean;
}

export type Asset =
  | CashAccount
  | CashOnHand
  | PreciousMetal
  | Stock
  | Crypto
  | IslamicDeposit
  | P2PInvestment
  | Receivable
  | BusinessAssets
  | RentalIncomeCash;

// -----------------------------------------------------------------------------
// Liabilities & Prepaid
// -----------------------------------------------------------------------------

export interface Liability {
  id: string;
  label: string;
  amount: number;
  currency: Currency;
  dueWithin12Months: boolean;
}

export interface PrepaidZakat {
  id: string;
  amount: number;
  currency: Currency;
  note?: string;
}

// -----------------------------------------------------------------------------
// Engine input/output
// -----------------------------------------------------------------------------

export interface CalcInput {
  view: View;
  zakatDate: ISODate;
  primaryCurrency: Currency;
  fxRates: FxRates;
  nisab: NisabConfig;
  assets: Asset[];
  liabilities: Liability[];
  prepaid: PrepaidZakat[];
}

export interface LineItem {
  category: string;
  label: string;
  originalAmount: number;
  originalCurrency: Currency;
  zakatableInPrimary: number;
  reasoning: string;
  included: boolean;
}

export interface CalcOutput {
  view: View;
  zakatDate: ISODate;
  primaryCurrency: Currency;
  fxAsOf: ISODate;
  fxSource: string;
  totalZakatableInPrimary: number;
  totalDeductibleLiabilitiesInPrimary: number;
  netZakatableInPrimary: number;
  nisabThresholdInPrimary: number;
  isAboveNisab: boolean;
  zakatRate: number;
  zakatGrossInPrimary: number;
  prepaidInPrimary: number;
  zakatNetInPrimary: number;
  perLineBreakdown: LineItem[];
  assumptions: string[];
}
