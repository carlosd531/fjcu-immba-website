-- imMBA Market schema. Roles live on profiles, never in user_metadata.

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'pending' check (role in ('pending', 'buyer', 'seller', 'admin')),
  requested_role text check (requested_role in ('buyer', 'seller')),
  request_status text not null default 'pending' check (request_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id),
  seller_name text not null,
  title_en text not null,
  title_zh text not null,
  description_en text not null default '',
  description_zh text not null default '',
  category text not null check (category in ('books', 'electronics', 'home')),
  condition text not null check (condition in ('new', 'good', 'fair')),
  price integer not null check (price >= 0),
  stock integer not null check (stock >= 0),
  created_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0
);

create table public.cart_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id),
  seller_id uuid not null references public.profiles (id),
  status text not null check (status in ('placed', 'paid', 'shipped', 'cancelled')),
  buyer_name text not null default '',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  title_en text not null,
  title_zh text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  type text not null check (type in (
    'buyer_requested', 'seller_requested',
    'buyer_approved', 'buyer_rejected',
    'seller_approved', 'seller_rejected',
    'product_created', 'product_updated', 'stock_changed',
    'order_placed', 'order_cancelled', 'payment_confirmed', 'order_shipped'
  )),
  created_at timestamptz not null default now()
);

create index products_seller_idx on public.products (seller_id);
create index products_category_idx on public.products (category);
create index orders_buyer_idx on public.orders (buyer_id);
create index orders_seller_idx on public.orders (seller_id);
create index orders_status_idx on public.orders (status);
create index activities_created_idx on public.activities (created_at desc);
create index product_images_product_idx on public.product_images (product_id, sort_order);

alter table public.profiles enable row level security;
alter table public.seller_applications enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.activities enable row level security;

create or replace function private.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function private.market_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'listings', (select count(*) from public.products),
    'sellers', (select count(distinct seller_id) from public.products),
    'open_orders', (select count(*) from public.orders where status in ('placed', 'paid'))
  )
$$;

create or replace function public.market_stats()
returns json
language sql
stable
security invoker
set search_path = public, private
as $$
  select private.market_stats()
$$;

revoke all on function public.market_stats() from public;
grant execute on function public.market_stats() to anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, request_status)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    'pending',
    'pending'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and private.current_role() is distinct from 'admin' then
    if new.role is distinct from old.role then
      raise exception 'role change not allowed';
    end if;
    if old.requested_role is not null and new.requested_role is distinct from old.requested_role then
      raise exception 'request already filed';
    end if;
    if new.requested_role is not null and new.requested_role not in ('buyer', 'seller') then
      raise exception 'invalid request';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_profile
  before update on public.profiles
  for each row execute function private.protect_profile();

create or replace function private.stamp_seller_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select full_name into new.seller_name from public.profiles where id = new.seller_id;
  if tg_op = 'INSERT' then
    if auth.uid() is not null and (private.current_role() is distinct from 'seller' or new.seller_id is distinct from auth.uid()) then
      raise exception 'sellers only';
    end if;
    insert into public.activities (actor_id, type) values (new.seller_id, 'product_created');
  elsif tg_op = 'UPDATE' then
    new.seller_id := old.seller_id;
    new.seller_name := old.seller_name;
    new.created_at := old.created_at;
    if auth.uid() is not null and private.current_role() is distinct from 'seller' then
      if new.title_en is distinct from old.title_en
        or new.title_zh is distinct from old.title_zh
        or new.description_en is distinct from old.description_en
        or new.description_zh is distinct from old.description_zh
        or new.price is distinct from old.price
        or new.category is distinct from old.category
        or new.condition is distinct from old.condition then
        raise exception 'sellers only';
      end if;
    elsif auth.uid() is not null and old.seller_id is distinct from auth.uid() then
      raise exception 'sellers only';
    end if;
    if new.stock is distinct from old.stock and private.current_role() = 'seller' then
      insert into public.activities (actor_id, type) values (auth.uid(), 'stock_changed');
    end if;
    if new.title_en is distinct from old.title_en
      or new.title_zh is distinct from old.title_zh
      or new.description_en is distinct from old.description_en
      or new.description_zh is distinct from old.description_zh
      or new.price is distinct from old.price
      or new.category is distinct from old.category
      or new.condition is distinct from old.condition then
      insert into public.activities (actor_id, type) values (coalesce(auth.uid(), new.seller_id), 'product_updated');
    end if;
  end if;
  return new;
end;
$$;

create trigger products_guard
  before insert or update on public.products
  for each row execute function private.stamp_seller_name();

create or replace function private.limit_product_images()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
begin
  select seller_id into owner from public.products where id = new.product_id;
  if auth.uid() is not null and (private.current_role() is distinct from 'seller' or owner is distinct from auth.uid()) then
    raise exception 'not your product';
  end if;
  if tg_op = 'INSERT' and (select count(*) from public.product_images where product_id = new.product_id) >= 6 then
    raise exception 'too many photos';
  end if;
  return new;
end;
$$;

create trigger product_images_guard
  before insert or update on public.product_images
  for each row execute function private.limit_product_images();

create or replace function private.orders_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'placed' and new.status = 'cancelled' then
    if private.current_role() is distinct from 'buyer' or old.buyer_id is distinct from auth.uid() then
      raise exception 'cannot cancel';
    end if;
    update public.products p
    set stock = p.stock + oi.quantity
    from public.order_items oi
    where oi.order_id = old.id and oi.product_id = p.id;
    insert into public.activities (actor_id, type) values (auth.uid(), 'order_cancelled');
  elsif old.status = 'placed' and new.status = 'paid' then
    if private.current_role() is distinct from 'seller' or old.seller_id is distinct from auth.uid() then
      raise exception 'cannot confirm payment';
    end if;
    new.paid_at := now();
    insert into public.activities (actor_id, type) values (auth.uid(), 'payment_confirmed');
  elsif old.status = 'paid' and new.status = 'shipped' then
    if private.current_role() is distinct from 'seller' or old.seller_id is distinct from auth.uid() then
      raise exception 'cannot ship';
    end if;
    new.shipped_at := now();
    insert into public.activities (actor_id, type) values (auth.uid(), 'order_shipped');
  else
    raise exception 'invalid transition';
  end if;
  new.buyer_id := old.buyer_id;
  new.seller_id := old.seller_id;
  new.buyer_name := old.buyer_name;
  new.created_at := old.created_at;
  if new.status <> 'shipped' then
    new.shipped_at := old.shipped_at;
  end if;
  if new.status not in ('paid', 'shipped') then
    new.paid_at := old.paid_at;
  end if;
  return new;
end;
$$;

create trigger orders_guard
  before update on public.orders
  for each row execute function private.orders_before_update();

create or replace function private.file_signup_request(kind text, note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if kind not in ('buyer', 'seller') then
    raise exception 'invalid request';
  end if;
  update public.profiles
  set requested_role = kind,
      request_status = 'pending'
  where id = auth.uid()
    and role = 'pending'
    and requested_role is null;
  if not found then
    raise exception 'request already filed';
  end if;
  if kind = 'seller' then
    insert into public.seller_applications (user_id, note, status)
    values (auth.uid(), nullif(note, ''), 'pending');
  end if;
  insert into public.activities (actor_id, type)
  values (auth.uid(), case when kind = 'buyer' then 'buyer_requested' else 'seller_requested' end);
end;
$$;

create or replace function public.file_signup_request(kind text, note text)
returns void
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  perform private.file_signup_request(kind, note);
end;
$$;

revoke all on function public.file_signup_request(text, text) from public;
grant execute on function public.file_signup_request(text, text) to authenticated;

create or replace function private.review_buyer(target uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.current_role() is distinct from 'admin' then
    raise exception 'admins only';
  end if;
  if approve then
    update public.profiles
    set role = 'buyer', request_status = 'approved'
    where id = target
      and role = 'pending'
      and requested_role = 'buyer'
      and request_status = 'pending';
    if not found then
      raise exception 'buyer request not pending';
    end if;
    insert into public.activities (actor_id, type) values (auth.uid(), 'buyer_approved');
  else
    update public.profiles
    set request_status = 'rejected'
    where id = target
      and role = 'pending'
      and requested_role = 'buyer'
      and request_status = 'pending';
    if not found then
      raise exception 'buyer request not pending';
    end if;
    insert into public.activities (actor_id, type) values (auth.uid(), 'buyer_rejected');
  end if;
end;
$$;

create or replace function public.review_buyer(target uuid, approve boolean)
returns void
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  perform private.review_buyer(target, approve);
end;
$$;

revoke all on function public.review_buyer(uuid, boolean) from public;
grant execute on function public.review_buyer(uuid, boolean) to authenticated;

create or replace function private.review_seller(target uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
begin
  if private.current_role() is distinct from 'admin' then
    raise exception 'admins only';
  end if;
  select role into current_role from public.profiles where id = target;
  if approve then
    update public.seller_applications
    set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    where user_id = target and status = 'pending';
    if not found then
      raise exception 'seller request not pending';
    end if;
    update public.profiles
    set role = 'seller', request_status = 'approved'
    where id = target and role in ('pending', 'buyer');
    insert into public.activities (actor_id, type) values (auth.uid(), 'seller_approved');
  else
    update public.seller_applications
    set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
    where user_id = target and status = 'pending';
    if not found then
      raise exception 'seller request not pending';
    end if;
    if current_role = 'pending' then
      update public.profiles set request_status = 'rejected' where id = target;
    end if;
    insert into public.activities (actor_id, type) values (auth.uid(), 'seller_rejected');
  end if;
end;
$$;

create or replace function public.review_seller(target uuid, approve boolean)
returns void
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  perform private.review_seller(target, approve);
end;
$$;

revoke all on function public.review_seller(uuid, boolean) from public;
grant execute on function public.review_seller(uuid, boolean) to authenticated;

create or replace function private.place_orders(payload jsonb)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  pid uuid;
  qty int;
  seller uuid;
  oid uuid;
  result uuid[] := '{}';
begin
  if private.current_role() is distinct from 'buyer' then
    raise exception 'buyers only';
  end if;
  if jsonb_typeof(payload) is distinct from 'array' or jsonb_array_length(payload) = 0 then
    raise exception 'empty cart';
  end if;

  create temp table tmp_lines (
    product_id uuid primary key,
    quantity int not null check (quantity > 0)
  ) on commit drop;

  for item in select value from jsonb_array_elements(payload)
  loop
    pid := (item->>'product_id')::uuid;
    qty := (item->>'quantity')::int;
    if qty is null or qty < 1 then
      raise exception 'bad quantity';
    end if;
    insert into tmp_lines (product_id, quantity)
    values (pid, qty)
    on conflict (product_id) do update
      set quantity = tmp_lines.quantity + excluded.quantity;
  end loop;

  perform 1
  from public.products p
  join tmp_lines t on t.product_id = p.id
  order by p.id
  for update of p;

  if (select count(*) from tmp_lines t join public.products p on p.id = t.product_id)
     <> (select count(*) from tmp_lines) then
    raise exception 'missing product';
  end if;

  if exists (
    select 1 from tmp_lines t
    join public.products p on p.id = t.product_id
    where p.stock < t.quantity
  ) then
    raise exception 'out of stock';
  end if;

  for seller in
    select distinct p.seller_id
    from tmp_lines t
    join public.products p on p.id = t.product_id
    order by 1
  loop
    insert into public.orders (buyer_id, seller_id, status, buyer_name)
    values (
      auth.uid(),
      seller,
      'placed',
      (select full_name from public.profiles where id = auth.uid())
    )
    returning id into oid;

    insert into public.order_items (order_id, product_id, title_en, title_zh, unit_price, quantity)
    select oid, p.id, p.title_en, p.title_zh, p.price, t.quantity
    from tmp_lines t
    join public.products p on p.id = t.product_id
    where p.seller_id = seller;

    update public.products p
    set stock = p.stock - t.quantity
    from tmp_lines t
    where p.id = t.product_id and p.seller_id = seller;

    result := array_append(result, oid);
  end loop;

  delete from public.cart_items c
  using tmp_lines t
  where c.user_id = auth.uid() and c.product_id = t.product_id;

  insert into public.activities (actor_id, type) values (auth.uid(), 'order_placed');
  return result;
end;
$$;

create or replace function public.place_orders(payload jsonb)
returns uuid[]
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  return private.place_orders(payload);
end;
$$;

revoke all on function public.place_orders(jsonb) from public;
grant execute on function public.place_orders(jsonb) to authenticated;

create or replace function private.cancel_order(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set status = 'cancelled'
  where id = target and buyer_id = auth.uid() and status = 'placed';
  if not found then
    raise exception 'cannot cancel';
  end if;
end;
$$;

create or replace function public.cancel_order(target uuid)
returns void
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  perform private.cancel_order(target);
end;
$$;

revoke all on function public.cancel_order(uuid) from public;
grant execute on function public.cancel_order(uuid) to authenticated;

grant usage on schema private to anon, authenticated, service_role;
grant execute on all functions in schema private to anon, authenticated, service_role;

-- Row policies

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or private.current_role() = 'admin');

create policy products_select on public.products
  for select to anon, authenticated
  using (true);

create policy products_insert on public.products
  for insert to authenticated
  with check (seller_id = auth.uid() and private.current_role() = 'seller');

create policy products_update on public.products
  for update to authenticated
  using (seller_id = auth.uid() and private.current_role() = 'seller')
  with check (seller_id = auth.uid() and private.current_role() = 'seller');

create policy product_images_select on public.product_images
  for select to anon, authenticated
  using (true);

create policy product_images_write on public.product_images
  for all to authenticated
  using (
    private.current_role() = 'seller'
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  )
  with check (
    private.current_role() = 'seller'
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

create policy cart_own on public.cart_items
  for all to authenticated
  using (user_id = auth.uid() and private.current_role() = 'buyer')
  with check (user_id = auth.uid() and private.current_role() = 'buyer');

create policy orders_select on public.orders
  for select to authenticated
  using (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or private.current_role() = 'admin'
  );

create policy orders_buyer_cancel on public.orders
  for update to authenticated
  using (buyer_id = auth.uid() and status = 'placed' and private.current_role() = 'buyer')
  with check (buyer_id = auth.uid() and status = 'cancelled');

create policy orders_seller_progress on public.orders
  for update to authenticated
  using (seller_id = auth.uid() and status in ('placed', 'paid') and private.current_role() = 'seller')
  with check (seller_id = auth.uid() and status in ('paid', 'shipped'));

create policy order_items_select on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          o.buyer_id = auth.uid()
          or o.seller_id = auth.uid()
          or private.current_role() = 'admin'
        )
    )
  );

create policy seller_apps_select on public.seller_applications
  for select to authenticated
  using (user_id = auth.uid() or private.current_role() = 'admin');

create policy activities_admin on public.activities
  for select to authenticated
  using (private.current_role() = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy product_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy product_images_seller_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and private.current_role() = 'seller'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy product_images_seller_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and private.current_role() = 'seller'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'product-images'
    and private.current_role() = 'seller'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy product_images_seller_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and private.current_role() = 'seller'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
