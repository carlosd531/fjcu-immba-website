import { NextResponse } from "next/server"
import { getProfile } from "@/lib/auth"
import { loadOrders, orderTotal } from "@/lib/orders"

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`
}

export async function GET(request: Request) {
  const profile = await getProfile()
  if (profile?.role !== "seller") {
    return NextResponse.redirect(new URL("/market", request.url))
  }
  const orders = (await loadOrders("seller_id", profile.id)).filter((order) => order.status === "completed")
  const header = ["order_id", "completed_at", "buyer", "fulfillment", "items", "item_total", "service_fee", "delivery_fee", "total"]
  const rows = orders.map((order) => [
    order.id,
    order.completed_at || "",
    order.buyer_name,
    order.fulfillment,
    order.order_items.map((item) => `${item.title_en} x${item.quantity}`).join("; "),
    order.order_items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    order.service_fee || 0,
    order.delivery_fee || 0,
    orderTotal(order),
  ])
  const body = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")
  return new NextResponse(`\uFEFF${body}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sales.csv"',
    },
  })
}
