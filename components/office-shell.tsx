"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { signOut } from "@/lib/actions"
import type { Profile } from "@/lib/types"
import { useI18n } from "./i18n-provider"

const modules = [
  ["/admin-alumni.html", "officeAlumni"],
  ["/admin-news.html", "officeNews"],
  ["/admin-faculty.html", "officeFaculty"],
  ["/admin-users.html", "officeAdmins"],
] as const

const market = [
  ["/market/admin", "adminHome"],
  ["/market/admin/buyers", "buyerQueue"],
  ["/market/admin/sellers", "sellerQueue"],
  ["/market/admin/users", "users"],
  ["/market/admin/orders", "transactions"],
  ["/market/admin/activity", "activity"],
] as const

export function OfficeShell({ profile, children }: { profile: Profile; children: ReactNode }) {
  const { t } = useI18n()
  const path = usePathname()
  const itemClass = (href: string, exact = false) => {
    const current = exact ? path === href : path === href || path.startsWith(`${href}/`)
    return `rounded-[10px] px-3 py-2 ${current ? "bg-[#b68a3d] text-[#0e1c33]" : "bg-white/10 text-white"}`
  }
  return (
    <div className="grid min-h-screen bg-[#e7ebe4] md:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="bg-[#0e1c33] px-5 py-7 text-[#f6f3ed]">
        <p className="text-xs font-bold tracking-[0.14em] text-[#b68a3d] uppercase">{t("sectionLabel")}</p>
        <h1 className="font-display text-4xl text-white">{t("adminHome")}</h1>
        <p className="mt-2 text-sm text-[#f6e7d4]/80">{t("officeLead")}</p>
        <p className="mt-3 text-sm">{profile.email}</p>
        <nav className="mt-7 flex flex-col gap-2 text-sm font-bold" aria-label={t("sectionLabel")}>
          {modules.map(([href, key]) => (
            <a key={href} className="rounded-[10px] bg-white/10 px-3 py-2 text-white" href={href}>{t(key)}</a>
          ))}
          {market.map(([href, key]) => (
            <Link key={href} className={itemClass(href, href === "/market/admin")} href={href}>{t(key)}</Link>
          ))}
          <a className="rounded-[10px] bg-white/10 px-3 py-2 text-white" href="/index.html">{t("officeHome")}</a>
          <form action={signOut}>
            <button className="w-full rounded-[10px] border border-white/30 px-3 py-2 text-left text-white">{t("signOut")}</button>
          </form>
        </nav>
      </aside>
      <div className="px-5 py-6 sm:px-7">{children}</div>
    </div>
  )
}
