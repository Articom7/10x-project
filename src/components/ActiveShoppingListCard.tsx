import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ShoppingListItemPreview from './ShoppingListItemPreview';
import type { ActiveShoppingListCardProps, ShoppingListItemDTO } from '@/types';

export default function ActiveShoppingListCard({ list }: ActiveShoppingListCardProps) {
  // For preview, we'll show placeholder items since we don't have the full list details
  // In real implementation, this would come from the API or be passed as prop
  const previewItems: ShoppingListItemDTO[] = [];
  const hasMoreItems = list.item_count > 5;
  const moreItemsCount = list.item_count - 5;

  const progressPercentage = list.item_count > 0 
    ? (list.checked_count / list.item_count) * 100 
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{list.name}</CardTitle>
            <CardDescription>
              Utworzono {formatDate(list.created_at)}
            </CardDescription>
          </div>
          <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
            Aktywna
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Postęp</span>
            <span className="font-medium">
              {list.checked_count} / {list.item_count} odhaczonych
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {previewItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Produkty</h4>
            <div className="space-y-1">
              {previewItems.slice(0, 5).map((item) => (
                <ShoppingListItemPreview key={item.id} item={item} />
              ))}
              {hasMoreItems && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  + {moreItemsCount} {moreItemsCount === 1 ? 'produkt' : 'produktów'} więcej
                </div>
              )}
            </div>
          </div>
        )}

        {previewItems.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">
              {list.item_count} {list.item_count === 1 ? 'produkt' : 'produktów'} na liście
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            window.location.href = `/shopping-lists/${list.id}`;
          }}
        >
          Zobacz szczegóły
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
}

