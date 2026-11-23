import { platformFee } from "@/lib/fees"
import { itemsTotal, orderTotal } from "@/lib/orders"
import type { Lang, Order } from "@/lib/types"

function dateOnly(value: string | null | undefined) {
  if (!value) return ""
  const stamp = Date.parse(value)
  if (Number.isNaN(stamp)) return value
  return new Date(stamp).toISOString().slice(0, 10)
}

function itemsLine(order: Order, lang: Lang) {
  return (order.order_items || [])
    .map((item) => {
      const title = lang === "zh" ? item.title_zh || item.title_en : item.title_en
      return `${item.quantity} x ${title} (NT$${item.unit_price})`
    })
    .join(" | ")
}

function statusLabel(status: string, lang: Lang) {
  if (lang === "zh") {
    if (status === "placed") return "已下單待付款"
    if (status === "paid") return "已付款"
    if (status === "shipped") return "已出貨"
    if (status === "completed") return "已完成"
    if (status === "cancelled") return "已取消"
  }
  if (status === "placed") return "placed - waiting payment"
  return status
}

export function saleFee(order: Order) {
  if (order.status === "cancelled") return 0
  return platformFee(itemsTotal(order))
}

export function feeEarned(order: Order) {
  return order.status === "completed" ? saleFee(order) : 0
}

function isCompletedPurchase(order: Order) {
  return String(order.status || "").trim().toLowerCase() === "completed"
}

function paidCompleted(orders: Order[]) {
  return orders.filter(isCompletedPurchase)
}

export function adminSalesRows(
  orders: Order[],
  people: Map<string, { full_name: string; email: string | null }>,
  lang: Lang,
) {
  const sorted = paidCompleted(orders).sort((a, b) => {
    const sellerA = people.get(a.seller_id)?.full_name || ""
    const sellerB = people.get(b.seller_id)?.full_name || ""
    if (sellerA !== sellerB) return sellerA.localeCompare(sellerB)
    return Date.parse(b.completed_at || b.created_at) - Date.parse(a.completed_at || a.created_at)
  })

  const header =
    lang === "zh"
      ? ["賣家", "賣家信箱", "買家", "買家信箱", "訂單編號", "狀態", "完成日期", "取貨方式", "商品", "商品金額 NT$", "平台手續費 4% NT$ (已入帳)", "運費 NT$", "買家實付 NT$"]
      : ["Seller", "Seller email", "Buyer", "Buyer email", "Order ID", "Status", "Completed date", "Fulfillment", "Items", "Item total NT$", "Service fee earned 4% NT$", "Delivery NT$", "Buyer paid NT$"]

  const rows: Array<Array<string | number>> = [header]
  if (sorted.length === 0) {
    rows.push([lang === "zh" ? "目前沒有已完成且已付款的銷售。" : "No completed paid sales yet."])
    return rows
  }

  for (const order of sorted) {
    const itemTotal = itemsTotal(order)
    const seller = people.get(order.seller_id)
    const buyer = people.get(order.buyer_id)
    rows.push([
      seller?.full_name || "",
      seller?.email || "",
      buyer?.full_name || order.buyer_name,
      buyer?.email || "",
      order.id,
      statusLabel(order.status, lang),
      dateOnly(order.completed_at || order.created_at),
      order.fulfillment,
      itemsLine(order, lang),
      itemTotal,
      saleFee(order),
      order.delivery_fee || 0,
      orderTotal(order),
    ])
  }

  rows.push([])
  rows.push(lang === "zh" ? ["賣家小計"] : ["Totals by seller"])
  rows.push(
    lang === "zh"
      ? ["賣家", "完成筆數", "商品金額 NT$", "平台手續費已入帳 NT$"]
      : ["Seller", "Completed sales", "Item total NT$", "Service fee earned NT$"],
  )

  const bySeller = new Map<string, { sales: number; items: number; earned: number }>()
  for (const order of sorted) {
    const name = people.get(order.seller_id)?.full_name || "—"
    const current = bySeller.get(name) || { sales: 0, items: 0, earned: 0 }
    current.sales += 1
    current.items += itemsTotal(order)
    current.earned += saleFee(order)
    bySeller.set(name, current)
  }
  let sales = 0
  let items = 0
  let earned = 0
  for (const [name, total] of [...bySeller.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    rows.push([name, total.sales, total.items, total.earned])
    sales += total.sales
    items += total.items
    earned += total.earned
  }
  rows.push([])
  rows.push(lang === "zh" ? ["全部合計", sales, items, earned] : ["Grand total", sales, items, earned])
  rows.push([
    lang === "zh"
      ? "僅列出已完成且已付款的銷售。平台手續費 = 商品金額的 4%。"
      : "This report includes only completed paid sales. Service fee earned = 4% of the item total.",
  ])
  return rows
}

export function sellerSalesRows(orders: Order[], lang: Lang) {
  const sorted = paidCompleted(orders).sort((a, b) => Date.parse(b.completed_at || b.created_at) - Date.parse(a.completed_at || a.created_at))
  const header =
    lang === "zh"
      ? ["訂單編號", "完成日期", "買家", "取貨方式", "商品", "商品金額 NT$", "平台手續費 4% NT$ (已入帳)", "運費 NT$", "買家實付 NT$"]
      : ["Order ID", "Completed date", "Buyer", "Fulfillment", "Items", "Item total NT$", "Service fee earned 4% NT$", "Delivery NT$", "Buyer paid NT$"]
  const rows: Array<Array<string | number>> = [header]
  if (sorted.length === 0) {
    rows.push([lang === "zh" ? "目前沒有已完成且已付款的銷售。" : "No completed paid sales yet."])
    return rows
  }
  let earned = 0
  for (const order of sorted) {
    const itemTotal = itemsTotal(order)
    const fee = saleFee(order)
    earned += fee
    rows.push([
      order.id,
      dateOnly(order.completed_at || order.created_at),
      order.buyer_name,
      order.fulfillment,
      itemsLine(order, lang),
      itemTotal,
      fee,
      order.delivery_fee || 0,
      orderTotal(order),
    ])
  }
  rows.push([])
  rows.push(lang === "zh" ? ["已入帳手續費合計 NT$", earned] : ["Service fee earned total NT$", earned])
  return rows
}

export function buyerPurchaseRows(orders: Order[], lang: Lang) {
  const sorted = [...orders].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  const header =
    lang === "zh"
      ? ["訂單編號", "狀態", "下單日期", "賣家", "取貨方式", "商品", "商品金額 NT$", "平台手續費 4% NT$", "運費 NT$", "實付 NT$"]
      : ["Order ID", "Status", "Sale date", "Seller", "Fulfillment", "Items", "Item total NT$", "Service fee 4% NT$", "Delivery NT$", "You paid NT$"]
  const rows: Array<Array<string | number>> = [header]
  for (const order of sorted) {
    const itemTotal = itemsTotal(order)
    rows.push([
      order.id,
      statusLabel(order.status, lang),
      dateOnly(order.created_at),
      order.seller_name || "",
      order.fulfillment,
      itemsLine(order, lang),
      itemTotal,
      saleFee(order),
      order.delivery_fee || 0,
      orderTotal(order),
    ])
  }
  return rows
}
