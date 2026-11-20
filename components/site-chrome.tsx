"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { setLanguage, signOut } from "@/lib/actions"
import { officialSiteHref, programPage, programSiteHref } from "@/lib/program-site-url"
import type { Profile } from "@/lib/types"
import { useI18n } from "./i18n-provider"

const gold = "inline-flex h-10 items-center justify-center rounded-full bg-[#b68a3d] px-4 text-sm font-bold text-white"
const navy = "inline-flex h-10 items-center justify-center rounded-full bg-[#0e1c33] px-4 text-sm font-bold text-white"

export function SiteHeader({ profile }: { profile: Profile | null }) {
  const { t, lang } = useI18n()
  const path = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem("immbaMenuCollapsed")
    if (saved === "1") setCollapsed(true)
    else if (saved === "0") setCollapsed(false)
    else setCollapsed(window.matchMedia("(max-width: 960px)").matches)
  }, [])
  const role = profile?.role
  const plainAccount = path === "/market/login" || path === "/market/signup"
  if (plainAccount) {
    return (
      <div className="border-b border-[#e4e0d8] bg-[#fffcf8]">
        <div className="mx-auto flex w-[min(1120px,calc(100%-40px))] flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-bold tracking-wide text-[#b68a3d] uppercase">{t("sectionLabel")}</p>
            <p className="font-display text-3xl text-[#0e1c33]">{t("loginNotice")}</p>
          </div>
          <form action={setLanguage} className="flex gap-2">
            <input type="hidden" name="next" value={path} />
            <button name="lang" value="en" className={`rounded-[10px] border px-3 py-1 text-sm font-bold ${lang === "en" ? "border-[#0e1c33] text-[#0e1c33]" : "border-[#e4e0d8]"}`}>English</button>
            <button name="lang" value="zh" className={`rounded-[10px] border px-3 py-1 text-sm font-bold ${lang === "zh" ? "border-[#0e1c33] text-[#0e1c33]" : "border-[#e4e0d8]"}`}>中文</button>
          </form>
        </div>
      </div>
    )
  }
  const roleLabel = !profile ? t("visitor") : role === "buyer" ? t("buyer") : role === "seller" ? t("seller") : role === "admin" ? t("admin") : t("visitor")
  const page = (file: string) => programPage(file, lang)

  const about = [
    ["about.html", "navOverview"],
    ...(lang === "zh" ? [["regulations.html", "navRegulations"] as const] : []),
    ["learning-environment.html", "navLearning"],
  ] as const
  const admissions = [
    ["admissions.html", "navApply"],
    ...(lang === "zh" ? [["scholarships.html", "navScholarships"] as const] : []),
  ] as const
  const singles = [
    ["courses.html", "navCourses"],
    ["faculty.html", "navFaculty"],
    ["guide.html", "navGuide"],
    ["graduation.html", "navGraduation"],
    ["dual-degree.html", "navDual"],
    ["exchange.html", "navExchange"],
    ["highlights.html", "navHighlights"],
    ["news.html", "navNews"],
    ["gallery.html", "navGallery"],
  ] as const

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
              ["/market/admin/orders", t("transactions")],
              ["/market/admin/activity", t("activity")],
              ["/market", t("market")],
            ]
          : [["/market", t("market")]]

  return (
    <div className="sticky top-0 z-40">
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
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#f6e7d4]/40 px-3 py-1 font-bold"
              aria-expanded={!collapsed}
              onClick={() => {
                const next = !collapsed
                setCollapsed(next)
                localStorage.setItem("immbaMenuCollapsed", next ? "1" : "0")
              }}
            >
              <span aria-hidden className={`relative block h-0.5 w-[18px] ${collapsed ? "bg-current" : "bg-transparent"}`}>
                <span className={`absolute left-0 block h-0.5 w-[18px] bg-current ${collapsed ? "-top-1.5" : "top-0 rotate-45"}`} />
                <span className={`absolute left-0 block h-0.5 w-[18px] bg-current ${collapsed ? "top-1.5" : "top-0 -rotate-45"}`} />
              </span>
              {collapsed ? t("menu") : t("hideMenu")}
            </button>
          </div>
        </div>
      </div>

      <header className="border-b border-[#e4e0d8] bg-[#f6f3ed]/95 backdrop-blur">
        <div className="mx-auto flex w-[min(1120px,calc(100%-40px))] items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <a href={programSiteHref(lang)} className="shrink-0">
              <img src="/assets/img/fujen-immba-logo-lockup.jpg" alt="Fu Jen imMBA" className="h-16 w-auto max-w-[220px] rounded-lg object-contain mix-blend-multiply" />
            </a>
            <a href={programSiteHref(lang)} className="min-w-0 text-black">
              <strong className="block truncate text-sm sm:text-base">{t("brand")}</strong>
              <em className="block truncate text-xs font-semibold not-italic sm:text-sm">{t("brandSub")}</em>
            </a>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">{profile ? profile.full_name : t("visitor")}</div>
            <div className="text-[#5b6577]">{roleLabel}</div>
          </div>
        </div>
      </header>

      <nav className={`${collapsed ? "hidden" : "block"} border-b border-[#e4e0d8] bg-[#fffcf8]`} aria-label={t("brandSub")}>
        <div className="mx-auto flex w-[min(1120px,calc(100%-40px))] flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm font-bold text-[#0e1c33]">
          <MenuGroup label={t("navAbout")} href={page("about.html")}>
            {about.map(([file, key]) => (
              <a key={file} className="block px-4 py-2 hover:bg-[#f6f3ed]" href={page(file)}>{t(key)}</a>
            ))}
          </MenuGroup>
          <MenuGroup label={t("navAdmissions")} href={page("admissions.html")}>
            {admissions.map(([file, key]) => (
              <a key={file} className="block px-4 py-2 hover:bg-[#f6f3ed]" href={page(file)}>{t(key)}</a>
            ))}
          </MenuGroup>
          {singles.map(([file, key]) => (
            <a key={file} className="py-1.5 hover:text-[#5a2d82]" href={page(file)}>{t(key)}</a>
          ))}
          <Link href="/market" className="relative py-1.5 text-[#5a2d82] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#b68a3d]">
            {t("sectionLabel")}
          </Link>
          <a className="py-1.5 hover:text-[#5a2d82]" href={page("contact.html")}>{t("navContact")}</a>
          <a className={`${gold} ml-auto`} href={page("admissions.html")}>{t("applyNow")}</a>
        </div>
      </nav>

      <div className="border-b border-[#e4e0d8] bg-[#f6f3ed]">
        <div className="mx-auto flex w-[min(1120px,calc(100%-40px))] flex-wrap items-center gap-x-4 gap-y-2 py-2 text-sm font-bold">
          <span className="text-[#b68a3d]">{t("sectionLabel")}</span>
          {section.map(([href, label]) => {
            const exact = href === "/market" || href === "/market/admin" || href === "/market/sell"
            const current = exact ? path === href : path === href || path.startsWith(`${href}/`)
            return (
              <Link key={href} href={href} className={current ? "text-[#5a2d82]" : "text-[#0e1c33]"}>
                {label}
              </Link>
            )
          })}
          <span className="ml-auto flex gap-2">
            {role === "seller" ? <Link className={gold} href="/market/sell/new">{t("addProduct")}</Link> : null}
            {profile ? (
              <form action={signOut}><button className={navy}>{t("signOut")}</button></form>
            ) : (
              <>
                <Link className={gold} href="/market/signup?kind=buyer">{t("startBuying")}</Link>
                <Link className={navy} href="/market/signup?kind=seller">{t("beSeller")}</Link>
                <Link className="inline-flex h-10 items-center text-sm font-bold underline" href="/market/login">{t("signIn")}</Link>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

function MenuGroup({ label, href, children }: { label: string; href: string; children: ReactNode }) {
  return (
    <div className="group relative">
      <a className="inline-flex items-center gap-1 py-1.5 hover:text-[#5a2d82]" href={href}>
        {label}
        <span aria-hidden className="text-[10px]">▼</span>
      </a>
      <div className="z-50 hidden min-w-60 rounded-[14px] border border-[#e4e0d8] bg-[#fffcf8] py-2 shadow-[0_18px_50px_rgba(14,28,51,0.08)] group-hover:block group-focus-within:block md:absolute md:top-full md:left-0">
        {children}
      </div>
    </div>
  )
}

export function SiteFooter() {
  const { t, lang } = useI18n()
  const path = usePathname()
  if (path === "/market/login" || path === "/market/signup") return null
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
        <p>© {new Date().getFullYear()} {t("footerDemo")}</p>
        <p className="mt-1">
          <a className="underline" href={officialSiteHref(lang)} target="_blank" rel="noreferrer">{t("official")}</a>
        </p>
      </div>
    </footer>
  )
}
