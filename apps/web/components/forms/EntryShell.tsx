'use client';

import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EntryShellProps {
  /** "Cash & banks", "Stocks & ETFs", etc. */
  categoryLabel: string;
  /** Children = the form body */
  children: React.ReactNode;
  /** What route to go to after "save & next" */
  nextRoute: string;
  /** How many entries the user has in this category right now. */
  entryCount: number;
  /** Whether save is enabled (i.e. required fields filled). */
  canSave: boolean;
  /** Called when user taps Save & next. */
  onSave: () => void;
  /** Called when user taps "Add another in this category". */
  onAddAnother?: () => void;
  /** Called when user taps trash on an existing entry. */
  onRemove?: () => void;
  /** Show "Edit" mode flag — changes button labels. */
  isEditing?: boolean;
}

export function EntryShell({
  categoryLabel,
  children,
  nextRoute,
  entryCount,
  canSave,
  onSave,
  onAddAnother,
  onRemove,
  isEditing,
}: EntryShellProps) {
  const router = useRouter();

  const handleSave = () => {
    onSave();
    router.push(nextRoute);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex justify-between items-start">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
            {categoryLabel}
          </p>
          <h1
            className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight mt-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {isEditing ? 'Edit account' : `Account ${entryCount + 1}`}
          </h1>
        </div>
        {isEditing && onRemove && (
          <button
            onClick={onRemove}
            className="p-2 -mt-1 -mr-2 text-charcoal-400 hover:text-danger transition-colors"
            aria-label="Remove this entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="flex flex-col gap-4">{children}</div>

      <div className="mt-2 flex flex-col gap-2">
        <Button size="xl" fullWidth onClick={handleSave} disabled={!canSave}>
          Save & continue
        </Button>
        {onAddAnother && (
          <button
            type="button"
            onClick={onAddAnother}
            disabled={!canSave}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-medium',
              canSave ? 'text-emerald-500' : 'text-charcoal-400 cursor-not-allowed',
            )}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden />
            Save & add another {entryCount > 0 ? 'one' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
