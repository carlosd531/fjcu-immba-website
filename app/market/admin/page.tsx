import Link from "next/link"
import { requireAdmin } from "@/lib/guard"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function AdminHome() {
  await requireAdmin()
  const [lang, supabase] = await Promise.all([getLang(), createClient()])
  const [buyers, sellers, orders, users, activity] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("requested_role", "buyer").eq("request_status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("requested_role", "seller").eq("request_status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["placed", "paid"]),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("activities").select("id", { count: "exact", head: true }),
  ])
  const cards = [
    [buyers.count || 0, "buyerQueue", "/market/admin/buyers"],
    [sellers.count || 0, "sellerQueue", "/market/admin/sellers"],
    [orders.count || 0, "transactions", "/market/admin/transactions"],
    [users.count || 0, "users", "/market/admin/users"],
    [activity.count || 0, "activity", "/market/admin/activity"],
  ] as const
  return (
    <div>
      <p className="text-sm font-bold tracking-wide text-[#b68a3d] uppercase">{t(lang, "sectionLabel")}</p>
      <h1 className="mt-2 font-display text-5xl">{t(lang, "adminHome")}</h1>
      <p className="mt-3 max-w-2xl text-[#5b6577]">{t(lang, "monitorNote")}</p>
      <a href="/market/admin/transactions/export" className="mt-4 inline-flex h-11 items-center rounded-full bg-[#0e1c33] px-5 font-bold text-white">{t(lang, "exportSalesReport")}</a>
      <p className="mt-2 max-w-2xl text-sm text-[#5b6577]">{t(lang, "exportSalesNote")}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map(([count, key, href]) => (
          <Link key={href} href={href} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-5 shadow-[0_18px_50px_rgba(14,28,51,0.08)]">
            <b className="block text-4xl font-bold tabular-nums">{count}</b>
            <span>{t(lang, key)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
