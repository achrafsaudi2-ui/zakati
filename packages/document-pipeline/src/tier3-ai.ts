// =============================================================================
// Tier 3 — WebLLM (local LLM, opt-in)
// =============================================================================
// Activates only when the user opts in. ~500 MB one-time download, then runs
// fully on-device via WebGPU. Used for ambiguous statements, multi-currency,
// non-standard layouts.
// =============================================================================

import type {
  DocumentInput,
  DocumentParser,
  ExtractedAccount,
  ParseResult,
  ProcessingState,
} from './types.js';

const MODEL_ID = 'Phi-3.5-mini-instruct-q4f16_1-MLC';

export class AIExtractor implements DocumentParser {
  readonly tier = 3 as const;
  readonly name = 'WebLLM (Phi-3.5-mini)';

  /** Singleton engine — keeps the model in memory across uploads. */
  private engine: unknown = null;

  /** Set externally to false until the user accepts the Tier-3 consent. */
  private userOptedIn = false;

  setUserConsent(consented: boolean): void {
    this.userOptedIn = consented;
  }

  async canHandle(input: DocumentInput): Promise<boolean> {
    if (!this.userOptedIn) return false;
    // WebGPU support is required for Phi-3.5-mini at acceptable speeds
    if (!('gpu' in navigator)) return false;
    return true;
  }

  async parse(
    input: DocumentInput,
    onProgress: (state: ProcessingState) => void,
  ): Promise<ParseResult> {
    const start = performance.now();

    // 1. Load the LLM engine (cached after first call)
    if (!this.engine) {
      onProgress({
        stage: 'init',
        tier: 3,
        progress: 0,
        message: 'Loading AI assistant — one-time download (~500 MB)',
      });
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      this.engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report: { progress: number; text: string }) => {
          onProgress({
            stage: 'init',
            tier: 3,
            progress: report.progress * 35,
            message: report.text,
          });
        },
      });
    }

    // 2. Get raw text from the document (reuse Tier 1)
    onProgress({ stage: 'reading', tier: 3, progress: 40, message: 'Reading the document' });
    const rawText = await this.getRawText(input);

    // 3. Ask the LLM to extract structured data
    onProgress({ stage: 'identifying', tier: 3, progress: 55, message: 'Understanding the document' });

    const engine = this.engine as {
      chat: {
        completions: {
          create: (args: unknown) => Promise<{ choices: { message: { content: string } }[] }>;
        };
      };
    };

    const response = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: `Extract accounts from this statement:\n\n${rawText.slice(0, 12000)}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0, // deterministic
    });

    onProgress({ stage: 'calculating', tier: 3, progress: 95, message: 'Finalizing values' });

    const parsed = safeParseJSON(response.choices[0].message.content);
    const accounts = (parsed?.accounts ?? []) as ExtractedAccount[];

    return {
      success: accounts.length > 0,
      tier: 3,
      accounts,
      document: parsed?.document ?? { pageCount: 0 },
      processingTimeMs: performance.now() - start,
    };
  }

  private async getRawText(input: DocumentInput): Promise<string> {
    if (input.fileType === 'pdf') {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      const arrayBuffer = await input.file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        text += content.items.map((i) => (i as { str?: string }).str ?? '').join(' ') + '\n';
      }
      return text;
    }
    if (input.fileType === 'csv' || input.fileType === 'text') {
      return await input.file.text();
    }
    throw new Error('Unsupported file type for Tier 3 extraction');
  }
}

function safeParseJSON(s: string): { accounts?: ExtractedAccount[]; document?: ParseResult['document'] } | null {
  try {
    return JSON.parse(s);
  } catch {
    // Try to extract JSON from a code-fence wrapper
    const match = s.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

const EXTRACTION_SYSTEM_PROMPT = `You are a financial-document analyzer for an Islamic zakat calculator.
Extract structured account data from bank or brokerage statements.

Return ONLY valid JSON matching this schema:
{
  "document": {
    "issuer": string,
    "documentType": "monthly_statement" | "portfolio_summary" | "trade_confirmation" | "other",
    "pageCount": number,
    "statementPeriod": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" } | null
  },
  "accounts": [
    {
      "fingerprint": string,           // stable hash of issuer + account number
      "label": string,                  // e.g. "SAB KSA Current"
      "category": "cash_account" | "stock_holdings" | "crypto" | "islamic_deposit" | "p2p_investment" | "receivable",
      "currency": "SAR" | "USD" | "EUR" | "GBP" | "MAD" | string | null,
      "currentBalance": number | null,
      "averageBalance": number | null,
      "lowestBalance": number | null,
      "statementStart": "YYYY-MM-DD" | null,
      "statementEnd": "YYYY-MM-DD" | null,
      "haulCompleted": boolean | null,
      "positions": [
        { "symbol": string, "name": string, "quantity": number, "marketValue": number, "currency": string }
      ] | null,
      "confidence": number,             // 0-100
      "insights": [
        { "kind": "dividends_detected" | "haul_not_completed" | "sharia_review_needed", "message": string, "severity": "info" | "warning", "amount": { "value": number, "currency": string } | null }
      ]
    }
  ]
}

Rules:
- If a field is unclear, set null with low confidence (<50). NEVER fabricate.
- Currency codes must be ISO 4217.
- For multi-currency statements, return one account per currency.
- Flag dividends from any stock NOT in the Sharia-screened list as sharia_review_needed.
- Stocks: include each open position with current market value.`;
