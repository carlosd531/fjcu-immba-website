import { createClient } from "@/lib/supabase/server"
import type { Order } from "@/lib/types"

const select = "*, order_items(id, title_en, title_zh, unit_price, quantity, product_id)"

export async function loadOrders(column: "buyer_id" | "seller_id", id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("orders").select(select).eq(column, id).order("created_at", { ascending: false })
  return (data || []) as Order[]
}

export async function loadAllOrders() {
  const supabase = await createClient()
  const { data } = await supabase.from("orders").select(select).order("created_at", { ascending: false })
  return (data || []) as Order[]
}

export async function loadCompletedOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select(select)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
  return (data || []) as Order[]
}

export async function loadOrder(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("orders").select(select).eq("id", id).maybeSingle()
  return data as Order | null
}

export function itemsTotal(order: Order) {
  return (order.order_items || []).reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
}

export function orderTotal(order: Order) {
  return itemsTotal(order) + (order.service_fee || 0) + (order.delivery_fee || 0)
}
