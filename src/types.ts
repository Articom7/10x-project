import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

// ============================================================================
// Base Entity Types (Direct mappings from database)
// ============================================================================

export type Category = Tables<"categories">;
export type OnboardingProduct = Tables<"onboarding_products">;
export type PantryItem = Tables<"pantry_items">;
export type Product = Tables<"products">;
export type Profile = Tables<"profiles">;
export type ShoppingList = Tables<"shopping_lists">;
export type ShoppingListItem = Tables<"shopping_list_items">;

// ============================================================================
// Common Types & Utilities
// ============================================================================

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Query parameters for paginated endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationDTO;
  meta?: Record<string, unknown>;
}

/**
 * Standard error response format
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// Category DTOs
// ============================================================================

/**
 * Category DTO - Response for GET /api/categories
 * Direct mapping from categories table
 */
export type CategoryDTO = Category;

// ============================================================================
// Product DTOs & Commands
// ============================================================================

/**
 * Product DTO - Extended product with category name and current quantity
 * Used in: GET /api/products, GET /api/products/:id
 */
export interface ProductDTO extends Product {
  category_name: string | null;
  current_quantity: number;
}

/**
 * Create Product Command - Request for POST /api/products
 */
export interface CreateProductCommand {
  name: string;
  category_id?: number;
  quantity?: number; // Initial pantry quantity (default: 1)
  desired_quantity?: number; // Default: 1
}

/**
 * Update Product Command - Request for PATCH /api/products/:id
 */
export interface UpdateProductCommand {
  name?: string;
  category_id?: number;
  desired_quantity?: number;
}

/**
 * Parse Text Command - Request for POST /api/products/parse-text
 */
export interface ParseTextCommand {
  text: string; // Max 1000 chars
}

/**
 * Product Suggestion DTO - LLM-generated product suggestion
 */
export interface ProductSuggestionDTO {
  name: string;
  quantity: number;
  category_id: number | null;
  confidence: number; // 0-1 scale
}

/**
 * Parse Text Response DTO - Response for POST /api/products/parse-text
 */
export interface ParseTextResponseDTO {
  suggestions: ProductSuggestionDTO[];
}

/**
 * Bulk Product Item Command - Single item in bulk product request
 */
export interface BulkProductItemCommand {
  name: string;
  category_id?: number;
  quantity: number;
}

/**
 * Bulk Product Command - Request for POST /api/products/bulk
 */
export interface BulkProductCommand {
  products: BulkProductItemCommand[]; // Max 50 items
}

/**
 * Bulk Product Response DTO - Response for POST /api/products/bulk
 */
export interface BulkProductResponseDTO {
  created: ProductDTO[];
  updated: ProductDTO[];
}

// ============================================================================
// Pantry DTOs & Commands
// ============================================================================

/**
 * Pantry Item DTO - Extended pantry item with product details
 * Used in: GET /api/pantry/:id, pantry list responses
 */
export interface PantryItemDTO extends PantryItem {
  product_name: string;
  category_id: number | null;
  category_name: string | null;
  desired_quantity: number;
}

/**
 * Pantry Category Group DTO - Pantry items grouped by category
 * Used in: GET /api/pantry
 */
export interface PantryCategoryGroupDTO {
  category_id: number | null;
  category_name: string | null;
  items: PantryItemDTO[];
}

/**
 * Update Pantry Item Command - Request for PATCH /api/pantry/:id
 */
export interface UpdatePantryItemCommand {
  quantity: number; // Min: 0
}

/**
 * Quick Start Command - Request for POST /api/pantry/quick-start
 */
export interface QuickStartCommand {
  product_ids: number[]; // Onboarding product IDs
}

/**
 * Quick Start Response DTO - Response for POST /api/pantry/quick-start
 */
export interface QuickStartResponseDTO {
  added: PantryItemDTO[];
}

// ============================================================================
// Shopping List DTOs & Commands
// ============================================================================

/**
 * Shopping List Item DTO - Shopping list item with product details
 * Used in shopping list detail responses
 */
export interface ShoppingListItemDTO extends ShoppingListItem {
  product_name: string;
  category_id: number | null;
  category_name: string | null;
}

/**
 * Shopping List Summary DTO - Summary for list endpoints
 * Used in: GET /api/shopping-lists
 */
export interface ShoppingListSummaryDTO extends ShoppingList {
  item_count: number;
  checked_count: number;
}

/**
 * Shopping List Detail DTO - Full shopping list with items
 * Used in: GET /api/shopping-lists/:id, POST /api/shopping-lists/generate
 */
export interface ShoppingListDetailDTO extends ShoppingList {
  items: ShoppingListItemDTO[];
}

/**
 * Generate Shopping List Command - Request for POST /api/shopping-lists/generate
 */
export interface GenerateShoppingListCommand {
  name?: string; // Default: "Shopping List"
}

/**
 * Update Shopping List Command - Request for PATCH /api/shopping-lists/:id
 */
export interface UpdateShoppingListCommand {
  name: string; // Max 255 chars
}

/**
 * Update Shopping List Item Command - Request for PATCH /api/shopping-lists/:listId/items/:itemId
 */
export interface UpdateShoppingListItemCommand {
  is_checked?: boolean;
  quantity?: number; // Min: 1
}

/**
 * Complete Shopping List Command - Request for POST /api/shopping-lists/:id/complete
 */
export interface CompleteShoppingListCommand {
  delete_list?: boolean; // Default: false
}

/**
 * Updated Product Summary - Item in complete shopping list response
 */
export interface UpdatedProductSummary {
  product_id: number;
  product_name: string;
  old_quantity: number;
  new_quantity: number;
}

/**
 * Complete Shopping List Response DTO - Response for POST /api/shopping-lists/:id/complete
 */
export interface CompleteShoppingListResponseDTO {
  updated_products: UpdatedProductSummary[];
  list_deleted: boolean;
}

// ============================================================================
// Onboarding DTOs
// ============================================================================

/**
 * Onboarding Product DTO - Pre-populated product for onboarding
 * Used in: GET /api/onboarding/products
 */
export interface OnboardingProductDTO extends OnboardingProduct {
  category_name: string | null;
}

// ============================================================================
// Profile DTOs & Commands
// ============================================================================

/**
 * Profile DTO - User profile
 * Used in: GET /api/profile, PATCH /api/profile
 */
export type ProfileDTO = Profile;

/**
 * Update Profile Command - Request for PATCH /api/profile
 * Currently empty for MVP, reserved for future extensions
 */
export type UpdateProfileCommand = Record<string, never>;

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Product Query Params - Query parameters for GET /api/products
 */
export interface ProductQueryParams extends PaginationParams {
  category_id?: number;
}

/**
 * Pantry Query Params - Query parameters for GET /api/pantry
 */
export interface PantryQueryParams {
  category_id?: number;
  show_empty?: boolean; // Default: true
}

/**
 * Shopping List Query Params - Query parameters for GET /api/shopping-lists
 */
export type ShoppingListQueryParams = PaginationParams;
