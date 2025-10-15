# Shopping Lists View

This directory contains the shopping lists view implementation.

## Overview

The shopping lists view (`/shopping-lists`) allows users to:
- View all their shopping lists (active and archived)
- Generate new shopping lists based on products with zero quantity in pantry
- Navigate to individual shopping list details

## Components

### Main Components

- **ShoppingListsContent.tsx** - Main React component managing the view logic
- **GenerateListButton.tsx** - Button to generate new shopping lists with badge showing empty items count
- **ActiveShoppingListCard.tsx** - Extended card showing the current (newest) shopping list
- **ArchivedListsSection.tsx** - Section displaying archived shopping lists
- **ArchivedListCard.tsx** - Compact card for archived shopping lists
- **EmptyState.tsx** - Empty state when user has no shopping lists
- **GenerateListModal.tsx** - Modal for entering list name and confirming generation
- **ShoppingListItemPreview.tsx** - Compact preview of a shopping list item
- **Toast.tsx** - Toast notification component

## Hooks

- **useShoppingLists.ts** - Custom hook managing shopping lists state and logic

## Features

- ✅ Server-side rendering with Astro
- ✅ Authentication check and redirect
- ✅ Empty state handling
- ✅ Modal for list generation
- ✅ Toast notifications
- ✅ Responsive design (mobile-first)
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Error handling (401, 422, network errors, etc.)

## API Integration

The view integrates with the following API endpoints (to be implemented):

- `GET /api/shopping-lists` - Fetch all shopping lists
- `GET /api/pantry?show_empty=true` - Fetch pantry data to count empty items
- `POST /api/shopping-lists/generate` - Generate new shopping list

## TODO

- [ ] Implement GET /api/shopping-lists endpoint
- [ ] Implement GET /api/pantry endpoint
- [ ] Add actual shopping list items preview (currently using placeholders)
- [ ] Add loading skeleton for SSR data fetching
- [ ] Add tests

## Notes

- Currently using placeholder data for shopping lists and pantry items
- API endpoints need to be implemented before full functionality is available
- The `handleGenerateList` function in `useShoppingLists` hook is fully implemented and ready to use once API is available

