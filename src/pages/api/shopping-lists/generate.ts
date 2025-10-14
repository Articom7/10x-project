import type { APIRoute } from "astro";

import { ShoppingListService, ShoppingListServiceError } from "@/lib/services/shopping-list.service";
import { GenerateShoppingListSchema } from "@/lib/schemas/shopping-list.schema";
import type { ApiResponse, ShoppingListDetailDTO } from "@/types";

// Disable prerendering for API route
export const prerender = false;

/**
 * POST /api/shopping-lists/generate
 * 
 * Generates a shopping list based on pantry items with quantity = 0
 * 
 * Request Body:
 * - name (optional): Name for the shopping list (default: "Shopping List")
 * 
 * Response 201:
 * - ShoppingListDetailDTO with all items
 * 
 * Errors:
 * - 401: User not authenticated
 * - 400: Invalid request data
 * - 422: No items to add (all pantry items have stock)
 * - 500: Internal server error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Step 1: Check authentication
  const { supabase, user } = locals;

  if (!user) {
    return new Response(
      JSON.stringify({
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Step 2: Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid JSON in request body",
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Step 3: Validate input
  const validationResult = GenerateShoppingListSchema.safeParse(body);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: validationResult.error.flatten().fieldErrors,
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { name } = validationResult.data;

  // Step 4: Call service and handle errors
  try {
    // Create service instance
    const shoppingListService = new ShoppingListService(supabase);

    // Generate shopping list
    const result = await shoppingListService.generateShoppingList(user.id, name);

    // Log success
    console.log(`Shopping list generated for user ${user.id}, items count: ${result.items.length}`);

    // Return success response
    const response: ApiResponse<ShoppingListDetailDTO> = {
      data: result,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log error with context
    console.error("Error generating shopping list:", {
      userId: user.id,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Handle specific business errors
    if (error instanceof ShoppingListServiceError) {
      // Handle NO_ITEMS_TO_ADD error
      if (error.code === "NO_ITEMS_TO_ADD") {
        return new Response(
          JSON.stringify({
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
            },
          }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        );
      }

      // Handle other service errors as internal errors
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generic error response for unknown errors
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

