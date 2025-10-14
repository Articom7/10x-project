import { z } from "zod";

/**
 * Zod schema for generating shopping list
 * Validates the request body for POST /api/shopping-lists/generate
 */
export const GenerateShoppingListSchema = z.object({
  name: z
    .string()
    .max(255, "List name must not exceed 255 characters")
    .optional()
    .default("Shopping List"),
});

/**
 * Inferred TypeScript type from GenerateShoppingListSchema
 */
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListSchema>;

