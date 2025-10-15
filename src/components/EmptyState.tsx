import React from 'react';
import { Button } from '@/components/ui/button';
import type { EmptyStateProps } from '@/types';

export default function EmptyState({ onGenerateClick, emptyItemsCount }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-64 h-64 mb-6 flex items-center justify-center">
        <svg
          className="w-full h-full text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Nie masz jeszcze list zakupów
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        Wygeneruj swoją pierwszą listę na podstawie produktów w spiżarni
      </p>
      
      <Button
        variant="default"
        size="lg"
        onClick={onGenerateClick}
        disabled={emptyItemsCount === 0}
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Generuj pierwszą listę
      </Button>
      
      {emptyItemsCount === 0 && (
        <p className="mt-4 text-sm text-gray-500 max-w-md">
          Wszystkie produkty na stanie! Oznacz produkty jako zużyte w spiżarni, aby móc wygenerować listę.
        </p>
      )}
    </div>
  );
}

