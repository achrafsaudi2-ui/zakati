'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Asset,
  CalcOutput,
  Currency,
  FxRates,
  Liability,
  NisabConfig,
  PrepaidZakat,
  View,
} from '@zakati/engine';
import { calculateZakat } from '@zakati/engine';

type AssetKind = Asset['kind'];

interface ZakatState {
  // --- Setup ---
  view: View;
  primaryCurrency: Currency;
  zakatDate: string; // YYYY-MM-DD

  // --- Configuration (refreshed from CMS on launch) ---
  fxRates: FxRates | null;
  nisab: NisabConfig | null;

  // --- Asset filter ---
  enabledCategories: AssetKind[];

  // --- Data ---
  assets: Asset[];
  liabilities: Liability[];
  prepaid: PrepaidZakat[];

  // --- UX ---
  visitedRoutes: string[];

  // --- Actions: setup ---
  setView: (view: View) => void;
  setPrimaryCurrency: (currency: Currency) => void;
  setZakatDate: (date: string) => void;
  setFxRates: (fx: FxRates) => void;
  setNisab: (nisab: NisabConfig) => void;

  // --- Actions: filter ---
  toggleCategory: (kind: AssetKind) => void;
  setEnabledCategories: (kinds: AssetKind[]) => void;

  // --- Actions: data ---
  upsertAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  upsertLiability: (liability: Liability) => void;
  removeLiability: (id: string) => void;
  upsertPrepaid: (prepaid: PrepaidZakat) => void;
  removePrepaid: (id: string) => void;

  // --- Actions: lifecycle ---
  markVisited: (route: string) => void;
  reset: () => void;
}

const DEFAULT_NISAB: NisabConfig = {
  goldGrams: 87.48,
  silverGrams: 612.36,
  goldPricePerGramInBase: 602.28,
  silverPricePerGramInBase: 9.5277,
  preferred: 'silver',
  base: 'SAR',
};

const DEFAULT_FX: FxRates = {
  base: 'SAR',
  asOf: new Date().toISOString().slice(0, 10),
  source: 'fallback',
  rates: { SAR: 1, USD: 1 / 3.79, EUR: 1 / 4.36, MAD: 1 / 0.41, GBP: 1 / 4.84, AED: 1 / 1.03 },
};

export const useZakatStore = create<ZakatState>()(
  persist(
    immer((set) => ({
      // Setup defaults — Strict is the new default (highest, recommended)
      view: 'Strict',
      primaryCurrency: 'SAR',
      zakatDate: new Date().toISOString().slice(0, 10),

      fxRates: DEFAULT_FX,
      nisab: DEFAULT_NISAB,

      enabledCategories: [],

      assets: [],
      liabilities: [],
      prepaid: [],

      visitedRoutes: [],

      setView: (view) => set((s) => { s.view = view; }),
      setPrimaryCurrency: (currency) => set((s) => { s.primaryCurrency = currency; }),
      setZakatDate: (date) => set((s) => { s.zakatDate = date; }),
      setFxRates: (fx) => set((s) => { s.fxRates = fx; }),
      setNisab: (nisab) => set((s) => { s.nisab = nisab; }),

      toggleCategory: (kind) =>
        set((s) => {
          const idx = s.enabledCategories.indexOf(kind);
          if (idx === -1) s.enabledCategories.push(kind);
          else s.enabledCategories.splice(idx, 1);
        }),
      setEnabledCategories: (kinds) => set((s) => { s.enabledCategories = kinds; }),

      upsertAsset: (asset) =>
        set((s) => {
          const idx = s.assets.findIndex((a) => a.id === asset.id);
          if (idx === -1) s.assets.push(asset);
          else s.assets[idx] = asset;
        }),
      removeAsset: (id) => set((s) => { s.assets = s.assets.filter((a) => a.id !== id); }),

      upsertLiability: (l) =>
        set((s) => {
          const idx = s.liabilities.findIndex((x) => x.id === l.id);
          if (idx === -1) s.liabilities.push(l);
          else s.liabilities[idx] = l;
        }),
      removeLiability: (id) => set((s) => { s.liabilities = s.liabilities.filter((x) => x.id !== id); }),

      upsertPrepaid: (p) =>
        set((s) => {
          const idx = s.prepaid.findIndex((x) => x.id === p.id);
          if (idx === -1) s.prepaid.push(p);
          else s.prepaid[idx] = p;
        }),
      removePrepaid: (id) => set((s) => { s.prepaid = s.prepaid.filter((x) => x.id !== id); }),

      markVisited: (route) =>
        set((s) => {
          if (!s.visitedRoutes.includes(route)) s.visitedRoutes.push(route);
        }),

      reset: () =>
        set(() => ({
          view: 'Strict',
          primaryCurrency: 'SAR',
          zakatDate: new Date().toISOString().slice(0, 10),
          fxRates: DEFAULT_FX,
          nisab: DEFAULT_NISAB,
          enabledCategories: [],
          assets: [],
          liabilities: [],
          prepaid: [],
          visitedRoutes: [],
        })),
    })),
    {
      name: 'zakati-state-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        view: state.view,
        primaryCurrency: state.primaryCurrency,
        zakatDate: state.zakatDate,
        enabledCategories: state.enabledCategories,
        assets: state.assets,
        liabilities: state.liabilities,
        prepaid: state.prepaid,
        visitedRoutes: state.visitedRoutes,
      }),
    },
  ),
);

/**
 * Compute all three views from current state.
 * Memoized via Zustand's shallow comparison + React's render lifecycle.
 */
export function useResultsAcrossViews(): Record<View, CalcOutput> | null {
  const { primaryCurrency, zakatDate, fxRates, nisab, assets, liabilities, prepaid } =
    useZakatStore(
      useShallow((s) => ({
        primaryCurrency: s.primaryCurrency,
        zakatDate: s.zakatDate,
        fxRates: s.fxRates,
        nisab: s.nisab,
        assets: s.assets,
        liabilities: s.liabilities,
        prepaid: s.prepaid,
      })),
    );

  if (!fxRates || !nisab) return null;

  const views: View[] = ['Strict', 'Moderate', 'Lenient'];
  const out = {} as Record<View, CalcOutput>;
  for (const view of views) {
    out[view] = calculateZakat({
      view,
      zakatDate,
      primaryCurrency,
      fxRates,
      nisab,
      assets,
      liabilities,
      prepaid,
    });
  }
  return out;
}

/** Lightweight selector: just the current-view result. */
export function useCurrentResult(): CalcOutput | null {
  const view = useZakatStore((s) => s.view);
  const all = useResultsAcrossViews();
  return all?.[view] ?? null;
}
