import { NextResponse } from "next/server"
import { getProfile } from "@/lib/auth"
import { csvResponse } from "@/lib/csv"
import { getLang } from "@/lib/lang"
import { loadOrders } from "@/lib/orders"
import { canBuy } from "@/lib/roles"
import { buyerPurchaseRows } from "@/lib/sales-report"

export async function GET(request: Request) {
  const profile = await getProfile()
  if (!profile || !canBuy(profile)) {
    return NextResponse.redirect(new URL("/market/login", request.url))
  }
  const [lang, orders] = await Promise.all([getLang(), loadOrders("buyer_id", profile.id)])
  return csvResponse("purchases.csv", buyerPurchaseRows(orders, lang))
}
