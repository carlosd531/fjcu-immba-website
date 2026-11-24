alter table public.orders alter column buyer_id drop not null;
alter table public.orders alter column seller_id drop not null;

alter table public.orders drop constraint if exists orders_buyer_id_fkey;
alter table public.orders drop constraint if exists orders_seller_id_fkey;
alter table public.orders
  add constraint orders_buyer_id_fkey
  foreign key (buyer_id) references public.profiles (id) on delete set null;
alter table public.orders
  add constraint orders_seller_id_fkey
  foreign key (seller_id) references public.profiles (id) on delete set null;

alter table public.products drop constraint if exists products_seller_id_fkey;
alter table public.products
  add constraint products_seller_id_fkey
  foreign key (seller_id) references public.profiles (id) on delete cascade;

alter table public.activities drop constraint if exists activities_actor_id_fkey;
alter table public.activities
  add constraint activities_actor_id_fkey
  foreign key (actor_id) references public.profiles (id) on delete set null;

alter table public.seller_applications drop constraint if exists seller_applications_reviewed_by_fkey;
alter table public.seller_applications
  add constraint seller_applications_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles (id) on delete set null;

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and private.current_role() = 'admin');

alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in (
    'buyer_requested', 'seller_requested',
    'buyer_approved', 'buyer_rejected',
    'seller_approved', 'seller_rejected',
    'product_created', 'product_updated', 'stock_changed',
    'order_placed', 'order_cancelled', 'payment_confirmed', 'order_shipped', 'order_completed',
    'user_deleted'
  ));

create or replace function private.delete_market_user(target uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  victim text;
begin
  if private.current_role() is distinct from 'admin' then
    raise exception 'admins only';
  end if;
  if target is not distinct from auth.uid() then
    raise exception 'cannot delete self';
  end if;
  select role into victim from public.profiles where id = target;
  if victim is null then
    raise exception 'not found';
  end if;
  if victim = 'admin' then
    raise exception 'cannot delete admin';
  end if;

  insert into public.activities (actor_id, type) values (auth.uid(), 'user_deleted');
  begin
    alter table public.orders disable trigger orders_guard;
    delete from auth.users where id = target;
    alter table public.orders enable trigger orders_guard;
  exception
    when others then
      alter table public.orders enable trigger orders_guard;
      raise;
  end;
end;
$$;

create or replace function public.delete_market_user(target uuid)
returns void
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  perform private.delete_market_user(target);
end;
$$;

revoke all on function public.delete_market_user(uuid) from public;
grant execute on function public.delete_market_user(uuid) to authenticated;
