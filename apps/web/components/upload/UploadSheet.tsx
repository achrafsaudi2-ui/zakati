'use client';

import { useState, useRef } from 'react';
import { Check, X, Upload, Camera, Clipboard, FileText, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { cn, formatMoney } from '@/lib/utils';
import type { ExtractedAccount } from '@zakati/document-pipeline';

type Phase = 'idle' | 'processing' | 'review' | 'error';

interface UploadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accepted MIME / extension hints */
  accept?: string;
  /** Called when user confirms extracted accounts. */
  onAccept: (accounts: ExtractedAccount[]) => void;
}

export function UploadSheet({
  open,
  onOpenChange,
  accept = '.pdf,.png,.jpg,.jpeg,.csv',
  onAccept,
}: UploadSheetProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [substep, setSubstep] = useState<string>('');
  const [extracted, setExtracted] = useState<ExtractedAccount[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase('idle');
    setFile(null);
    setProgress(0);
    setSubstep('');
    setExtracted([]);
    setConfidence(0);
    setError(null);
  };

  const handleFileSelect = async (selected: File) => {
    setFile(selected);
    setPhase('processing');
    setProgress(0);

    // Lazy-load the pipeline so the initial bundle stays light
    try {
      const { createDefaultPipeline } = await import('@zakati/document-pipeline');
      const { pipeline } = createDefaultPipeline();

      const fileType = inferFileType(selected);
      const result = await pipeline.parse(
        {
          file: selected,
          fileName: selected.name,
          fileType,
          source: 'file_picker',
        },
        {
          onProgress: (state) => {
            setProgress(state.progress);
            setSubstep(state.message);
          },
        },
      );

      if (result.accounts.length === 0) {
        setError("Couldn't find accounts in this file. Try a different statement or enter manually.");
        setPhase('error');
        return;
      }

      setExtracted(result.accounts);
      setConfidence(
        Math.round(
          result.accounts.reduce((s, a) => s + a.confidence, 0) / result.accounts.length,
        ),
      );
      setPhase('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try entering manually.');
      setPhase('error');
    }
  };

  const handleConfirm = () => {
    onAccept(extracted);
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <SheetContent maxHeight={phase === 'review' ? 'full' : 'half'}>
        {phase === 'idle' && (
          <IdleState
            onPick={() => inputRef.current?.click()}
            inputRef={inputRef}
            accept={accept}
            onFile={handleFileSelect}
          />
        )}

        {phase === 'processing' && file && (
          <ProcessingState file={file} progress={progress} substep={substep} onCancel={reset} />
        )}

        {phase === 'review' && (
          <ReviewState
            accounts={extracted}
            confidence={confidence}
            onConfirm={handleConfirm}
            onEdit={(idx, patch) => {
              setExtracted((prev) =>
                prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
              );
            }}
            onRemove={(idx) => {
              setExtracted((prev) => prev.filter((_, i) => i !== idx));
            }}
          />
        )}

        {phase === 'error' && (
          <ErrorState message={error ?? 'Unknown error'} onRetry={reset} onClose={() => onOpenChange(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

// =============================================================================
// Sub-states
// =============================================================================

function IdleState({
  onPick,
  inputRef,
  accept,
  onFile,
}: {
  onPick: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onFile: (f: File) => void;
}) {
  return (
    <div className="pb-2">
      <SheetTitle>Upload a statement</SheetTitle>
      <SheetDescription>
        We&apos;ll extract balances and dates on your device. Nothing uploaded.
      </SheetDescription>

      <button
        onClick={onPick}
        className="w-full rounded-2xl border-2 border-dashed border-gold-500 bg-cream-50 py-7 px-4 flex flex-col items-center gap-2 mb-3 hover:bg-gold-500/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/8 flex items-center justify-center">
          <Upload className="w-5 h-5 text-emerald-500" />
        </div>
        <p className="text-[13px] font-medium text-charcoal-900">Choose a file</p>
        <p className="text-[11px] text-charcoal-500">PDF, image, or CSV</p>
      </button>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <SourceButton icon={<FileText className="w-4 h-4" />} label="Files" onClick={onPick} />
        <SourceButton icon={<Camera className="w-4 h-4" />} label="Camera" onClick={onPick} />
        <SourceButton icon={<Clipboard className="w-4 h-4" />} label="Paste" disabled />
      </div>

      <p className="text-[10.5px] text-charcoal-400 text-center px-2 leading-relaxed">
        Supported issuers (Tier 1): SAB, Boursorama, BourseDirect, IBKR, Revolut, Lendo, D360, Meem,
        DEGIRO. Other documents fall back to OCR.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

function SourceButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1 py-3 rounded-xl border border-cream-200 bg-cream-50',
        disabled
          ? 'text-charcoal-400 cursor-not-allowed opacity-50'
          : 'text-charcoal-900 hover:border-emerald-500/40 cursor-pointer',
      )}
    >
      <span className="text-emerald-500">{icon}</span>
      <span className="text-[10.5px] font-medium">{label}</span>
    </button>
  );
}

function ProcessingState({
  file,
  progress,
  substep,
  onCancel,
}: {
  file: File;
  progress: number;
  substep: string;
  onCancel: () => void;
}) {
  return (
    <div className="pb-2">
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-charcoal-50">
        <div className="w-8 h-9 rounded bg-gold-100 text-gold-700 text-[9px] font-medium flex items-center justify-center">
          {file.name.split('.').pop()?.toUpperCase() ?? 'FILE'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-charcoal-900 truncate">{file.name}</p>
          <p className="text-[10px] text-charcoal-500">{(file.size / 1024).toFixed(0)} KB</p>
        </div>
      </div>

      <SheetTitle>Reading your statement</SheetTitle>
      <SheetDescription>About 8 seconds. Everything stays on your device.</SheetDescription>

      <div className="h-1 rounded-full bg-emerald-500/12 overflow-hidden mb-3">
        <div
          className="h-full bg-emerald-500 rounded-full transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[11.5px] text-charcoal-500 flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse-soft" />
        {substep || 'Starting…'}
      </p>

      <button
        onClick={onCancel}
        className="w-full py-2 text-[12px] text-charcoal-500 hover:text-charcoal-900 transition-colors"
      >
        Cancel and enter manually
      </button>
    </div>
  );
}

function ReviewState({
  accounts,
  confidence,
  onConfirm,
  onEdit,
  onRemove,
}: {
  accounts: ExtractedAccount[];
  confidence: number;
  onConfirm: () => void;
  onEdit: (idx: number, patch: Partial<ExtractedAccount>) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="pb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <SheetTitle>We found {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}</SheetTitle>
          <SheetDescription>Review and confirm — edit anything that looks off.</SheetDescription>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700">
          <Check className="w-3 h-3" strokeWidth={3} />
          {confidence}%
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {accounts.map((a, idx) => (
          <ExtractedCard key={a.fingerprint || idx} account={a} onRemove={() => onRemove(idx)} />
        ))}
      </div>

      <Button size="xl" fullWidth onClick={onConfirm}>
        <Check className="w-4 h-4" /> Add {accounts.length === 1 ? 'this account' : `all ${accounts.length}`}
      </Button>
    </div>
  );
}

function ExtractedCard({ account, onRemove }: { account: ExtractedAccount; onRemove: () => void }) {
  return (
    <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[13px] font-medium text-charcoal-900">{account.label}</p>
          <p className="text-[10px] text-charcoal-500 capitalize">{account.category.replace(/_/g, ' ')}</p>
        </div>
        <button onClick={onRemove} className="p-1 text-charcoal-400 hover:text-danger" aria-label="Remove">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1 pt-2 border-t border-cream-200/60">
        {account.currency && account.currentBalance !== undefined && (
          <FieldRow label="Current balance" value={formatMoney(account.currentBalance, account.currency)} />
        )}
        {account.averageBalance !== undefined && account.currency && (
          <FieldRow label="Average over haul" value={formatMoney(account.averageBalance, account.currency)} />
        )}
        {account.lowestBalance !== undefined && account.currency && (
          <FieldRow label="Lowest during haul" value={formatMoney(account.lowestBalance, account.currency)} />
        )}
        {account.haulCompleted === false && (
          <FieldRow label="Held over full year?" value="No · part of haul" warning />
        )}
      </div>

      {account.insights && account.insights.length > 0 && (
        <div className="mt-2 pt-2 border-t border-cream-200/60">
          {account.insights.map((insight, i) => (
            <p key={i} className="text-[11px] text-gold-700 leading-relaxed flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              {insight.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="flex justify-between items-baseline text-[11.5px]">
      <span className="text-charcoal-500">{label}</span>
      <span
        className={cn('font-medium', warning ? 'text-gold-700' : 'text-charcoal-900')}
        data-numeric
      >
        {value}
      </span>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  onClose,
}: {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="pb-4 text-center pt-4">
      <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6 text-gold-700" />
      </div>
      <SheetTitle>Couldn&apos;t read that one</SheetTitle>
      <p className="text-[12px] text-charcoal-500 mb-5 px-2 leading-relaxed">{message}</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="md" fullWidth onClick={onRetry}>
          Try a different file
        </Button>
        <Button size="md" fullWidth onClick={onClose}>
          Enter manually
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function inferFileType(f: File): 'pdf' | 'image' | 'csv' | 'text' {
  if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (f.type.startsWith('image/')) return 'image';
  if (f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv') return 'csv';
  return 'text';
}
