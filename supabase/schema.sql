create extension if not exists pgcrypto;

create table if not exists organizations (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists stores (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date,
  gender text not null default 'not_answered' check (gender in ('male', 'female', 'other', 'not_answered')),
  anonymous_device_id text,
  privacy_agreed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  store_id text not null references stores(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  visited_at timestamptz not null default now()
);

alter table customers add column if not exists birth_date date;
alter table customers add column if not exists gender text not null default 'not_answered';
alter table customers add column if not exists anonymous_device_id text;
alter table customers add column if not exists privacy_agreed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_gender_check'
  ) then
    alter table customers
      add constraint customers_gender_check
      check (gender in ('male', 'female', 'other', 'not_answered'));
  end if;
end $$;

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references organizations(id) on delete cascade,
  store_id text references stores(id) on delete cascade,
  title text not null,
  description text not null,
  required_visit_count integer not null check (required_visit_count > 0),
  scope text not null check (scope in ('store', 'organization')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_scope_store_consistency check (
    (scope = 'store' and store_id is not null)
    or
    (scope = 'organization' and store_id is null)
  )
);

create index if not exists stores_organization_id_idx on stores(organization_id);
create index if not exists visits_store_id_idx on visits(store_id);
create index if not exists visits_customer_id_idx on visits(customer_id);
create index if not exists visits_visited_at_idx on visits(visited_at desc);
create index if not exists coupons_organization_id_idx on coupons(organization_id);
create index if not exists coupons_store_id_idx on coupons(store_id);
create index if not exists coupons_is_active_idx on coupons(is_active);
create unique index if not exists coupons_seed_unique
  on coupons (organization_id, coalesce(store_id, ''), title);

drop index if exists customers_normalized_name_unique;
create unique index if not exists customers_anonymous_device_id_unique
  on customers (anonymous_device_id)
  where anonymous_device_id is not null;

insert into organizations (id, name)
values ('default-organization', 'デフォルト加盟店グループ')
on conflict (id) do update set name = excluded.name;

insert into stores (id, organization_id, name)
values ('default-store', 'default-organization', 'Aカフェ')
on conflict (id) do update
set organization_id = excluded.organization_id,
    name = excluded.name;

insert into coupons (organization_id, store_id, title, description, required_visit_count, scope, is_active)
values
  ('default-organization', 'default-store', '初回来店ありがとうクーポン', '次回使える小さな特典です。', 1, 'store', true),
  ('default-organization', 'default-store', 'ドリンク無料クーポン', 'Aカフェに3回来店した方限定で、対象ドリンクを1杯無料にします。', 3, 'store', true),
  ('default-organization', 'default-store', '10%OFFクーポン', 'Aカフェに5回来店した方限定で、お会計から10%OFFします。', 5, 'store', true),
  ('default-organization', null, '加盟店共通100円OFFクーポン', '加盟店グループ内の店舗で使える100円OFFクーポンです。', 1, 'organization', true)
on conflict do nothing;

-- =========================================================
-- Row Level Security
-- =========================================================

alter table organizations enable row level security;
alter table stores enable row level security;
alter table customers enable row level security;
alter table visits enable row level security;
alter table coupons enable row level security;

-- 既存ポリシーがある場合の重複エラーを避けるため、先に削除します。
drop policy if exists "organizations are publicly readable" on organizations;
drop policy if exists "stores are publicly readable" on stores;
drop policy if exists "customers are publicly readable" on customers;
drop policy if exists "visits are publicly readable" on visits;
drop policy if exists "coupons are publicly readable" on coupons;

drop policy if exists "anon can create customers" on customers;
drop policy if exists "anon can create visits" on visits;
drop policy if exists "anon can manage coupons" on coupons;

drop policy if exists "authenticated users can manage organizations" on organizations;
drop policy if exists "authenticated users can manage stores" on stores;
drop policy if exists "authenticated users can manage customers" on customers;
drop policy if exists "authenticated users can manage visits" on visits;
drop policy if exists "authenticated users can manage coupons" on coupons;

-- 店舗情報・組織情報・有効なクーポン情報は表示に使うため、MVPでは公開読み取りを許可します。
create policy "organizations are publicly readable"
on organizations
for select
to anon, authenticated
using (true);

create policy "stores are publicly readable"
on stores
for select
to anon, authenticated
using (true);

create policy "customers are publicly readable"
on customers
for select
to authenticated
using (true);

create policy "visits are publicly readable"
on visits
for select
to authenticated
using (true);

create policy "coupons are publicly readable"
on coupons
for select
to anon, authenticated
using (is_active = true);

-- QRチェックイン登録と管理操作はNext.jsサーバー側のsecret key経由で行います。
-- 生年月日・性別を含む顧客情報を公開APIから読んだり書いたりできないよう、anonには許可しません。

-- ログイン済みユーザーは管理操作を可能にします。
-- MVP用の簡易設定です。本番では organization_id / store_id で制限するべきです。
create policy "authenticated users can manage organizations"
on organizations
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users can manage stores"
on stores
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users can manage customers"
on customers
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users can manage visits"
on visits
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users can manage coupons"
on coupons
for all
to authenticated
using (true)
with check (true);

-- 将来拡張案: クーポンを利用可能な店舗に限定する中間テーブル。
-- MVPでは未使用です。
/*
create table if not exists coupon_usable_stores (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  store_id text not null references stores(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (coupon_id, store_id)
);
*/

-- 将来拡張案: 顧客ごとのクーポン付与・使用済み管理。
-- MVPでは未使用です。
/*
create table if not exists user_coupons (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  coupon_id uuid not null references coupons(id) on delete cascade,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
*/
