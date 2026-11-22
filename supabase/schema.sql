create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- First account receives admin role atomically inside the database.
create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Serialize concurrent first registrations so only one transaction can claim admin.
  perform pg_advisory_xact_lock(74201931);
  if not exists (select 1 from public.users where role = 'admin') then
    new.role := 'admin';
  else
    new.role := 'user';
  end if;
  return new;
end;
$$;

drop trigger if exists users_first_admin_trigger on public.users;
create trigger users_first_admin_trigger
before insert on public.users
for each row execute function public.assign_first_admin();

revoke all on function public.assign_first_admin() from public;
revoke all on function public.assign_first_admin() from anon;
revoke all on function public.assign_first_admin() from authenticated;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text default 'package',
  created_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  version text default '1.0',
  file_name text,
  file_size bigint,
  downloads bigint not null default 0,
  is_paid boolean not null default false,
  price numeric(12,2) not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  banner_url text,
  banner_path text,
  file_path text,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((is_paid = false and price = 0) or (is_paid = true and price > 0))
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  asset_id uuid not null references public.assets(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  amount numeric(12,2) not null,
  payment_screenshot_path text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists orders_one_active_purchase_per_user_asset
on public.orders(user_id, asset_id) where status in ('pending','approved');

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

insert into public.settings(key,value) values
('payment_qr_path',''),
('payment_upi_id',''),
('payment_instructions','Pay the exact amount and upload your payment screenshot.'),
('discord_invite','https://discord.gg/t96RQ9evBZ')
on conflict (key) do nothing;

create or replace function public.increment_asset_downloads(asset_uuid uuid)
returns void language sql security definer set search_path = public as $$
  update public.assets set downloads = downloads + 1 where id = asset_uuid;
$$;

-- Restrict the download counter RPC: only trusted server-side service-role code may call it.
revoke all on function public.increment_asset_downloads(uuid) from public;
revoke all on function public.increment_asset_downloads(uuid) from anon;
revoke all on function public.increment_asset_downloads(uuid) from authenticated;
grant execute on function public.increment_asset_downloads(uuid) to service_role;

-- No direct anonymous table access. Server uses service-role key after authorization.
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.assets enable row level security;
alter table public.orders enable row level security;
alter table public.settings enable row level security;

-- No anon/authenticated policies are intentionally added. Do not expose service role.
