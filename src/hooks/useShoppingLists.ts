import { useState, useCallback } from 'react';
import type { ShoppingListSummaryDTO, ToastProps, ShoppingListDetailDTO, ApiResponse } from '@/types';

interface UseShoppingListsReturn {
  lists: ShoppingListSummaryDTO[];
  activeList: ShoppingListSummaryDTO | null;
  archivedLists: ShoppingListSummaryDTO[];
  isModalOpen: boolean;
  isGenerating: boolean;
  toastProps: ToastProps;
  handleOpenGenerateModal: () => void;
  handleCloseModal: () => void;
  handleGenerateList: (name?: string) => Promise<void>;
}

export function useShoppingLists(
  initialLists: ShoppingListSummaryDTO[],
  emptyItemsCount: number
): UseShoppingListsReturn {
  const [lists, setLists] = useState<ShoppingListSummaryDTO[]>(initialLists);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastProps, setToastProps] = useState<ToastProps>({
    message: '',
    type: 'info',
    isVisible: false,
    onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
  });

  // Derived state
  const activeList = lists.length > 0 ? lists[0] : null;
  const archivedLists = lists.slice(1, 11); // max 10 archived

  const handleOpenGenerateModal = useCallback(() => {
    if (emptyItemsCount === 0) {
      setToastProps({
        message: 'Wszystkie produkty na stanie! 🎉',
        type: 'info',
        isVisible: true,
        onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
      });
      return;
    }
    setIsModalOpen(true);
  }, [emptyItemsCount]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsGenerating(false);
  }, []);

  const handleGenerateList = useCallback(async (name?: string) => {
    setIsGenerating(true);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch('/api/shopping-lists/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name || undefined }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Handle 401 - session expired
      if (response.status === 401) {
        setToastProps({
          message: 'Sesja wygasła. Zaloguj się ponownie.',
          type: 'error',
          isVisible: true,
          onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      // Handle 422 - no items to add
      if (response.status === 422) {
        setToastProps({
          message: 'Wszystkie produkty na stanie! 🎉',
          type: 'info',
          isVisible: true,
          onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
        });
        setIsModalOpen(false);
        return;
      }
      
      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 'Nie udało się wygenerować listy'
        );
      }
      
      const data: ApiResponse<ShoppingListDetailDTO> = await response.json();
      
      // Success - show toast and redirect
      setToastProps({
        message: 'Lista zakupów utworzona',
        type: 'success',
        isVisible: true,
        onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
      });
      
      // Redirect to newly created list
      window.location.href = `/shopping-lists/${data.data.id}`;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        setToastProps({
          message: 'Operacja trwa zbyt długo. Spróbuj ponownie.',
          type: 'error',
          isVisible: true,
          onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
        });
      } else {
        // Handle other errors
        setToastProps({
          message: error instanceof Error ? error.message : 'Wystąpił błąd',
          type: 'error',
          isVisible: true,
          onClose: () => setToastProps(prev => ({ ...prev, isVisible: false })),
        });
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    lists,
    activeList,
    archivedLists,
    isModalOpen,
    isGenerating,
    toastProps,
    handleOpenGenerateModal,
    handleCloseModal,
    handleGenerateList,
  };
}

