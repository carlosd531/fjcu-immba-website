alter table public.products drop constraint if exists products_category_check;

update public.products set category = 'school' where category = 'books';
update public.products set category = 'personal_use' where category = 'electronics';
update public.products set category = 'others' where category not in ('school', 'home', 'personal_use', 'others');

alter table public.products add constraint products_category_check
  check (category in ('school', 'home', 'personal_use', 'others'));

alter table public.order_items drop constraint if exists order_items_product_id_fkey;
alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references public.products (id) on delete set null;

drop policy if exists products_delete on public.products;
create policy products_delete on public.products
  for delete to authenticated
  using (seller_id = auth.uid() and private.current_role() = 'seller');

drop policy if exists cart_own on public.cart_items;
create policy cart_own on public.cart_items
  for all to authenticated
  using (user_id = auth.uid() and private.current_role() in ('buyer', 'seller'))
  with check (user_id = auth.uid() and private.current_role() in ('buyer', 'seller'));

create or replace function private.place_orders(payload jsonb, fulfillment text, p_key uuid default null)
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
  delivery_fee int := 0;
  service_fee int := 0;
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
    select coalesce((round(sum(p.price::numeric * t.quantity) * 0.04))::int, 0)
    into service_fee
    from tmp_lines t
    join public.products p on p.id = t.product_id
    where p.seller_id = seller;

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

alter table public.orders disable trigger orders_guard;
update public.orders o
set service_fee = (
  select coalesce((round(sum(unit_price::numeric * quantity) * 0.04))::int, 0)
  from public.order_items oi
  where oi.order_id = o.id
);
alter table public.orders enable trigger orders_guard;
