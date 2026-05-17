// =============================================================================
// Tier 2 — Tesseract OCR
// =============================================================================
// Activates for: (a) image uploads, (b) PDFs that returned no text at Tier 1.
// Lazy-loaded — ~2 MB one-time. ~3s per page on a phone.
// =============================================================================

import type {
  DocumentInput,
  DocumentParser,
  ParseResult,
  ProcessingState,
} from './types';

export class OCRParser implements DocumentParser {
  readonly tier = 2 as const;
  readonly name = 'Tesseract OCR';

  async canHandle(input: DocumentInput): Promise<boolean> {
    return input.fileType === 'image' || input.fileType === 'pdf';
  }

  async parse(
    input: DocumentInput,
    onProgress: (state: ProcessingState) => void,
  ): Promise<ParseResult> {
    const start = performance.now();

    onProgress({ stage: 'init', tier: 2, progress: 2, message: 'Loading OCR engine' });

    const { createWorker } = await import('tesseract.js');

    // Arabic + English. Eng-only would be faster but we want SAB/Meem statements
    // (which mix Arabic headers with English numbers) to work.
    const worker = await createWorker(['eng', 'ara'], 1, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text') {
          onProgress({
            stage: 'reading',
            tier: 2,
            progress: 25 + m.progress * 55,
            message: 'Reading characters',
          });
        }
      },
    });

    const images = await this.documentToImages(input, onProgress);

    let fullText = '';
    for (let i = 0; i < images.length; i++) {
      const { data } = await worker.recognize(images[i]);
      fullText += data.text + '\n';
    }

    await worker.terminate();

    // From here, reuse the same extraction logic as Tier 1
    onProgress({ stage: 'identifying', tier: 2, progress: 85, message: 'Identifying accounts' });

    // Import lazily to avoid circular dep
    const { detectIssuerFromText, extractFromText } = await import('./shared-extraction');
    const issuer = detectIssuerFromText(fullText);
    const accounts = await extractFromText(fullText, issuer);

    return {
      success: accounts.length > 0,
      tier: 2,
      accounts,
      document: {
        issuer,
        pageCount: images.length,
      },
      processingTimeMs: performance.now() - start,
    };
  }

  /** Convert PDF pages → canvas, or pass through image files. */
  private async documentToImages(
    input: DocumentInput,
    onProgress: (s: ProcessingState) => void,
  ): Promise<HTMLCanvasElement[]> {
    if (input.fileType === 'image') {
      onProgress({ stage: 'reading', tier: 2, progress: 15, message: 'Preparing image' });
      const url = URL.createObjectURL(input.file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      return [canvas];
    }

    // PDF → render each page to canvas
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const arrayBuffer = await input.file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    const canvases: HTMLCanvasElement[] = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: 2.0 }); // 2x for OCR accuracy
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      canvases.push(canvas);

      onProgress({
        stage: 'reading',
        tier: 2,
        progress: 5 + (p / pdf.numPages) * 18,
        message: `Rendered ${p} of ${pdf.numPages} pages`,
        pagesProcessed: p,
        totalPages: pdf.numPages,
      });
    }
    return canvases;
  }
}
