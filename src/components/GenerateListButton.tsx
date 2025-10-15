import React from 'react';
import { Button } from '@/components/ui/button';
import type { GenerateListButtonProps } from '@/types';

export default function GenerateListButton({
  emptyItemsCount,
  onClick,
  disabled,
}: GenerateListButtonProps) {
  return (
    <div className="relative">
      <Button
        variant="default"
        size="lg"
        className="w-full md:w-auto relative"
        disabled={disabled}
        onClick={onClick}
        aria-label="Generuj listę zakupów"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>Generuj listę zakupów</span>
        {emptyItemsCount > 0 && (
          <span
            className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
            aria-label={`${emptyItemsCount} produktów do kupienia`}
          >
            {emptyItemsCount}
          </span>
        )}
      </Button>
      {disabled && (
        <div className="mt-2 text-sm text-muted-foreground">
          Wszystkie produkty na stanie. Oznacz produkty jako zużyte w spiżarni, aby móc wygenerować listę.
        </div>
      )}
    </div>
  );
}

