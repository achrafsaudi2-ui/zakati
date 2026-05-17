// =============================================================================
// Test fixture — Mohamed's case, Eid Al-Adha 1447 AH
// =============================================================================
// Expected outputs (from Stage 2 final accepted numbers):
//   Strict:   ~SAR 7,369 net
//   Moderate: ~SAR 13,685 net
//   Strict:   ~SAR 20,632 net (snapshot, ignoring haul gates on Pre-Soon etc.)
// =============================================================================

import type { CalcInput, FxRates, NisabConfig } from './types.js';

export const fxRates: FxRates = {
  base: 'SAR',
  asOf: '2026-05-16',
  source: 'Xe mid-market + exchange-rates.org',
  rates: {
    SAR: 1.0,
    USD: 1 / 3.79,
    EUR: 1 / 4.36,
    MAD: 1 / 0.41,
  },
};

export const nisab: NisabConfig = {
  goldGrams: 87.48,
  silverGrams: 612.36,
  goldPricePerGramInBase: 602.28,
  silverPricePerGramInBase: 9.5277,
  preferred: 'silver',
  base: 'SAR',
};

export function buildMohamedCase(view: 'Lenient' | 'Moderate' | 'Strict'): CalcInput {
  return {
    view,
    zakatDate: '2026-05-26',
    primaryCurrency: 'SAR',
    fxRates,
    nisab,
    assets: [
      // ---- CASH & BANK ----
      { kind: 'cash_account', id: 'sab', label: 'SAB KSA', currency: 'SAR',
        currentBalance: 275000, averageBalance: 250333, lowestBalance: 53697,
        isStable: false, heldOverHaul: true },
      { kind: 'cash_account', id: 'boursorama', label: 'Boursorama France', currency: 'EUR',
        currentBalance: 4639, averageBalance: 5267, lowestBalance: 374.83,
        isStable: false, heldOverHaul: true },
      { kind: 'cash_account', id: 'revolut_eur', label: 'Revolut Spain (EUR)', currency: 'EUR',
        currentBalance: 1838.76, averageBalance: 3000, lowestBalance: 1000,
        isStable: false, heldOverHaul: true },
      { kind: 'cash_account', id: 'morocco', label: 'Morocco bank', currency: 'MAD',
        currentBalance: 250000, averageBalance: 250000, lowestBalance: 250000,
        isStable: true, heldOverHaul: true },
      { kind: 'cash_account', id: 'bd_cash', label: 'BourseDirect cash', currency: 'EUR',
        currentBalance: 1113.45, averageBalance: 5394, lowestBalance: 1113.45,
        isStable: false, heldOverHaul: true },
      { kind: 'cash_account', id: 'ibkr_cash', label: 'IBKR USD cash', currency: 'USD',
        currentBalance: 6735.62, averageBalance: 3000, lowestBalance: 0,
        isStable: false, heldOverHaul: false }, // ← Strict excludes (was negative at start)
      { kind: 'cash_on_hand', id: 'pocket', amount: 2000, currency: 'SAR', heldOverYear: true },

      // ---- ISLAMIC DEPOSITS ---- (funded 15 days ago from SAB)
      { kind: 'islamic_deposit', id: 'd360', label: 'D360 Murabaha', depositType: 'murabaha',
        currency: 'SAR', principal: 100000, heldOverHaul: false, daysHeldInHaul: 15 },
      { kind: 'islamic_deposit', id: 'meem', label: 'Meem Bank', depositType: 'murabaha',
        currency: 'SAR', principal: 100000, heldOverHaul: false, daysHeldInHaul: 15 },

      // ---- CRYPTO ----
      { kind: 'crypto', id: 'usdc_wallet', token: 'USDC', quantity: 4000, priceInBase: 3.79,
        isStablecoin: true, heldOverYear: true },
      { kind: 'crypto', id: 'presoon', token: 'USDC (Pre-Soon share)', quantity: 9500, priceInBase: 3.79,
        isStablecoin: true, heldOverYear: false }, // Strict + Moderate exclude

      // ---- LENDO (P2P) ----
      { kind: 'p2p_investment', id: 'lendo', platform: 'Lendo', currency: 'SAR',
        walletBalance: 42304.15, averageWalletBalance: 20000,
        outstandingPrincipal: 128462.47, averageOutstanding: 128462.47,
        defaultRiskPercent: 3, defaultedAmount: 1944 },

      // ---- STOCKS ----
      { kind: 'stock', id: 'bd_stocks', label: 'BourseDirect portfolio', currency: 'EUR',
        marketValue: 32822.73, averageMarketValue: 35810, haulCompletedMarketValue: 32822.73,
        intent: 'long_term', heldOverYear: true },
      { kind: 'stock', id: 'ibkr_stocks', label: 'Interactive Brokers portfolio', currency: 'USD',
        marketValue: 34986.60, averageMarketValue: 15000, haulCompletedMarketValue: 8158,
        intent: 'long_term', heldOverYear: true },
      { kind: 'stock', id: 'degiro', label: 'DEGIRO portfolio (locked)', currency: 'EUR',
        marketValue: 7000, averageMarketValue: 7000, haulCompletedMarketValue: 7000,
        intent: 'long_term', heldOverYear: true },

      // ---- RECEIVABLES ----
      { kind: 'receivable', id: 'father', label: 'Father (lent Hajj 1446)',
        amount: 3000, currency: 'EUR', status: 'good_debt', heldOverYear: true },
      { kind: 'receivable', id: 'friend', label: 'Friend (due 1 Jun 2026)',
        amount: 100000, currency: 'MAD', status: 'good_debt', heldOverYear: true },
    ],
    liabilities: [
      { id: 'wife', label: 'Owed to wife', amount: 1000, currency: 'EUR', dueWithin12Months: true },
    ],
    prepaid: [
      { id: 'pp1', amount: 1000, currency: 'SAR' },
      { id: 'pp2', amount: 1000, currency: 'MAD' },
      { id: 'pp3', amount: 2000, currency: 'MAD' },
      { id: 'pp4', amount: 130, currency: 'EUR' },
      { id: 'pp5', amount: 200, currency: 'EUR' },
      { id: 'pp6', amount: 60, currency: 'EUR' },
    ],
  };
}
