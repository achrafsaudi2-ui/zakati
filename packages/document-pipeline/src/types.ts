// =============================================================================
// Document Pipeline — Types
// =============================================================================
// Parsers ingest a DocumentInput, emit ProcessingState updates, and return
// a ParseResult. The orchestrator picks the lowest tier that can handle the
// document and escalates only when confidence is low.
// =============================================================================

import type { Currency, ISODate } from '@zakati/engine';

export type DocumentSource = 'file_picker' | 'camera' | 'clipboard';
export type DocumentFileType = 'pdf' | 'image' | 'csv' | 'text';

export interface DocumentInput {
  file: File;
  fileName: string;
  fileType: DocumentFileType;
  source: DocumentSource;
}

export type Tier = 1 | 2 | 3;

export type ProcessingStage =
  | 'init'         // loading parser / model
  | 'reading'      // extracting raw text / image data
  | 'identifying'  // detecting issuer + account boundaries
  | 'calculating'  // computing averages, lowest, statement period
  | 'done'
  | 'error';

export interface ProcessingState {
  stage: ProcessingStage;
  tier: Tier;
  /** 0–100. Drives the progress bar. */
  progress: number;
  /** Human-readable status line. Goes straight into the substep UI. */
  message: string;
  /** Optional context fields. */
  detectedIssuer?: string;
  pagesProcessed?: number;
  totalPages?: number;
}

export type ExtractedCategory =
  | 'cash_account'
  | 'cash_on_hand'
  | 'precious_metal'
  | 'stock_holdings'   // collection of positions
  | 'crypto'
  | 'islamic_deposit'
  | 'p2p_investment'
  | 'receivable'
  | 'business'
  | 'rental_income_cash';

export interface ExtractedStockPosition {
  symbol: string;
  name?: string;
  quantity?: number;
  marketValue: number;
  currency: Currency;
  /** Date of acquisition if disclosed (used to compute haul completion). */
  acquiredAt?: ISODate;
}

export interface AccountInsight {
  kind:
    | 'sharia_review_needed'  // dividends / interest from non-screened sources
    | 'dividends_detected'
    | 'haul_not_completed'    // account funded mid-haul
    | 'currency_mixed'        // multiple currencies in one statement
    | 'low_confidence_field'; // user should double-check this value
  message: string;
  severity: 'info' | 'warning';
  /** Money amount this insight refers to (for purification, etc.). */
  amount?: { value: number; currency: Currency };
}

export interface ExtractedAccount {
  /** Stable hash so re-uploads don't create duplicates. */
  fingerprint: string;
  label: string;
  category: ExtractedCategory;

  // Values
  currency?: Currency;
  currentBalance?: number;
  averageBalance?: number;
  lowestBalance?: number;

  // Stock positions if category === 'stock_holdings'
  positions?: ExtractedStockPosition[];

  // Statement period
  statementStart?: ISODate;
  statementEnd?: ISODate;

  // Haul gating signal — only authoritative if we can see start of haul
  haulCompleted?: boolean;

  // Confidence per field, optional. Default = `confidence`.
  fieldConfidence?: Partial<Record<keyof ExtractedAccount, number>>;

  /** Overall confidence 0–100. Drives badge + tier-escalation decision. */
  confidence: number;

  /** Page numbers in the source document where this was extracted from. */
  extractedFromPages?: number[];

  /** Sharia / haul / purification surfaces — shown in the confirmation UI. */
  insights?: AccountInsight[];
}

export interface ParseResult {
  success: boolean;
  tier: Tier;
  accounts: ExtractedAccount[];
  document: {
    issuer?: string;
    documentType?: string;
    pageCount: number;
    statementPeriod?: { start: ISODate; end: ISODate };
  };
  errors?: string[];
  warnings?: string[];
  processingTimeMs: number;
}

export interface DocumentParser {
  tier: Tier;
  name: string;
  canHandle(input: DocumentInput): Promise<boolean>;
  parse(
    input: DocumentInput,
    onProgress: (state: ProcessingState) => void,
  ): Promise<ParseResult>;
}

export interface PipelineSignal {
  type: 'tier_start' | 'tier_complete' | 'tier_escalate' | 'pipeline_done';
  tier?: Tier;
  reason?: string;
  from?: Tier;
  to?: Tier;
}

export interface PipelineOptions {
  /** Cap escalation. Default: 3 (all tiers allowed). */
  maxTier?: Tier;
  /** Minimum confidence below which the orchestrator escalates. Default 70. */
  minConfidence?: number;
  onProgress?: (state: ProcessingState) => void;
  onSignal?: (signal: PipelineSignal) => void;
}
