// =============================================================================
// @zakati/document-pipeline — Public API
// =============================================================================

export * from './types.js';
export { DocumentPipeline } from './orchestrator.js';
export { PDFTextParser } from './tier1-pdf.js';
export { OCRParser } from './tier2-ocr.js';
export { AIExtractor } from './tier3-ai.js';

import { DocumentPipeline } from './orchestrator.js';
import { PDFTextParser } from './tier1-pdf.js';
import { OCRParser } from './tier2-ocr.js';
import { AIExtractor } from './tier3-ai.js';

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
