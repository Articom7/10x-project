import React from 'react';
import type { ShoppingListItemPreviewProps } from '@/types';

export default function ShoppingListItemPreview({ item }: ShoppingListItemPreviewProps) {
  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 rounded-md ${
        item.is_checked ? 'bg-muted/50' : 'bg-background'
      }`}
    >
      <div className="flex-shrink-0">
        <svg
          className={`w-5 h-5 ${item.is_checked ? 'text-primary' : 'text-gray-300'}`}
          fill={item.is_checked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      
      <span
        className={`flex-1 text-sm ${
          item.is_checked ? 'line-through text-muted-foreground' : 'text-foreground'
        }`}
      >
        {item.product_name}
      </span>
      
      <span className="text-sm text-muted-foreground flex-shrink-0">
        {item.quantity} szt.
      </span>
    </div>
  );
}

