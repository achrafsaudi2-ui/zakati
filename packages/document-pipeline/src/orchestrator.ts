// =============================================================================
// Document Pipeline — Orchestrator
// =============================================================================

import type {
  DocumentInput,
  DocumentParser,
  ParseResult,
  PipelineOptions,
  ProcessingState,
} from './types';

export class DocumentPipeline {
  constructor(private readonly parsers: readonly DocumentParser[]) {
    // Sort by tier so we always start with the cheapest
    this.parsers = [...parsers].sort((a, b) => a.tier - b.tier);
  }

  /**
   * Parse a document, escalating through tiers until either:
   *   - we get success + confidence >= minConfidence, OR
   *   - we hit maxTier with no better result.
   *
   * Returns the BEST result seen (highest confidence), not necessarily the
   * last one — so a high-confidence Tier 1 beats a low-confidence Tier 3.
   */
  async parse(input: DocumentInput, options: PipelineOptions = {}): Promise<ParseResult> {
    const maxTier = options.maxTier ?? 3;
    const minConfidence = options.minConfidence ?? 70;
    const onProgress = options.onProgress ?? noop;
    const onSignal = options.onSignal ?? noop;

    let best: ParseResult | null = null;

    for (const parser of this.parsers) {
      if (parser.tier > maxTier) break;
      if (!(await parser.canHandle(input))) continue;

      onSignal({ type: 'tier_start', tier: parser.tier });

      const result = await safeParse(parser, input, onProgress);
      onSignal({ type: 'tier_complete', tier: parser.tier });

      if (result.success && result.accounts.length > 0) {
        // Track the best result seen
        if (!best || avgConfidence(result) > avgConfidence(best)) {
          best = result;
        }

        const conf = minAccountConfidence(result);
        if (conf >= minConfidence) {
          onSignal({ type: 'pipeline_done' });
          return result;
        }

        onSignal({
          type: 'tier_escalate',
          from: parser.tier,
          reason: `confidence ${conf}% below threshold ${minConfidence}%`,
        });
      }
    }

    onSignal({ type: 'pipeline_done' });
    return best ?? emptyResult();
  }
}

async function safeParse(
  parser: DocumentParser,
  input: DocumentInput,
  onProgress: (s: ProcessingState) => void,
): Promise<ParseResult> {
  const start = performance.now();
  try {
    const result = await parser.parse(input, onProgress);
    return {
      ...result,
      processingTimeMs: result.processingTimeMs || performance.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      tier: parser.tier,
      accounts: [],
      document: { pageCount: 0 },
      errors: [err instanceof Error ? err.message : String(err)],
      processingTimeMs: performance.now() - start,
    };
  }
}

function avgConfidence(r: ParseResult): number {
  if (r.accounts.length === 0) return 0;
  return r.accounts.reduce((sum, a) => sum + a.confidence, 0) / r.accounts.length;
}

function minAccountConfidence(r: ParseResult): number {
  if (r.accounts.length === 0) return 0;
  return Math.min(...r.accounts.map((a) => a.confidence));
}

function emptyResult(): ParseResult {
  return {
    success: false,
    tier: 1,
    accounts: [],
    document: { pageCount: 0 },
    errors: ['Could not extract any accounts from this document'],
    processingTimeMs: 0,
  };
}

function noop() {}
