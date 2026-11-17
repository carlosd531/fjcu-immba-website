alter table public.orders disable trigger orders_guard;
alter table public.orders add column if not exists buyer_name text not null default '';
update public.orders o set buyer_name = p.full_name from public.profiles p where p.id = o.buyer_id and o.buyer_name = '';
alter table public.orders enable trigger orders_guard;

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
