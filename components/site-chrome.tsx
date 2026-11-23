"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { setLanguage, signOut } from "@/lib/actions"
import { officialSiteHref, programPage, programSiteHref } from "@/lib/program-site-url"
import type { Profile } from "@/lib/types"
import { useI18n } from "./i18n-provider"

const gold = "inline-flex h-10 items-center justify-center rounded-full bg-[#b68a3d] px-4 text-sm font-bold text-white"
const navy = "inline-flex h-10 items-center justify-center rounded-full bg-[#0e1c33] px-4 text-sm font-bold text-white"

export function SiteHeader({ profile }: { profile: Profile | null }) {
  const { t, lang } = useI18n()
  const path = usePathname()
  const role = profile?.role
  const roleLabel = !profile ? t("visitor") : role === "buyer" ? t("buyer") : role === "seller" ? t("seller") : role === "admin" ? t("admin") : t("visitor")

  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > last && y > 48)
      last = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const section =
    role === "buyer"
      ? [
          ["/market", t("market")],
          ["/market/cart", t("cart")],
          ["/market/orders", t("orders")],
        ]
      : role === "seller"
        ? [
            ["/market", t("market")],
            ["/market/sell", t("myProducts")],
            ["/market/sell/orders", t("incoming")],
            ["/market/sell/sales", t("sales")],
          ]
        : role === "admin"
          ? [
              ["/market/admin", t("adminHome")],
              ["/market/admin/buyers", t("buyerQueue")],
              ["/market/admin/sellers", t("sellerQueue")],
              ["/market/admin/users", t("users")],
              ["/market/admin/transactions", t("transactions")],
              ["/market/admin/activity", t("activity")],
              ["/market", t("market")],
            ]
          : [["/market", t("market")]]

  return (
    <div className={`sticky top-0 z-40 will-change-transform transition-transform duration-300 ease-out ${hidden ? "pointer-events-none -translate-y-full" : "translate-y-0"}`}>
      <div className="border-b border-white/10 bg-[#3a1d12] text-[#f6e7d4]">
        <div className="mx-auto flex w-[min(1120px,calc(100%-40px))] flex-wrap items-center justify-between gap-3 py-2 text-sm">
          <p className="flex flex-wrap items-center gap-3">
            <span>{t("notice")}</span>
            <a className="border-b border-white/40 font-bold text-white" href={officialSiteHref(lang)} target="_blank" rel="noreferrer">
              {t("official")}
            </a>
          </p>
          <div className="flex items-center gap-2">
            <form action={setLanguage} className="flex gap-2">
              <input type="hidden" name="next" value={path} />
              <button name="lang" value="en" className={`rounded-[10px] border px-3 py-1 text-sm font-bold ${lang === "en" ? "border-white text-white" : "border-[#f6e7d4]/40"}`}>
                English
              </button>
              <button name="lang" value="zh" className={`rounded-[10px] border px-3 py-1 text-sm font-bold ${lang === "zh" ? "border-white text-white" : "border-[#f6e7d4]/40"}`}>
                中文
              </button>
            </form>
          </div>
        </div>
      </div>

      <header className="border-b border-[#e4e0d8]/70 bg-[#fffcf8]/80 backdrop-blur-md">
        <div className="mx-auto flex w-[min(1120px,calc(100%-40px))] flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <a href={programSiteHref(lang)} className="shrink-0">
              <img src="/assets/img/fujen-immba-logo-lockup.jpg" alt="Fu Jen imMBA" className="h-16 w-auto max-w-[220px] object-contain mix-blend-multiply" />
            </a>
            <a href={programSiteHref(lang)} className="min-w-0 text-black">
              <strong className="block truncate text-sm sm:text-base">{t("brand")}</strong>
              <em className="block truncate text-xs font-semibold not-italic sm:text-sm">{t("brandSub")}</em>
            </a>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-end gap-2 sm:max-w-[min(100%,42rem)]">
            <div className="text-right text-sm">
              <div className="font-bold">{profile ? profile.full_name : t("visitor")}</div>
              <div className="text-[#5b6577]">{roleLabel}</div>
            </div>
            {profile ? (
              <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm font-bold">
                {section.map(([href, label]) => {
                  const exact = href === "/market" || href === "/market/admin" || href === "/market/sell"
                  const current = exact ? path === href : path === href || path.startsWith(`${href}/`)
                  return (
                    <Link key={href} href={href} className={current ? "text-[#5a2d82]" : "text-[#0e1c33]"}>
                      {label}
                    </Link>
                  )
                })}
                {role === "seller" ? <Link className={gold} href="/market/sell/new">{t("addProduct")}</Link> : null}
                <form action={signOut}><button className={navy}>{t("signOut")}</button></form>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link className={gold} href="/market/signup?kind=buyer">{t("startBuying")}</Link>
                <Link className={navy} href="/market/signup?kind=seller">{t("beSeller")}</Link>
                <Link className="inline-flex h-10 items-center text-sm font-bold underline" href="/market/login">{t("signIn")}</Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}

export function SiteFooter() {
  const { t, lang } = useI18n()
  return (
    <footer className="bg-[#0e1c33] text-white/80">
      <div className="mx-auto grid w-[min(1120px,calc(100%-40px))] gap-8 py-10 sm:grid-cols-3">
        <div>
          <a href={programPage("index.html", lang)}>
            <img src="/assets/img/fujen-immba-logo-mark.jpg" alt="Fu Jen imMBA" className="mb-3 h-14 w-14 rounded-lg object-cover" />
          </a>
          <h2 className="font-display text-3xl text-white">Fu Jen imMBA</h2>
          <p className="mt-2">{t("footerBlurb")}</p>
        </div>
        <div>
          <h2 className="font-display text-3xl text-white">{t("footerVisit")}</h2>
          <p className="mt-2">{t("footerPlace")}</p>
        </div>
        <div>
          <h2 className="font-display text-3xl text-white">{t("footerContact")}</h2>
          <p className="mt-2">{lang === "zh" ? "張小姐" : "Ms. Chang"}<br />+886-2-2905-2750<br /><a className="underline" href="mailto:imMBA@mail.fju.edu.tw">imMBA@mail.fju.edu.tw</a></p>
          <p className="mt-3"><Link className="underline" href="/market/login">{t("signIn")}</Link></p>
        </div>
      </div>
      <div className="mx-auto w-[min(1120px,calc(100%-40px))] border-t border-white/10 py-4 text-sm">
        <p>© 2026 {t("footerDemo")}</p>
        <p className="mt-1">
          <a className="underline" href={officialSiteHref(lang)} target="_blank" rel="noreferrer">{t("official")}</a>
        </p>
      </div>
    </footer>
  )
}
