import { NextResponse } from "next/server"
import { getProfile } from "@/lib/auth"
import { csvResponse } from "@/lib/csv"
import { getLang } from "@/lib/lang"
import { loadCompletedOrders } from "@/lib/orders"
import { sellerSalesRows } from "@/lib/sales-report"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const profile = await getProfile()
  if (profile?.role !== "seller") {
    return NextResponse.redirect(new URL("/market", request.url))
  }
  const [lang, orders] = await Promise.all([getLang(), loadCompletedOrders()])
  return csvResponse("completed-sales.csv", sellerSalesRows(orders.filter((order) => order.seller_id === profile.id), lang))
}
