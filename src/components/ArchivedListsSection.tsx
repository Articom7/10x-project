import React from 'react';
import ArchivedListCard from './ArchivedListCard';
import type { ArchivedListsSectionProps } from '@/types';

export default function ArchivedListsSection({ lists }: ArchivedListsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Poprzednie listy</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <ArchivedListCard key={list.id} list={list} />
        ))}
      </div>
    </section>
  );
}

