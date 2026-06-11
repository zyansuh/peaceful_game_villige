import { useState } from 'react';
import { Pencil, RotateCcw, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EditableStatCardProps {
  label: string;
  value: number;
  isOverridden?: boolean;
  labelClassName?: string;
  borderClassName?: string;
  onSave: (value: number) => void;
  onReset: () => void;
}

export default function EditableStatCard({
  label,
  value,
  isOverridden = false,
  labelClassName = 'text-gray-400',
  borderClassName = 'border-gray-800',
  onSave,
  onReset,
}: EditableStatCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(String(value));
  };

  const confirmEdit = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isNaN(parsed) || parsed < 0) return;
    onSave(parsed);
    setEditing(false);
  };

  return (
    <Card className={cn('bg-gray-900', borderClassName, isOverridden && 'ring-1 ring-amber-500/40')}>
      <CardContent className="card-pad">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={cn('text-xs sm:text-sm truncate', labelClassName)}>{label}</p>
            {editing ? (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min={0}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="h-9 w-20 bg-gray-800 border-gray-700 text-white text-sm"
                />
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-green-400" onClick={confirmEdit}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-gray-400" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{value}</p>
            )}
            {isOverridden && !editing && (
              <p className="text-[10px] text-amber-400/80 mt-1">수동 수정됨</p>
            )}
          </div>
          {!editing && (
            <div className="flex flex-col gap-1 shrink-0">
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-white" onClick={startEdit} aria-label="수치 수정">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {isOverridden && (
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-amber-400" onClick={onReset} aria-label="원래 값으로">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
