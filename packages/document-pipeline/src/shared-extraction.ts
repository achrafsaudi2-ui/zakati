// =============================================================================
// Shared extraction helpers (used by Tier 1 + Tier 2)
// =============================================================================
// Tier 1 calls these directly; Tier 2 imports them after OCR has produced text.
// =============================================================================

import type { ExtractedAccount } from './types';

const ISSUER_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: 'sab',          pattern: /Saudi British Bank|\bSAB\b/i },
  { id: 'boursorama',   pattern: /Boursorama/i },
  { id: 'bourse_direct',pattern: /Bourse\s?Direct/i },
  { id: 'ibkr',         pattern: /Interactive Brokers/i },
  { id: 'revolut',      pattern: /Revolut/i },
  { id: 'lendo',        pattern: /\bLendo\b/i },
  { id: 'd360',         pattern: /D360 Bank/i },
  { id: 'meem',         pattern: /Meem Bank|Meem by Gulf International/i },
  { id: 'degiro',       pattern: /DEGIRO/i },
];

export function detectIssuerFromText(text: string): string | undefined {
  for (const { id, pattern } of ISSUER_PATTERNS) {
    if (pattern.test(text)) return id;
  }
  return undefined;
}

/**
 * Extract accounts from raw text. Dispatches to per-issuer logic via
 * dynamic import, so Tier 2 (OCR) doesn't pull in every extractor up front.
 */
export async function extractFromText(
  text: string,
  issuer: string | undefined,
): Promise<ExtractedAccount[]> {
  // For Stage 4.6 we'll wire up the real per-issuer regex/parsing here,
  // co-located with sample statements from /mnt/project/.
  // Returning an empty array signals the orchestrator to escalate.
  return [];
}
