-- Complete the class Marketplace: completed status, hide listings,
-- sellers may also buy, block buying your own listing, checkout idempotency.

alter table public.products
  add column if not exists hidden boolean not null default false;

alter table public.orders
  add column if not exists completed_at timestamptz,
  add column if not exists checkout_key uuid;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('placed', 'paid', 'shipped', 'completed', 'cancelled'));

alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in (
    'buyer_requested', 'seller_requested',
    'buyer_approved', 'buyer_rejected',
    'seller_approved', 'seller_rejected',
    'product_created', 'product_updated', 'stock_changed',
    'order_placed', 'order_cancelled', 'payment_confirmed', 'order_shipped', 'order_completed'
  ));

create unique index if not exists orders_checkout_key_idx
  on public.orders (buyer_id, seller_id, checkout_key)
  where checkout_key is not null;

drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select to anon, authenticated
  using (
    hidden = false
    or seller_id = auth.uid()
    or private.current_role() = 'admin'
  );

drop policy if exists cart_own on public.cart_items;
create policy cart_own on public.cart_items
  for all to authenticated
  using (user_id = auth.uid() and private.current_role() in ('buyer', 'seller'))
  with check (user_id = auth.uid() and private.current_role() in ('buyer', 'seller'));

drop policy if exists orders_buyer_cancel on public.orders;
create policy orders_buyer_cancel on public.orders
  for update to authenticated
  using (buyer_id = auth.uid() and status = 'placed' and private.current_role() in ('buyer', 'seller'))
  with check (buyer_id = auth.uid() and status = 'cancelled');

drop policy if exists orders_seller_progress on public.orders;
create policy orders_seller_progress on public.orders
  for update to authenticated
  using (seller_id = auth.uid() and status in ('placed', 'paid', 'shipped') and private.current_role() = 'seller')
  with check (seller_id = auth.uid() and status in ('paid', 'shipped', 'completed'));

drop policy if exists orders_complete on public.orders;
create policy orders_complete on public.orders
  for update to authenticated
  using (
    status = 'shipped'
    and private.current_role() in ('buyer', 'seller')
    and (buyer_id = auth.uid() or seller_id = auth.uid())
  )
  with check (status = 'completed' and (buyer_id = auth.uid() or seller_id = auth.uid()));

create or replace function private.orders_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'placed' and new.status = 'cancelled' then
    if private.current_role() not in ('buyer', 'seller') or old.buyer_id is distinct from auth.uid() then
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
  elsif old.status = 'shipped' and new.status = 'completed' then
    if auth.uid() is distinct from old.buyer_id and auth.uid() is distinct from old.seller_id then
      raise exception 'cannot complete';
    end if;
    if private.current_role() not in ('buyer', 'seller') then
      raise exception 'cannot complete';
    end if;
    new.completed_at := now();
    insert into public.activities (actor_id, type) values (auth.uid(), 'order_completed');
  else
    raise exception 'invalid transition';
  end if;
  new.buyer_id := old.buyer_id;
  new.seller_id := old.seller_id;
  new.buyer_name := old.buyer_name;
  new.created_at := old.created_at;
  new.fulfillment := old.fulfillment;
  new.service_fee := old.service_fee;
  new.delivery_fee := old.delivery_fee;
  new.checkout_key := old.checkout_key;
  if new.status <> 'shipped' then
    new.shipped_at := old.shipped_at;
  end if;
  if new.status not in ('paid', 'shipped', 'completed') then
    new.paid_at := old.paid_at;
  end if;
  if new.status <> 'completed' then
    new.completed_at := old.completed_at;
  end if;
  return new;
end;
$$;

drop function if exists public.place_orders(jsonb, text);
drop function if exists private.place_orders(jsonb, text);

create function private.place_orders(payload jsonb, fulfillment text, p_key uuid default null)
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
  service_fee int := 40;
  delivery_fee int := 0;
begin
  if private.current_role() not in ('buyer', 'seller') then
    raise exception 'buyers only';
  end if;
  if fulfillment is distinct from 'pickup' and fulfillment is distinct from 'delivery' then
    raise exception 'invalid fulfillment';
  end if;
  if fulfillment = 'delivery' then
    delivery_fee := 50;
  end if;
  if jsonb_typeof(payload) is distinct from 'array' or jsonb_array_length(payload) = 0 then
    raise exception 'empty cart';
  end if;

  if p_key is not null then
    select array_agg(id order by id) into result
    from public.orders
    where buyer_id = auth.uid() and orders.checkout_key = p_key;
    if result is not null then
      return result;
    end if;
    result := '{}';
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

  if (select count(*) from tmp_lines t join public.products p on p.id = t.product_id and p.hidden = false)
     <> (select count(*) from tmp_lines) then
    raise exception 'missing product';
  end if;

  if exists (
    select 1 from tmp_lines t
    join public.products p on p.id = t.product_id
    where p.seller_id = auth.uid()
  ) then
    raise exception 'own listing';
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
    insert into public.orders (buyer_id, seller_id, status, buyer_name, fulfillment, service_fee, delivery_fee, checkout_key)
    values (
      auth.uid(),
      seller,
      'placed',
      (select full_name from public.profiles where id = auth.uid()),
      fulfillment,
      service_fee,
      delivery_fee,
      p_key
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

create function public.place_orders(payload jsonb, fulfillment text default 'pickup', checkout_key uuid default null)
returns uuid[]
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  return private.place_orders(payload, fulfillment, checkout_key);
end;
$$;

revoke all on function public.place_orders(jsonb, text, uuid) from public;
grant execute on function public.place_orders(jsonb, text, uuid) to authenticated;
