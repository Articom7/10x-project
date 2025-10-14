import type { SupabaseClient } from "@/db/supabase.client";
import type { ShoppingListDetailDTO, ShoppingListItemDTO } from "@/types";

/**
 * Custom error class for business logic errors in shopping list service
 */
export class ShoppingListServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ShoppingListServiceError";
  }
}

/**
 * Shopping List Service
 * Handles business logic for shopping list operations
 */
export class ShoppingListService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Generate a shopping list based on pantry items with quantity = 0
   * 
   * @param userId - The authenticated user's ID
   * @param name - Name for the shopping list (default: "Shopping List")
   * @returns ShoppingListDetailDTO with all items
   * @throws ShoppingListServiceError if no items to add or database error
   */
  async generateShoppingList(
    userId: string,
    name: string = "Shopping List"
  ): Promise<ShoppingListDetailDTO> {
    // Step 1: Query pantry items with quantity = 0
    const { data: emptyItems, error: queryError } = await this.supabase
      .from("pantry_items")
      .select(`
        id,
        product_id,
        products!inner(
          id,
          name,
          desired_quantity,
          category_id,
          categories(name)
        )
      `)
      .eq("user_id", userId)
      .eq("quantity", 0);

    // Handle query errors
    if (queryError) {
      throw new ShoppingListServiceError(
        `Failed to fetch pantry items: ${queryError.message}`,
        "DATABASE_ERROR",
        { originalError: queryError }
      );
    }

    // Check if there are items to add
    if (!emptyItems || emptyItems.length === 0) {
      throw new ShoppingListServiceError(
        "No items to add to shopping list. All pantry items have stock.",
        "NO_ITEMS_TO_ADD",
        { pantry_empty_items_count: 0 }
      );
    }

    // Step 2: Create shopping list
    const { data: shoppingList, error: createError } = await this.supabase
      .from("shopping_lists")
      .insert({
        user_id: userId,
        name: name,
      })
      .select()
      .single();

    // Handle creation errors
    if (createError || !shoppingList) {
      throw new ShoppingListServiceError(
        `Failed to create shopping list: ${createError?.message}`,
        "DATABASE_ERROR",
        { originalError: createError }
      );
    }

    // Step 3: Prepare items for bulk insert
    const itemsToInsert = emptyItems.map((item) => ({
      shopping_list_id: shoppingList.id,
      product_id: item.product_id,
      quantity: item.products.desired_quantity,
      is_checked: false,
    }));

    // Bulk insert shopping list items
    const { data: createdItems, error: itemsError } = await this.supabase
      .from("shopping_list_items")
      .insert(itemsToInsert)
      .select();

    // Handle items creation errors with rollback
    if (itemsError || !createdItems) {
      // Rollback: delete shopping list if items creation fails
      await this.supabase
        .from("shopping_lists")
        .delete()
        .eq("id", shoppingList.id);

      throw new ShoppingListServiceError(
        `Failed to create shopping list items: ${itemsError?.message}`,
        "DATABASE_ERROR",
        { originalError: itemsError }
      );
    }

    // Step 4: Transform items to DTO format
    const itemsDTO: ShoppingListItemDTO[] = createdItems.map((item, index) => ({
      ...item,
      product_name: emptyItems[index].products.name,
      category_id: emptyItems[index].products.category_id,
      category_name: emptyItems[index].products.categories?.name ?? null,
    }));

    // Step 5: Build final response
    const result: ShoppingListDetailDTO = {
      ...shoppingList,
      items: itemsDTO,
    };

    return result;
  }
}

