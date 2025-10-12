-- migration: create_smartpantry_schema
-- purpose: initialize complete database schema for smartpantry application
-- affected tables: profiles, categories, products, pantry_items, shopping_lists, shopping_list_items, onboarding_products
-- special considerations: 
--   - enables rls on all tables
--   - creates triggers for updated_at columns
--   - sets up indexes for performance
--   - implements granular rls policies for anon and authenticated roles

-- ============================================================================
-- create updated_at trigger function
-- ============================================================================
-- this function will be used by triggers to automatically update the updated_at column

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.handle_updated_at() is 'automatically updates the updated_at column to current timestamp';

-- ============================================================================
-- table: profiles
-- ============================================================================
-- stores public user data, separate from authentication information
-- one-to-one relationship with auth.users

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'stores public user profile data';
comment on column public.profiles.id is 'references auth.users.id, primary key';
comment on column public.profiles.created_at is 'timestamp when profile was created';
comment on column public.profiles.updated_at is 'timestamp when profile was last updated';

-- trigger to update updated_at column
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- enable row level security
alter table public.profiles enable row level security;

-- rls policy: authenticated users can select their own profile
create policy "authenticated users can select their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- rls policy: authenticated users can insert their own profile
create policy "authenticated users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- rls policy: authenticated users can update their own profile
create policy "authenticated users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- rls policy: authenticated users can delete their own profile
create policy "authenticated users can delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- ============================================================================
-- table: categories
-- ============================================================================
-- global, pre-populated table for product categories
-- publicly readable by all authenticated users

create table public.categories (
  id serial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.categories is 'global product categories, pre-populated';
comment on column public.categories.id is 'auto-incrementing primary key';
comment on column public.categories.name is 'unique category name';
comment on column public.categories.created_at is 'timestamp when category was created';

-- enable row level security
alter table public.categories enable row level security;

-- rls policy: anonymous users can select categories
create policy "anonymous users can select categories"
  on public.categories
  for select
  to anon
  using (true);

-- rls policy: authenticated users can select categories
create policy "authenticated users can select categories"
  on public.categories
  for select
  to authenticated
  using (true);

-- ============================================================================
-- table: products
-- ============================================================================
-- user-specific product definitions
-- each user can have their own products with unique names

create table public.products (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id integer references public.categories(id) on delete set null,
  name text not null,
  desired_quantity integer not null default 1 check (desired_quantity >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

comment on table public.products is 'user-specific product definitions';
comment on column public.products.id is 'auto-incrementing primary key';
comment on column public.products.user_id is 'references auth.users.id, owner of the product';
comment on column public.products.category_id is 'references categories.id, can be null';
comment on column public.products.name is 'product name, unique per user';
comment on column public.products.desired_quantity is 'desired quantity for this product, minimum 1';
comment on column public.products.created_at is 'timestamp when product was created';
comment on column public.products.updated_at is 'timestamp when product was last updated';

-- create indexes for performance
create index products_user_id_idx on public.products(user_id);
create index products_category_id_idx on public.products(category_id);

-- trigger to update updated_at column
create trigger products_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();

-- enable row level security
alter table public.products enable row level security;

-- rls policy: authenticated users can select their own products
create policy "authenticated users can select their own products"
  on public.products
  for select
  to authenticated
  using (auth.uid() = user_id);

-- rls policy: authenticated users can insert their own products
create policy "authenticated users can insert their own products"
  on public.products
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- rls policy: authenticated users can update their own products
create policy "authenticated users can update their own products"
  on public.products
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rls policy: authenticated users can delete their own products
create policy "authenticated users can delete their own products"
  on public.products
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- table: pantry_items
-- ============================================================================
-- tracks the quantity of a product in a user's pantry
-- one-to-one relationship with products per user

create table public.pantry_items (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id integer not null references public.products(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

comment on table public.pantry_items is 'tracks product quantities in user pantries';
comment on column public.pantry_items.id is 'auto-incrementing primary key';
comment on column public.pantry_items.user_id is 'references auth.users.id, owner of the pantry item';
comment on column public.pantry_items.product_id is 'references products.id';
comment on column public.pantry_items.quantity is 'current quantity in pantry, minimum 0';
comment on column public.pantry_items.created_at is 'timestamp when pantry item was created';
comment on column public.pantry_items.updated_at is 'timestamp when pantry item was last updated';

-- create indexes for performance
create index pantry_items_user_id_idx on public.pantry_items(user_id);
create index pantry_items_product_id_idx on public.pantry_items(product_id);

-- trigger to update updated_at column
create trigger pantry_items_updated_at
  before update on public.pantry_items
  for each row
  execute function public.handle_updated_at();

-- enable row level security
alter table public.pantry_items enable row level security;

-- rls policy: authenticated users can select their own pantry items
create policy "authenticated users can select their own pantry items"
  on public.pantry_items
  for select
  to authenticated
  using (auth.uid() = user_id);

-- rls policy: authenticated users can insert their own pantry items
create policy "authenticated users can insert their own pantry items"
  on public.pantry_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- rls policy: authenticated users can update their own pantry items
create policy "authenticated users can update their own pantry items"
  on public.pantry_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rls policy: authenticated users can delete their own pantry items
create policy "authenticated users can delete their own pantry items"
  on public.pantry_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- table: shopping_lists
-- ============================================================================
-- stores metadata for user-created shopping lists

create table public.shopping_lists (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Shopping List',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.shopping_lists is 'metadata for user shopping lists';
comment on column public.shopping_lists.id is 'auto-incrementing primary key';
comment on column public.shopping_lists.user_id is 'references auth.users.id, owner of the shopping list';
comment on column public.shopping_lists.name is 'name of the shopping list';
comment on column public.shopping_lists.created_at is 'timestamp when shopping list was created';
comment on column public.shopping_lists.updated_at is 'timestamp when shopping list was last updated';

-- create index for performance
create index shopping_lists_user_id_idx on public.shopping_lists(user_id);

-- trigger to update updated_at column
create trigger shopping_lists_updated_at
  before update on public.shopping_lists
  for each row
  execute function public.handle_updated_at();

-- enable row level security
alter table public.shopping_lists enable row level security;

-- rls policy: authenticated users can select their own shopping lists
create policy "authenticated users can select their own shopping lists"
  on public.shopping_lists
  for select
  to authenticated
  using (auth.uid() = user_id);

-- rls policy: authenticated users can insert their own shopping lists
create policy "authenticated users can insert their own shopping lists"
  on public.shopping_lists
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- rls policy: authenticated users can update their own shopping lists
create policy "authenticated users can update their own shopping lists"
  on public.shopping_lists
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rls policy: authenticated users can delete their own shopping lists
create policy "authenticated users can delete their own shopping lists"
  on public.shopping_lists
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- table: shopping_list_items
-- ============================================================================
-- individual items within a shopping list

create table public.shopping_list_items (
  id serial primary key,
  shopping_list_id integer not null references public.shopping_lists(id) on delete cascade,
  product_id integer not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 1),
  is_checked boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.shopping_list_items is 'individual items within shopping lists';
comment on column public.shopping_list_items.id is 'auto-incrementing primary key';
comment on column public.shopping_list_items.shopping_list_id is 'references shopping_lists.id';
comment on column public.shopping_list_items.product_id is 'references products.id';
comment on column public.shopping_list_items.quantity is 'quantity needed, minimum 1';
comment on column public.shopping_list_items.is_checked is 'whether item is checked off';
comment on column public.shopping_list_items.created_at is 'timestamp when item was added to list';

-- create indexes for performance
create index shopping_list_items_shopping_list_id_idx on public.shopping_list_items(shopping_list_id);
create index shopping_list_items_product_id_idx on public.shopping_list_items(product_id);

-- enable row level security
alter table public.shopping_list_items enable row level security;

-- rls policy: authenticated users can select items from their own shopping lists
create policy "authenticated users can select their own shopping list items"
  on public.shopping_list_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.user_id = auth.uid()
    )
  );

-- rls policy: authenticated users can insert items into their own shopping lists
create policy "authenticated users can insert their own shopping list items"
  on public.shopping_list_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.user_id = auth.uid()
    )
  );

-- rls policy: authenticated users can update items in their own shopping lists
create policy "authenticated users can update their own shopping list items"
  on public.shopping_list_items
  for update
  to authenticated
  using (
    exists (
      select 1 from public.shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.user_id = auth.uid()
    )
  );

-- rls policy: authenticated users can delete items from their own shopping lists
create policy "authenticated users can delete their own shopping list items"
  on public.shopping_list_items
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.user_id = auth.uid()
    )
  );

-- ============================================================================
-- table: onboarding_products
-- ============================================================================
-- global, pre-populated table with common products for user onboarding
-- publicly readable by all authenticated users

create table public.onboarding_products (
  id serial primary key,
  name text not null unique,
  category_id integer references public.categories(id) on delete set null
);

comment on table public.onboarding_products is 'global pre-populated products for user onboarding';
comment on column public.onboarding_products.id is 'auto-incrementing primary key';
comment on column public.onboarding_products.name is 'unique product name';
comment on column public.onboarding_products.category_id is 'references categories.id, can be null';

-- create index for performance
create index onboarding_products_category_id_idx on public.onboarding_products(category_id);

-- enable row level security
alter table public.onboarding_products enable row level security;

-- rls policy: anonymous users can select onboarding products
create policy "anonymous users can select onboarding products"
  on public.onboarding_products
  for select
  to anon
  using (true);

-- rls policy: authenticated users can select onboarding products
create policy "authenticated users can select onboarding products"
  on public.onboarding_products
  for select
  to authenticated
  using (true);

