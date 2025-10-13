# API Endpoint Implementation Plan: POST /api/shopping-lists/generate

## 1. Przegląd punktu końcowego

Endpoint **POST /api/shopping-lists/generate** służy do automatycznego generowania listy zakupów na podstawie aktualnego stanu spiżarni użytkownika. Endpoint analizuje produkty w spiżarni (pantry_items) z ilością równą zero i tworzy nową listę zakupów zawierającą te produkty z ich pożądanymi ilościami (desired_quantity).

**Cel:**
- Automatyzacja procesu tworzenia listy zakupów
- Eliminacja ręcznego dodawania produktów do listy
- Wykorzystanie stanu spiżarni jako źródła danych

**Funkcjonalność:**
- Identyfikacja produktów, których brakuje (quantity = 0)
- Utworzenie nowej shopping_list
- Automatyczne dodanie produktów jako shopping_list_items
- Zwrot kompletnej listy z wszystkimi detalami produktów

## 2. Szczegóły żądania

### HTTP Method
`POST`

### Struktura URL
```
/api/shopping-lists/generate
```

### Parametry

**Wymagane:**
- Brak wymaganych parametrów

**Opcjonalne:**
- Brak opcjonalnych parametrów URL/query

### Request Body
```typescript
{
  "name": "Weekly Shopping"  // optional, string, max 255 chars, default: "Shopping List"
}
```

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Walidacja Request Body (Zod Schema)
```typescript
const GenerateShoppingListSchema = z.object({
  name: z.string().max(255).optional().default("Shopping List")
});
```

## 3. Wykorzystywane typy

### Command Model (Input)
```typescript
import type { GenerateShoppingListCommand } from "@/types";

// z types.ts:
export interface GenerateShoppingListCommand {
  name?: string; // Default: "Shopping List"
}
```

### Response DTOs (Output)
```typescript
import type { 
  ShoppingListDetailDTO, 
  ShoppingListItemDTO,
  ApiResponse,
  ApiErrorResponse 
} from "@/types";

// z types.ts:
export interface ShoppingListDetailDTO extends ShoppingList {
  items: ShoppingListItemDTO[];
}

export interface ShoppingListItemDTO extends ShoppingListItem {
  product_name: string;
  category_id: number | null;
  category_name: string | null;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationDTO;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### Entity Types
```typescript
import type { ShoppingList, ShoppingListItem } from "@/types";
```

## 4. Szczegóły odpowiedzi

### Success Response (201 Created)
```json
{
  "data": {
    "id": 1,
    "user_id": "uuid-here",
    "name": "Weekly Shopping",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "items": [
      {
        "id": 1,
        "shopping_list_id": 1,
        "product_id": 1,
        "product_name": "Milk",
        "category_id": 1,
        "category_name": "Dairy",
        "quantity": 2,
        "is_checked": false,
        "created_at": "2025-01-15T10:00:00Z"
      },
      {
        "id": 2,
        "shopping_list_id": 1,
        "product_id": 5,
        "product_name": "Bread",
        "category_id": 2,
        "category_name": "Bread",
        "quantity": 1,
        "is_checked": false,
        "created_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  }
}
```

#### 400 Bad Request (Validation Error)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "name": "Name must not exceed 255 characters"
    }
  }
}
```

#### 422 Unprocessable Entity (No Items)
```json
{
  "error": {
    "code": "NO_ITEMS_TO_ADD",
    "message": "No items to add to shopping list. All pantry items have stock.",
    "details": {
      "pantry_empty_items_count": 0
    }
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## 5. Przepływ danych

### Architektura warstw
```
Client Request
    ↓
Astro Middleware (Authentication)
    ↓
API Route Handler (/api/shopping-lists/generate.ts)
    ↓
Zod Validation
    ↓
Shopping List Service (src/lib/services/shopping-list.service.ts)
    ↓
Supabase Client (RLS enabled)
    ↓
PostgreSQL Database
    ↓
Response Transformation
    ↓
Client Response
```

### Szczegółowy przepływ danych

1. **Request Reception & Authentication**
   - Middleware weryfikuje JWT token
   - Ekstrahuje user_id z tokenu
   - Dodaje supabase client do context.locals

2. **Input Validation**
   - Parsowanie request body
   - Walidacja przez Zod schema
   - Zwrot 400 w przypadku błędu walidacji

3. **Business Logic (Service Layer)**
   
   a. **Query pantry items with quantity = 0:**
   ```sql
   SELECT 
     pi.id,
     pi.product_id,
     p.name as product_name,
     p.desired_quantity,
     p.category_id,
     c.name as category_name
   FROM pantry_items pi
   JOIN products p ON p.id = pi.product_id
   LEFT JOIN categories c ON c.id = p.category_id
   WHERE pi.user_id = $1 AND pi.quantity = 0
   ```

   b. **Validation check:**
   - Jeśli brak produktów z quantity = 0 → 422 error
   
   c. **Create shopping_list:**
   ```sql
   INSERT INTO shopping_lists (user_id, name)
   VALUES ($1, $2)
   RETURNING *
   ```

   d. **Create shopping_list_items (bulk insert):**
   ```sql
   INSERT INTO shopping_list_items 
     (shopping_list_id, product_id, quantity, is_checked)
   VALUES 
     ($1, $2, $3, false),
     ($1, $4, $5, false),
     ...
   RETURNING *
   ```

   e. **Transform response:**
   - Join items z product details
   - Build ShoppingListDetailDTO

4. **Response Formation**
   - Wrap data w ApiResponse format
   - Set status code 201
   - Return JSON response

### Database Interactions

**Tables involved:**
- `pantry_items` (READ) - znalezienie produktów z quantity = 0
- `products` (READ) - pobranie desired_quantity i szczegółów
- `categories` (READ) - pobranie nazw kategorii
- `shopping_lists` (CREATE) - utworzenie nowej listy
- `shopping_list_items` (CREATE) - dodanie produktów do listy

**Transaction requirements:**
- Cała operacja powinna być wykonana w jednej transakcji
- Rollback w przypadku błędu przy tworzeniu items

## 6. Względy bezpieczeństwa

### Uwierzytelnienie
- **Mechanizm:** JWT tokens via Supabase Auth
- **Implementacja:** Astro middleware sprawdza `Authorization: Bearer <token>`
- **Lokalizacja:** `src/middleware/index.ts`
- **Działanie:** 
  - Ekstrahuje token z headera
  - Waliduje przez Supabase client
  - Dodaje user object do `context.locals`
  - Zwraca 401 jeśli token invalid/missing

### Autoryzacja
- **RLS (Row-Level Security):** Wszystkie zapytania automatycznie filtrowane przez `user_id = auth.uid()`
- **Enforcement:** Na poziomie bazy danych przez Supabase
- **Tables:**
  - `pantry_items`: user może czytać tylko swoje items
  - `products`: user może czytać tylko swoje produkty
  - `shopping_lists`: user może tworzyć tylko dla siebie
  - `shopping_list_items`: automatyczne przypisanie do user's list

### Walidacja danych
- **Input validation:** Zod schema dla request body
- **Sanitization:** Supabase client używa parametryzowanych queries
- **Constraints:**
  - `name` max 255 characters
  - Sprawdzenie istnienia produktów
  - Walidacja desired_quantity (musi być >= 1)

### Ochrona przed atakami
- **SQL Injection:** Supabase client z parametryzowanymi queries
- **XSS:** JSON responses auto-escaped przez Astro
- **CSRF:** JWT w Authorization header (nie w cookies)
- **Rate Limiting:** Należy zaimplementować (100 req/min per user według specyfikacji)

### Data Privacy
- RLS zapewnia izolację danych między użytkownikami
- Żadne dane nie są współdzielone między userami
- User widzi tylko swoje shopping lists

## 7. Obsługa błędów

### Error Handling Strategy
Zgodnie z zasadami clean code:
- Handle errors at the beginning of functions
- Use early returns for error conditions
- Guard clauses for preconditions
- Proper error logging with context

### Katalog błędów

#### 1. Authentication Errors (401)
**Scenariusz:** Brak lub nieprawidłowy JWT token
```typescript
// Handled by middleware
if (!user) {
  return new Response(
    JSON.stringify({
      error: {
        code: "UNAUTHORIZED",
        message: "User not authenticated"
      }
    }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}
```

#### 2. Validation Errors (400)
**Scenariusz:** Nieprawidłowe dane wejściowe
```typescript
// Name exceeds 255 characters
const result = GenerateShoppingListSchema.safeParse(body);
if (!result.success) {
  return new Response(
    JSON.stringify({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: result.error.flatten()
      }
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
```

#### 3. Business Logic Errors (422)
**Scenariusz:** Brak produktów z quantity = 0
```typescript
if (emptyPantryItems.length === 0) {
  return new Response(
    JSON.stringify({
      error: {
        code: "NO_ITEMS_TO_ADD",
        message: "No items to add to shopping list. All pantry items have stock.",
        details: {
          pantry_empty_items_count: 0
        }
      }
    }),
    { status: 422, headers: { "Content-Type": "application/json" } }
  );
}
```

#### 4. Database Errors (500)
**Scenariusz:** Błąd podczas operacji na bazie danych
```typescript
try {
  // database operations
} catch (error) {
  console.error("Error generating shopping list:", error);
  return new Response(
    JSON.stringify({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred"
      }
    }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
```

### Logging Strategy
```typescript
// Info level - successful operations
console.log(`Shopping list generated for user ${userId}, items count: ${items.length}`);

// Error level - with full context
console.error("Error generating shopping list:", {
  userId,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});
```

### Error Response Helper
Utworzyć helper function dla spójnych error responses:
```typescript
// src/lib/utils/api-error.ts
export function createApiError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return new Response(
    JSON.stringify({
      error: { code, message, details }
    }),
    { 
      status, 
      headers: { "Content-Type": "application/json" } 
    }
  );
}
```

## 8. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła

1. **Multiple Database Queries**
   - Oddzielne queries dla pantry items i creation
   - Może powodować opóźnienia przy dużych datasetach

2. **N+1 Query Problem**
   - Potencjalnie przy pobieraniu kategorii dla każdego produktu
   - Rozwiązanie: JOIN w głównym query

3. **Bulk Insert Performance**
   - Wiele shopping_list_items dla jednej listy
   - Może być wolne przy dużej liczbie produktów

### Strategie optymalizacji

#### 1. Single Complex Query z JOINs
```sql
-- Zamiast wielu queries, jeden z wszystkimi danymi
SELECT 
  pi.id as pantry_item_id,
  pi.product_id,
  p.name as product_name,
  p.desired_quantity,
  p.category_id,
  c.name as category_name
FROM pantry_items pi
JOIN products p ON p.id = pi.product_id
LEFT JOIN categories c ON c.id = p.category_id
WHERE pi.user_id = $1 AND pi.quantity = 0;
```

#### 2. Batch Insert dla Shopping List Items
```typescript
// Użycie Supabase batch insert
const { data, error } = await supabase
  .from('shopping_list_items')
  .insert(items); // Array insert - pojedyncze zapytanie
```

#### 3. Transaction dla Data Integrity
```typescript
// Użycie Supabase transactions
await supabase.rpc('generate_shopping_list_transaction', {
  p_user_id: userId,
  p_list_name: name,
  p_items: items
});
```

#### 4. Caching Strategy (Future Enhancement)
- Cache categories (rzadko się zmieniają)
- Cache user's products list (invalidate on changes)
- Consider Redis for session data

#### 5. Database Indexes
Upewnić się że istnieją indexy:
```sql
-- Już powinny być w schema według db-plan.md
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_product_id ON pantry_items(product_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);
```

#### 6. Query Optimization
- Use `EXPLAIN ANALYZE` do sprawdzenia query performance
- Ensure RLS policies są optymalne
- Consider materialized views dla complex queries (future)

#### 7. Response Size Optimization
- Limit liczby items zwracanych (max 100?)
- Pagination dla bardzo długich list (future enhancement)
- Compress responses (gzip) dla dużych payloadów

### Performance Monitoring
```typescript
// Add timing logs
const startTime = performance.now();
// ... operations
const endTime = performance.now();
console.log(`Shopping list generated in ${endTime - startTime}ms`);
```

## 9. Etapy wdrożenia

### Krok 1: Utworzenie service layer
**Plik:** `src/lib/services/shopping-list.service.ts`

```typescript
import type { SupabaseClient } from "@/db/supabase.client";
import type { ShoppingListDetailDTO, ShoppingListItemDTO } from "@/types";

export class ShoppingListService {
  constructor(private supabase: SupabaseClient) {}

  async generateShoppingList(
    userId: string,
    name: string = "Shopping List"
  ): Promise<ShoppingListDetailDTO> {
    // Implementation będzie w kolejnych krokach
  }
}
```

**Zadania:**
- [ ] Utworzyć plik service
- [ ] Zdefiniować klasę ShoppingListService
- [ ] Dodać constructor przyjmujący supabase client
- [ ] Utworzyć metodę generateShoppingList

### Krok 2: Implementacja logiki pobierania pustych pantry items
**W:** `ShoppingListService.generateShoppingList()`

```typescript
// Query pantry items with quantity = 0
const { data: emptyItems, error: queryError } = await this.supabase
  .from('pantry_items')
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
  .eq('user_id', userId)
  .eq('quantity', 0);

if (queryError) {
  throw new Error(`Failed to fetch pantry items: ${queryError.message}`);
}

// Check if there are items to add
if (!emptyItems || emptyItems.length === 0) {
  throw new Error('NO_ITEMS_TO_ADD');
}
```

**Zadania:**
- [ ] Implementować query do pantry_items
- [ ] Użyć JOIN z products i categories
- [ ] Sprawdzić błędy zapytania
- [ ] Walidować czy są items do dodania
- [ ] Throw custom error dla braku items

### Krok 3: Utworzenie shopping_list record
**W:** `ShoppingListService.generateShoppingList()`

```typescript
// Create shopping list
const { data: shoppingList, error: createError } = await this.supabase
  .from('shopping_lists')
  .insert({
    user_id: userId,
    name: name
  })
  .select()
  .single();

if (createError || !shoppingList) {
  throw new Error(`Failed to create shopping list: ${createError?.message}`);
}
```

**Zadania:**
- [ ] Insert do shopping_lists table
- [ ] Przekazać user_id i name
- [ ] Użyć .select().single() dla zwrócenia created record
- [ ] Handle błędy creation

### Krok 4: Utworzenie shopping_list_items (bulk)
**W:** `ShoppingListService.generateShoppingList()`

```typescript
// Prepare items for bulk insert
const itemsToInsert = emptyItems.map(item => ({
  shopping_list_id: shoppingList.id,
  product_id: item.product_id,
  quantity: item.products.desired_quantity,
  is_checked: false
}));

// Bulk insert shopping list items
const { data: createdItems, error: itemsError } = await this.supabase
  .from('shopping_list_items')
  .insert(itemsToInsert)
  .select();

if (itemsError) {
  // Rollback shopping list if items creation fails
  await this.supabase
    .from('shopping_lists')
    .delete()
    .eq('id', shoppingList.id);
  
  throw new Error(`Failed to create shopping list items: ${itemsError.message}`);
}
```

**Zadania:**
- [ ] Map empty items do insert format
- [ ] Bulk insert wszystkich items
- [ ] Handle błędy z rollback
- [ ] Delete shopping_list jeśli items fail

### Krok 5: Transformacja i zwrot response
**W:** `ShoppingListService.generateShoppingList()`

```typescript
// Transform items to DTO format
const itemsDTO: ShoppingListItemDTO[] = createdItems.map((item, index) => ({
  ...item,
  product_name: emptyItems[index].products.name,
  category_id: emptyItems[index].products.category_id,
  category_name: emptyItems[index].products.categories?.name ?? null
}));

// Build final response
const result: ShoppingListDetailDTO = {
  ...shoppingList,
  items: itemsDTO
};

return result;
```

**Zadania:**
- [ ] Map created items do ShoppingListItemDTO
- [ ] Dodać product_name, category info
- [ ] Build ShoppingListDetailDTO
- [ ] Return final result

### Krok 6: Utworzenie Zod schema dla walidacji
**Plik:** `src/lib/schemas/shopping-list.schema.ts`

```typescript
import { z } from "zod";

export const GenerateShoppingListSchema = z.object({
  name: z
    .string()
    .max(255, "List name must not exceed 255 characters")
    .optional()
    .default("Shopping List")
});

export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListSchema>;
```

**Zadania:**
- [ ] Utworzyć plik schemas
- [ ] Zdefiniować GenerateShoppingListSchema
- [ ] Dodać walidację dla name (max 255)
- [ ] Export schema i type

### Krok 7: Utworzenie API route handler
**Plik:** `src/pages/api/shopping-lists/generate.ts`

```typescript
import type { APIRoute } from "astro";
import { ShoppingListService } from "@/lib/services/shopping-list.service";
import { GenerateShoppingListSchema } from "@/lib/schemas/shopping-list.schema";
import type { ApiResponse, ShoppingListDetailDTO } from "@/types";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Implementation w następnych krokach
};
```

**Zadania:**
- [ ] Utworzyć folder structure: api/shopping-lists/
- [ ] Utworzyć generate.ts file
- [ ] Dodać prerender = false
- [ ] Import potrzebnych typów i services
- [ ] Export POST handler

### Krok 8: Implementacja authentication check w route
**W:** `POST handler`

```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  // Check authentication
  const { supabase, user } = locals;
  
  if (!user) {
    return new Response(
      JSON.stringify({
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated"
        }
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Continue with implementation...
};
```

**Zadania:**
- [ ] Extract supabase i user z locals
- [ ] Check if user exists
- [ ] Return 401 jeśli brak user
- [ ] Set proper headers

### Krok 9: Implementacja input parsing i validation
**W:** `POST handler`

```typescript
// Parse request body
let body;
try {
  body = await request.json();
} catch {
  return new Response(
    JSON.stringify({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid JSON in request body"
      }
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}

// Validate input
const validationResult = GenerateShoppingListSchema.safeParse(body);
if (!validationResult.success) {
  return new Response(
    JSON.stringify({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: validationResult.error.flatten().fieldErrors
      }
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}

const { name } = validationResult.data;
```

**Zadania:**
- [ ] Parse request.json() z error handling
- [ ] Validate przez Zod schema
- [ ] Return 400 dla validation errors
- [ ] Extract validated data

### Krok 10: Wywołanie service i obsługa błędów
**W:** `POST handler`

```typescript
try {
  // Create service instance
  const shoppingListService = new ShoppingListService(supabase);
  
  // Generate shopping list
  const result = await shoppingListService.generateShoppingList(
    user.id,
    name
  );
  
  // Return success response
  const response: ApiResponse<ShoppingListDetailDTO> = {
    data: result
  };
  
  return new Response(
    JSON.stringify(response),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
  
} catch (error) {
  console.error("Error generating shopping list:", {
    userId: user.id,
    error: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString()
  });
  
  // Handle specific business errors
  if (error instanceof Error && error.message === 'NO_ITEMS_TO_ADD') {
    return new Response(
      JSON.stringify({
        error: {
          code: "NO_ITEMS_TO_ADD",
          message: "No items to add to shopping list. All pantry items have stock.",
          details: { pantry_empty_items_count: 0 }
        }
      }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Generic error response
  return new Response(
    JSON.stringify({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred"
      }
    }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
```

**Zadania:**
- [ ] Utworzyć service instance z supabase client
- [ ] Call generateShoppingList method
- [ ] Wrap result w ApiResponse format
- [ ] Return 201 status for success
- [ ] Handle NO_ITEMS_TO_ADD error (422)
- [ ] Handle generic errors (500)
- [ ] Add comprehensive error logging

### Krok 11: Testy jednostkowe service (opcjonalne)
**Plik:** `src/lib/services/__tests__/shopping-list.service.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ShoppingListService } from '../shopping-list.service';

describe('ShoppingListService', () => {
  it('should generate shopping list with empty pantry items', async () => {
    // Mock supabase client
    // Test implementation
  });
  
  it('should throw error when no items with quantity 0', async () => {
    // Test implementation
  });
  
  // More tests...
});
```

**Zadania:**
- [ ] Setup test framework (Vitest)
- [ ] Mock Supabase client
- [ ] Test happy path
- [ ] Test error scenarios
- [ ] Test edge cases

### Krok 12: Testowanie manualne i integracyjne

**Zadania:**
- [ ] Test z Postman/Insomnia:
  - Prawidłowy request z name
  - Request bez name (default)
  - Request z za długim name (> 255)
  - Request bez authorization
  - Request gdy brak empty pantry items
- [ ] Sprawdzić response format
- [ ] Sprawdzić database state po operacji
- [ ] Sprawdzić logi błędów
- [ ] Test wydajności z dużą liczbą items

### Krok 13: Dokumentacja i finalizacja

**Zadania:**
- [ ] Dodać JSDoc comments do service methods
- [ ] Dodać inline comments dla złożonej logiki
- [ ] Update API documentation (jeśli external)
- [ ] Sprawdzić ESLint/TypeScript errors
- [ ] Code review
- [ ] Merge do main branch

### Krok 14: Monitoring i obserwacja (Post-deployment)

**Zadania:**
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Analyze user behavior
- [ ] Gather feedback
- [ ] Plan optimizations jeśli potrzebne

---

## Podsumowanie

Ten plan implementacji dostarcza kompleksowy przewodnik dla zespołu deweloperskiego do wdrożenia endpointu **POST /api/shopping-lists/generate**. Plan obejmuje:

✅ Szczegółową specyfikację request/response  
✅ Definicje typów TypeScript  
✅ Logikę biznesową w service layer  
✅ Walidację przez Zod schemas  
✅ Obsługę błędów zgodną z best practices  
✅ Optymalizacje wydajnościowe  
✅ Względy bezpieczeństwa (Auth, RLS, Validation)  
✅ Krok po kroku instrukcje implementacji  

Endpoint jest zgodny z:
- Tech stack (Astro 5, TypeScript, Supabase)
- Implementation rules (clean code, error handling, services)
- API specification z pliku api-plan.md
- Database schema z pliku db-plan.md

