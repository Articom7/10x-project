import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ArchivedListCardProps } from '@/types';

export default function ArchivedListCard({ list }: ArchivedListCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const handleClick = () => {
    window.location.href = `/shopping-lists/${list.id}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Otwórz listę ${list.name}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-lg truncate flex-1">{list.name}</h3>
          <Badge variant="secondary" className="flex-shrink-0">
            {list.item_count}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <time dateTime={list.created_at}>
            {formatDate(list.created_at)}
          </time>
          <span>
            {list.checked_count}/{list.item_count} odhaczonych
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

