create table if not exists categories (
  id text primary key,
  name jsonb not null,
  sort_order integer not null default 0,
  image text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  name jsonb not null,
  description jsonb not null,
  category_id text references categories(id),
  images text[] not null default '{}',
  sizes text[] not null default '{}',
  prices jsonb not null default '{}',
  sku text,
  badge text,
  rating numeric not null default 0,
  reviews integer not null default 0,
  tiktok_videos text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stores (
  id text primary key,
  name jsonb not null,
  location jsonb not null,
  lat numeric not null,
  lng numeric not null,
  contact_info text,
  phone text,
  hours text,
  tiktok_videos text[] not null default '{}',
  is_main boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  store_id text not null references stores(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  quantity integer,
  status text not null default 'available',
  updated_at timestamptz not null default now(),
  unique (store_id, product_id)
);

create table if not exists translations (
  key text primary key,
  en text not null default '',
  am text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt jsonb not null default '{}',
  type text not null default 'image',
  used_for text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  target_type text not null,
  target_id text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists website_settings (
  id text primary key default 'default',
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
