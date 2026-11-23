"use client"

import type { ReactNode } from "react"
import type { Profile } from "@/lib/types"
import { SiteFooter, SiteHeader } from "./site-chrome"

export function MarketFrame({ profile, children }: { profile: Profile | null; children: ReactNode }) {
  return (
    <>
      <div aria-hidden className="market-logo-pattern" />
      <SiteHeader profile={profile} />
      <main className="relative mx-auto w-[min(1120px,calc(100%-40px))] py-8">{children}</main>
      <SiteFooter />
    </>
  )
}
