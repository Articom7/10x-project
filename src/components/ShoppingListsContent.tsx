import React from 'react';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import GenerateListButton from './GenerateListButton';
import ActiveShoppingListCard from './ActiveShoppingListCard';
import ArchivedListsSection from './ArchivedListsSection';
import EmptyState from './EmptyState';
import GenerateListModal from './GenerateListModal';
import Toast from './Toast';
import type { ShoppingListsContentProps } from '@/types';

export default function ShoppingListsContent({
  initialLists,
  emptyItemsCount,
}: ShoppingListsContentProps) {
  const {
    activeList,
    archivedLists,
    isModalOpen,
    isGenerating,
    toastProps,
    handleOpenGenerateModal,
    handleCloseModal,
    handleGenerateList,
  } = useShoppingLists(initialLists, emptyItemsCount);

  return (
    <div className="shopping-lists-content container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Listy zakupów</h1>
      </div>

      <GenerateListButton
        emptyItemsCount={emptyItemsCount}
        onClick={handleOpenGenerateModal}
        disabled={emptyItemsCount === 0}
      />

      {activeList && <ActiveShoppingListCard list={activeList} />}

      {archivedLists.length > 0 && (
        <ArchivedListsSection lists={archivedLists} />
      )}

      {!activeList && archivedLists.length === 0 && (
        <EmptyState
          onGenerateClick={handleOpenGenerateModal}
          emptyItemsCount={emptyItemsCount}
        />
      )}

      <GenerateListModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onGenerate={handleGenerateList}
        emptyItemsCount={emptyItemsCount}
      />

      <Toast {...toastProps} />
    </div>
  );
}

