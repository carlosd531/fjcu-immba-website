import { NextResponse } from "next/server"
import { getProfile } from "@/lib/auth"
import { csvResponse } from "@/lib/csv"
import { getLang } from "@/lib/lang"
import { loadCompletedOrders } from "@/lib/orders"
import { isMarketAdmin } from "@/lib/roles"
import { adminSalesRows } from "@/lib/sales-report"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const profile = await getProfile()
  if (!profile || !isMarketAdmin(profile)) {
    return NextResponse.redirect(new URL("/market/login", request.url))
  }
  const [lang, orders, supabase] = await Promise.all([getLang(), loadCompletedOrders(), createClient()])
  const ids = [...new Set(orders.flatMap((order) => [order.buyer_id, order.seller_id]).filter((id): id is string => Boolean(id)))]
  const { data: people } = ids.length ? await supabase.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] }
  const names = new Map((people || []).map((person) => [person.id, person]))
  return csvResponse("completed-sales.csv", adminSalesRows(orders, names, lang))
}
