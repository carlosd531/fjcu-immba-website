update public.products set stock = 0 where stock < 0;
update public.products set stock = 10 where stock > 10;
update public.cart_items set quantity = 10 where quantity > 10;
delete from public.cart_items where quantity < 1;

alter table public.products drop constraint if exists products_stock_check;
alter table public.products add constraint products_stock_check check (stock >= 0 and stock <= 10);

alter table public.cart_items drop constraint if exists cart_items_quantity_check;
alter table public.cart_items add constraint cart_items_quantity_check check (quantity > 0 and quantity <= 10);

create or replace function private.products_clamp_numbers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stock is null or new.stock < 0 then
    new.stock := 0;
  end if;
  if new.stock > 10 then
    new.stock := 10;
  end if;
  if new.price is null or new.price < 0 then
    new.price := 0;
  end if;
  return new;
end;
$$;

drop trigger if exists products_clamp_numbers on public.products;
create trigger products_clamp_numbers
  before insert or update on public.products
  for each row execute function private.products_clamp_numbers();
