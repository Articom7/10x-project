import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GenerateListModalProps } from '@/types';

export default function GenerateListModal({
  isOpen,
  onClose,
  onGenerate,
  emptyItemsCount,
}: GenerateListModalProps) {
  const [listName, setListName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setListName('');
      setError(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setListName(value);

    if (value.length > 255) {
      setError('Nazwa może mieć maksymalnie 255 znaków');
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (error) return;
    
    setIsGenerating(true);
    try {
      await onGenerate(listName || undefined);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error && !isGenerating) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Generuj listę zakupów</DialogTitle>
            <DialogDescription>
              Znaleziono {emptyItemsCount} {emptyItemsCount === 1 ? 'produkt' : 'produktów'} do kupienia
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="list-name">
                Nazwa listy
                {listName.length > 200 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({listName.length}/255)
                  </span>
                )}
              </Label>
              <Input
                id="list-name"
                type="text"
                placeholder="np. Zakupy tygodniowe"
                value={listName}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                maxLength={255}
                autoFocus
                disabled={isGenerating}
                aria-invalid={error !== null}
                aria-describedby={error ? 'list-name-error' : undefined}
              />
              {error && (
                <p id="list-name-error" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {!error && (
                <p className="text-sm text-muted-foreground">
                  Zostaw puste, aby użyć domyślnej nazwy "Lista zakupów"
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={error !== null || isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generuję...
                </>
              ) : (
                'Generuj'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

