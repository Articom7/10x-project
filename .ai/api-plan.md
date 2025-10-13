# REST API Plan - SmartPantry

## 1. Resources

The API is organized around the following main resources:

- **Categories** - Pre-populated product categories (mapped to `categories` table)
- **Products** - User-specific product definitions (mapped to `products` table)
- **Pantry** - Current pantry state with quantities (mapped to `pantry_items` table)
- **Shopping Lists** - Generated shopping lists (mapped to `shopping_lists` and `shopping_list_items` tables)
- **Onboarding** - Pre-populated products for user onboarding (mapped to `onboarding_products` table)
- **Profiles** - User profile data (mapped to `profiles` table)

## 2. Endpoints

### 2.1. Categories

#### GET /api/categories
Retrieve all product categories.

**Query Parameters:**
- None

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Dairy",
      "created_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Bread",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated

---

### 2.2. Products

#### GET /api/products
Retrieve all products for the authenticated user.

**Query Parameters:**
- `category_id` (optional, integer) - Filter by category
- `page` (optional, integer, default: 1) - Page number
- `limit` (optional, integer, default: 50, max: 100) - Items per page
- `sort` (optional, string, default: "name") - Sort field (name, created_at, updated_at)
- `order` (optional, string, default: "asc") - Sort order (asc, desc)

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": "uuid-here",
      "category_id": 1,
      "category_name": "Dairy",
      "name": "Milk",
      "desired_quantity": 2,
      "current_quantity": 1,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 45,
    "total_pages": 1
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Invalid query parameters

---

#### GET /api/products/:id
Retrieve a specific product.

**Path Parameters:**
- `id` (integer) - Product ID

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "user_id": "uuid-here",
    "category_id": 1,
    "category_name": "Dairy",
    "name": "Milk",
    "desired_quantity": 2,
    "current_quantity": 1,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Product not found or doesn't belong to user
- `400 Bad Request` - Invalid product ID

---

#### POST /api/products
Create a new product manually.

**Request Body:**
```json
{
  "name": "Milk",
  "category_id": 1,
  "quantity": 2,
  "desired_quantity": 2
}
```

**Validation:**
- `name` (required, string, max 255 chars) - Product name
- `category_id` (optional, integer) - Category ID (must exist in categories table)
- `quantity` (optional, integer, default: 1, min: 0) - Initial quantity in pantry
- `desired_quantity` (optional, integer, default: 1, min: 1) - Desired quantity for shopping lists

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "user_id": "uuid-here",
    "category_id": 1,
    "category_name": "Dairy",
    "name": "Milk",
    "desired_quantity": 2,
    "current_quantity": 2,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Validation error
- `409 Conflict` - Product with this name already exists for user
- `404 Not Found` - Category not found

---

#### PATCH /api/products/:id
Update an existing product.

**Path Parameters:**
- `id` (integer) - Product ID

**Request Body:**
```json
{
  "name": "Whole Milk",
  "category_id": 1,
  "desired_quantity": 3
}
```

**Validation:**
- `name` (optional, string, max 255 chars) - Product name
- `category_id` (optional, integer) - Category ID
- `desired_quantity` (optional, integer, min: 1) - Desired quantity

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "user_id": "uuid-here",
    "category_id": 1,
    "category_name": "Dairy",
    "name": "Whole Milk",
    "desired_quantity": 3,
    "current_quantity": 1,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T12:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Product not found or doesn't belong to user
- `400 Bad Request` - Validation error
- `409 Conflict` - Product name already exists for user

---

#### DELETE /api/products/:id
Permanently delete a product and its pantry item.

**Path Parameters:**
- `id` (integer) - Product ID

**Request Body:**
- None

**Response (204 No Content):**
- Empty response body

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Product not found or doesn't belong to user
- `400 Bad Request` - Invalid product ID

---

#### POST /api/products/parse-text
Parse natural language text using LLM to generate product suggestions.

**Request Body:**
```json
{
  "text": "I bought 2 cartons of milk, a loaf of bread, and 6 eggs"
}
```

**Validation:**
- `text` (required, string, max 1000 chars) - Natural language description

**Response (200 OK):**
```json
{
  "data": {
    "suggestions": [
      {
        "name": "Milk",
        "quantity": 2,
        "category_id": 1,
        "confidence": 0.95
      },
      {
        "name": "Bread",
        "quantity": 1,
        "category_id": 2,
        "confidence": 0.92
      },
      {
        "name": "Eggs",
        "quantity": 6,
        "category_id": 1,
        "confidence": 0.98
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Validation error or text too long
- `503 Service Unavailable` - LLM service unavailable
- `429 Too Many Requests` - Rate limit exceeded

---

#### POST /api/products/bulk
Add multiple products from confirmed LLM suggestions or manual input.

**Request Body:**
```json
{
  "products": [
    {
      "name": "Milk",
      "category_id": 1,
      "quantity": 2
    },
    {
      "name": "Bread",
      "category_id": 2,
      "quantity": 1
    }
  ]
}
```

**Validation:**
- `products` (required, array, max 50 items) - Array of products to add
  - `name` (required, string, max 255 chars)
  - `category_id` (optional, integer)
  - `quantity` (required, integer, min: 0)

**Response (200 OK):**
```json
{
  "data": {
    "created": [
      {
        "id": 1,
        "name": "Milk",
        "category_id": 1,
        "quantity": 2,
        "desired_quantity": 2
      }
    ],
    "updated": [
      {
        "id": 2,
        "name": "Bread",
        "category_id": 2,
        "quantity": 3,
        "desired_quantity": 1
      }
    ]
  }
}
```

**Business Logic:**
- If product with same name exists for user: update pantry quantity (add to existing)
- If product doesn't exist: create new product and pantry item
- Set desired_quantity to the added quantity for new products

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Validation error
- `404 Not Found` - Category not found

---

### 2.3. Pantry

#### GET /api/pantry
Retrieve all pantry items for the authenticated user, grouped by categories.

**Query Parameters:**
- `category_id` (optional, integer) - Filter by category
- `show_empty` (optional, boolean, default: true) - Include items with quantity 0

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": [
    {
      "category_id": 1,
      "category_name": "Dairy",
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "Milk",
          "quantity": 2,
          "desired_quantity": 2,
          "updated_at": "2025-01-15T10:00:00Z"
        },
        {
          "id": 2,
          "product_id": 2,
          "product_name": "Eggs",
          "quantity": 0,
          "desired_quantity": 12,
          "updated_at": "2025-01-15T08:00:00Z"
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Invalid query parameters

---

#### GET /api/pantry/:id
Retrieve a specific pantry item.

**Path Parameters:**
- `id` (integer) - Pantry item ID

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "product_id": 1,
    "product_name": "Milk",
    "category_id": 1,
    "category_name": "Dairy",
    "quantity": 2,
    "desired_quantity": 2,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Pantry item not found or doesn't belong to user

---

#### PATCH /api/pantry/:id
Update quantity of a pantry item (for marking consumption).

**Path Parameters:**
- `id` (integer) - Pantry item ID

**Request Body:**
```json
{
  "quantity": 1
}
```

**Validation:**
- `quantity` (required, integer, min: 0) - New quantity

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "product_id": 1,
    "product_name": "Milk",
    "quantity": 1,
    "desired_quantity": 2,
    "updated_at": "2025-01-15T12:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Pantry item not found or doesn't belong to user
- `400 Bad Request` - Validation error (negative quantity)

---

#### POST /api/pantry/quick-start
Quick start onboarding - add selected products to pantry.

**Request Body:**
```json
{
  "product_ids": [1, 2, 3, 5, 8]
}
```

**Validation:**
- `product_ids` (required, array of integers) - Onboarding product IDs

**Response (201 Created):**
```json
{
  "data": {
    "added": [
      {
        "id": 1,
        "product_id": 10,
        "product_name": "Milk",
        "category_id": 1,
        "quantity": 1,
        "desired_quantity": 1
      }
    ]
  }
}
```

**Business Logic:**
- For each onboarding_product ID:
  - Create a new product for the user (copying name and category)
  - Create pantry_item with quantity = 1
  - If product with same name exists, skip

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Validation error
- `404 Not Found` - Onboarding product not found

---

### 2.4. Shopping Lists

#### GET /api/shopping-lists
Retrieve all shopping lists for the authenticated user.

**Query Parameters:**
- `page` (optional, integer, default: 1) - Page number
- `limit` (optional, integer, default: 20, max: 50) - Items per page
- `sort` (optional, string, default: "created_at") - Sort field
- `order` (optional, string, default: "desc") - Sort order

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": "uuid-here",
      "name": "Shopping List",
      "item_count": 5,
      "checked_count": 2,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated

---

#### GET /api/shopping-lists/:id
Retrieve a specific shopping list with all items.

**Path Parameters:**
- `id` (integer) - Shopping list ID

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "user_id": "uuid-here",
    "name": "Shopping List",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "items": [
      {
        "id": 1,
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
        "product_id": 2,
        "product_name": "Bread",
        "category_id": 2,
        "category_name": "Bread",
        "quantity": 1,
        "is_checked": true,
        "created_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Shopping list not found or doesn't belong to user

---

#### POST /api/shopping-lists/generate
Generate a new shopping list based on current pantry state.

**Request Body:**
```json
{
  "name": "Weekly Shopping"
}
```

**Validation:**
- `name` (optional, string, default: "Shopping List") - Custom name for the list

**Response (201 Created):**
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
        "product_id": 1,
        "product_name": "Milk",
        "category_id": 1,
        "category_name": "Dairy",
        "quantity": 2,
        "is_checked": false
      }
    ]
  }
}
```

**Business Logic:**
1. Find all pantry_items where quantity = 0
2. For each product:
   - Use desired_quantity if set
   - Otherwise, use historical maximum quantity from pantry_items history (requires tracking max_quantity or using current desired_quantity as default)
3. Create shopping_list and shopping_list_items
4. Return the generated list with all items

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Validation error
- `422 Unprocessable Entity` - No items to add to shopping list (nothing with quantity 0)

---

#### PATCH /api/shopping-lists/:id
Update shopping list metadata (name).

**Path Parameters:**
- `id` (integer) - Shopping list ID

**Request Body:**
```json
{
  "name": "Updated Shopping List Name"
}
```

**Validation:**
- `name` (required, string, max 255 chars) - New list name

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "user_id": "uuid-here",
    "name": "Updated Shopping List Name",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T12:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Shopping list not found or doesn't belong to user
- `400 Bad Request` - Validation error

---

#### DELETE /api/shopping-lists/:id
Delete a shopping list and all its items.

**Path Parameters:**
- `id` (integer) - Shopping list ID

**Request Body:**
- None

**Response (204 No Content):**
- Empty response body

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Shopping list not found or doesn't belong to user

---

#### PATCH /api/shopping-lists/:listId/items/:itemId
Update a shopping list item (toggle checked state or modify quantity).

**Path Parameters:**
- `listId` (integer) - Shopping list ID
- `itemId` (integer) - Shopping list item ID

**Request Body:**
```json
{
  "is_checked": true,
  "quantity": 3
}
```

**Validation:**
- `is_checked` (optional, boolean) - Checked state
- `quantity` (optional, integer, min: 1) - Quantity to purchase

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "shopping_list_id": 1,
    "product_id": 1,
    "product_name": "Milk",
    "quantity": 3,
    "is_checked": true,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Shopping list or item not found, or doesn't belong to user
- `400 Bad Request` - Validation error

---

#### POST /api/shopping-lists/:id/complete
Complete shopping - add checked items to pantry and optionally delete the list.

**Path Parameters:**
- `id` (integer) - Shopping list ID

**Request Body:**
```json
{
  "delete_list": false
}
```

**Validation:**
- `delete_list` (optional, boolean, default: false) - Delete list after completion

**Response (200 OK):**
```json
{
  "data": {
    "updated_products": [
      {
        "product_id": 1,
        "product_name": "Milk",
        "old_quantity": 0,
        "new_quantity": 2
      }
    ],
    "list_deleted": false
  }
}
```

**Business Logic:**
1. Get all checked items from shopping list
2. For each checked item:
   - Find corresponding pantry_item
   - Add item quantity to pantry quantity
   - Update pantry_item
3. If delete_list is true, delete the shopping list
4. Return summary of updates

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Shopping list not found or doesn't belong to user
- `400 Bad Request` - Validation error

---

### 2.5. Onboarding

#### GET /api/onboarding/products
Retrieve pre-populated products for user onboarding.

**Query Parameters:**
- None

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Milk",
      "category_id": 1,
      "category_name": "Dairy"
    },
    {
      "id": 2,
      "name": "Bread",
      "category_id": 2,
      "category_name": "Bread"
    },
    {
      "id": 3,
      "name": "Eggs",
      "category_id": 1,
      "category_name": "Dairy"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated

---

### 2.6. Profiles

#### GET /api/profile
Retrieve the authenticated user's profile.

**Request Body:**
- None

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid-here",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Profile not found (should auto-create on first access)

---

#### PATCH /api/profile
Update the authenticated user's profile (for future extensions).

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid-here",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T12:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Validation error

---

## 3. Authentication and Authorization

### Authentication Mechanism
The API uses **Supabase Authentication** with JWT tokens:

1. **User Registration & Login**: Handled by Supabase Auth client SDK
   - Email/password authentication
   - Returns JWT access token and refresh token
   - Tokens stored in httpOnly cookies or local storage (client-side decision)

2. **API Request Authentication**:
   - All API requests must include authentication token
   - Token sent via `Authorization: Bearer <token>` header
   - Supabase middleware validates token and extracts user ID

3. **Session Management**:
   - Access tokens expire after 1 hour (Supabase default)
   - Refresh tokens used to obtain new access tokens
   - Supabase client SDK handles token refresh automatically

### Authorization
**Row-Level Security (RLS)** enforced at database level:

- All queries automatically filtered by `user_id = auth.uid()`
- Users can only access their own data
- RLS policies defined in Supabase for tables:
  - `profiles`: user can read/update own profile
  - `products`: user can CRUD own products
  - `pantry_items`: user can CRUD own pantry items
  - `shopping_lists`: user can CRUD own shopping lists
  - `shopping_list_items`: user can CRUD items in own shopping lists

**Public Resources** (read-only for authenticated users):
- `categories`: all authenticated users can read
- `onboarding_products`: all authenticated users can read

### Implementation Details

**Astro Middleware** (`src/middleware/index.ts`):
```typescript
- Extract JWT from Authorization header
- Validate token using Supabase client
- Attach user object to request context
- Return 401 if token invalid/missing
```

**API Endpoints** (Astro API routes in `src/pages/api/`):
```typescript
- Access authenticated user via context
- Use Supabase client with user's session
- RLS automatically enforces data access rules
```

---

## 4. Validation and Business Logic

### Validation Rules

#### Products
- `name`: required, string, max 255 characters, unique per user
- `category_id`: optional, integer, must exist in categories table
- `desired_quantity`: integer, min 1, default 1

#### Pantry Items
- `quantity`: integer, min 0, default 0
- `product_id`: required, integer, must be user's product
- Unique constraint: one pantry item per product per user

#### Shopping List Items
- `quantity`: integer, min 1, default 1
- `is_checked`: boolean, default false
- `product_id`: required, must be user's product

#### Shopping Lists
- `name`: string, max 255 characters, default "Shopping List"

#### Text Parsing (LLM)
- `text`: required, string, max 1000 characters

#### Bulk Product Addition
- `products`: required, array, max 50 items
- Each item validated as product creation

### Business Logic Implementation

#### 1. LLM Product Parsing (POST /api/products/parse-text)
```
1. Validate input text (max 1000 chars)
2. Call OpenRouter.ai API with prompt:
   - Extract product names and quantities
   - Return structured JSON
   - Include category suggestions
3. Map LLM response to suggestions format
4. Return suggestions (not saved to DB)
5. Handle LLM errors gracefully
```

#### 2. Bulk Product Addition (POST /api/products/bulk)
```
1. For each product in request:
   a. Check if product exists for user (by name)
   b. If exists:
      - Get pantry_item
      - Add quantity to existing quantity
      - Update pantry_item
   c. If not exists:
      - Create product record
      - Set desired_quantity = quantity
      - Create pantry_item with quantity
2. Return arrays of created and updated products
```

#### 3. Shopping List Generation (POST /api/shopping-lists/generate)
```
1. Query pantry_items where quantity = 0
2. For each item:
   a. Get product details
   b. Determine quantity to buy:
      - Use product.desired_quantity if set
      - Otherwise use desired_quantity as fallback
3. Create shopping_list record
4. Create shopping_list_items for all products
5. Return complete shopping list with items
```

#### 4. Shopping List Completion (POST /api/shopping-lists/:id/complete)
```
1. Get all items from shopping list where is_checked = true
2. For each checked item:
   a. Get pantry_item for product
   b. Add item.quantity to pantry_item.quantity
   c. Update pantry_item
3. Track updated products for response
4. If delete_list = true, delete shopping list
5. Return summary of updates
```

#### 5. Quick Start Onboarding (POST /api/pantry/quick-start)
```
1. For each onboarding_product_id:
   a. Get onboarding product details
   b. Check if user has product with same name
   c. If not exists:
      - Create product (copy name, category)
      - Set desired_quantity = 1
      - Create pantry_item with quantity = 1
   d. If exists, skip
2. Return list of added products
```

#### 6. Product Consumption Tracking
```
- PATCH /api/pantry/:id with quantity
- Update pantry_item.quantity directly
- Allow setting to 0 (for shopping list inclusion)
- Validate quantity >= 0
```

#### 7. Historical Maximum Tracking
```
Note: For MVP, use desired_quantity as the target.
Future enhancement: Track historical max in separate column or calculate from audit logs.
```

### Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

**Standard Error Codes:**
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - User doesn't have access to resource
- `NOT_FOUND` (404) - Resource doesn't exist
- `VALIDATION_ERROR` (400) - Request validation failed
- `CONFLICT` (409) - Resource conflict (e.g., duplicate name)
- `SERVICE_UNAVAILABLE` (503) - External service (LLM) unavailable
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_SERVER_ERROR` (500) - Unexpected server error

### Rate Limiting

**LLM Endpoints:**
- `/api/products/parse-text`: 10 requests per minute per user

**General Endpoints:**
- All other endpoints: 100 requests per minute per user

Implemented using Supabase Edge Functions rate limiting or custom middleware.

### Data Integrity

**Triggers (Database Level):**
- Auto-update `updated_at` timestamp on record modification
- Cascade delete user data when user deleted

**Transactions:**
- Bulk product addition: single transaction
- Shopping list generation: single transaction
- Shopping list completion: single transaction

**Constraints Enforcement:**
- UNIQUE(user_id, name) for products
- UNIQUE(user_id, product_id) for pantry_items
- CHECK constraints for quantity validations
- Foreign key constraints with appropriate cascade rules

---

## 5. API Versioning

All endpoints are prefixed with `/api/` for the current version. Future versions will use `/api/v2/`, `/api/v3/`, etc.

**Current Version**: v1 (implicit, no version in path)

---

## 6. Response Format Standards

### Success Responses
All successful responses follow this structure:

```json
{
  "data": { /* resource or array of resources */ },
  "pagination": { /* only for list endpoints */ },
  "meta": { /* optional metadata */ }
}
```

### Pagination
List endpoints include pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Timestamps
- All timestamps in ISO 8601 format with timezone: `2025-01-15T10:00:00Z`
- UTC timezone used throughout

---

## 7. Implementation Notes

### Technology Stack Integration

**Astro 5 API Routes** (`src/pages/api/`):
- Each endpoint as separate `.ts` file
- Export functions for each HTTP method (GET, POST, PATCH, DELETE)
- Use Astro's built-in request/response handling

**Supabase Client** (`src/db/supabase.client.ts`):
- Server-side client with service role for admin operations
- User-scoped client from middleware context for RLS enforcement

**TypeScript Types** (`src/types.ts`):
- Shared DTOs for request/response
- Entity types matching database schema
- Generated types from Supabase CLI

**Middleware** (`src/middleware/index.ts`):
- Authentication check on all `/api/*` routes
- User context injection
- Error handling wrapper

### Future Enhancements
- Historical quantity tracking (max_quantity field or audit table)
- Product search with fuzzy matching
- Export shopping list to various formats
- Recurring shopping list templates
- Product expiration tracking
- Barcode scanning integration

