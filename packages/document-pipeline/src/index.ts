// =============================================================================
// @zakati/document-pipeline — Public API
// =============================================================================

export * from './types';
export { DocumentPipeline } from './orchestrator';
export { PDFTextParser } from './tier1-pdf';
export { OCRParser } from './tier2-ocr';
export { AIExtractor } from './tier3-ai';

import { DocumentPipeline } from './orchestrator';
import { PDFTextParser } from './tier1-pdf';
import { OCRParser } from './tier2-ocr';
import { AIExtractor } from './tier3-ai';

/**
 * Convenience factory — registers all three tiers.
 * Tier 3 (AI) won't activate until `aiExtractor.setUserConsent(true)`.
 */
export function createDefaultPipeline(): {
  pipeline: DocumentPipeline;
  aiExtractor: AIExtractor;
} {
  const aiExtractor = new AIExtractor();
  const pipeline = new DocumentPipeline([
    new PDFTextParser(),
    new OCRParser(),
    aiExtractor,
  ]);
  return { pipeline, aiExtractor };
}
