"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import type { Profile } from "@/lib/types"
import { SiteFooter, SiteHeader } from "./site-chrome"

export function MarketFrame({ profile, children }: { profile: Profile | null; children: ReactNode }) {
  const path = usePathname()
  if (path.startsWith("/market/admin")) return children
  return (
    <>
      <SiteHeader profile={profile} />
      <main className="mx-auto w-[min(1120px,calc(100%-40px))] py-8">{children}</main>
      <SiteFooter />
    </>
  )
}
