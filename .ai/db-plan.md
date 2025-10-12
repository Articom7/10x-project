# SmartPantry Database Schema

## 1. Tables

### 1.1. users (Supabase Auth)
This table is managed by Supabase Auth and contains user authentication data.
- `id`: UUID PRIMARY KEY
- `email`: VARCHAR(255) NOT NULL UNIQUE
- `encrypted_password`: VARCHAR NOT NULL
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- ... and other Supabase Auth columns.

### 1.2. profiles
Stores public user data, separate from authentication information.
- `id`: UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

*Trigger: Automatically update the `updated_at` column on record updates.*

### 1.3. categories
Global, pre-populated table for product categories.
- `id`: SERIAL PRIMARY KEY
- `name`: TEXT NOT NULL UNIQUE
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.4. products
User-specific product definitions.
- `id`: SERIAL PRIMARY KEY
- `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `category_id`: INTEGER REFERENCES categories(id) ON DELETE SET NULL
- `name`: TEXT NOT NULL
- `desired_quantity`: INTEGER NOT NULL DEFAULT 1 CHECK (desired_quantity >= 1)
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- **Constraint**: UNIQUE(user_id, name)

*Trigger: Automatically update the `updated_at` column on record updates.*

### 1.5. pantry_items
Tracks the quantity of a product in a user's pantry.
- `id`: SERIAL PRIMARY KEY
- `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `product_id`: INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE
- `quantity`: INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- **Constraint**: UNIQUE(user_id, product_id)

*Trigger: Automatically update the `updated_at` column on record updates.*

### 1.6. shopping_lists
Stores metadata for user-created shopping lists.
- `id`: SERIAL PRIMARY KEY
- `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `name`: TEXT NOT NULL DEFAULT 'Shopping List'
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

*Trigger: Automatically update the `updated_at` column on record updates.*

### 1.7. shopping_list_items
Individual items within a shopping list.
- `id`: SERIAL PRIMARY KEY
- `shopping_list_id`: INTEGER NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE
- `product_id`: INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE
- `quantity`: INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1)
- `is_checked`: BOOLEAN NOT NULL DEFAULT false
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.8. onboarding_products
Global, pre-populated table with common products for user onboarding.
- `id`: SERIAL PRIMARY KEY
- `name`: TEXT NOT NULL UNIQUE
- `category_id`: INTEGER REFERENCES categories(id) ON DELETE SET NULL

## 2. Relationships
- A `users` record has a one-to-one relationship with a `profiles` record.
- A `users` can have many `products`, `pantry_items`, and `shopping_lists`.
- A `categories` can be associated with many `products` and `onboarding_products`.
- A `products` record has a one-to-one relationship with a `pantry_items` record for a given user.
- A `shopping_lists` can contain many `shopping_list_items`.
- A `products` can be included in many `shopping_list_items`.

## 3. Indexes
- **products**: Index on `user_id` and `category_id`.
- **pantry_items**: Index on `user_id` and `product_id`.
- **shopping_lists**: Index on `user_id`.
- **shopping_list_items**: Index on `shopping_list_id` and `product_id`.
- **onboarding_products**: Index on `category_id`.

## 4. Row-Level Security (RLS) Policies
- For tables containing user-specific data (`profiles`, `products`, `pantry_items`, `shopping_lists`, `shopping_list_items`), RLS policies must be implemented to ensure users can only access their own records (where `user_id` matches `auth.uid()`).
- For public tables (`categories`, `onboarding_products`), RLS policies should allow read access for all authenticated users.

## 5. Additional Notes
- **Timestamps**: Triggers should be implemented to automatically update the `updated_at` column in tables where it is present (`profiles`, `products`, `pantry_items`, `shopping_lists`) whenever a record is modified.
- **Data Integrity**: `ON DELETE CASCADE` is used on foreign keys referencing `auth.users(id)` to ensure that deleting a user removes all their associated data, preventing orphaned records.
- **Client-Side State**: LLM suggestions generated for adding products are managed on the client-side and are not stored in the database until the user confirms them.
