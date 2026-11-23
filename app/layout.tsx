import type { Metadata } from "next"
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google"
import { MarketFrame } from "@/components/market-frame"
import { I18nProvider } from "@/components/i18n-provider"
import { getProfile } from "@/lib/auth"
import { getLang } from "@/lib/lang"
import "./globals.css"

const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source" })
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "Student market | Fu Jen imMBA",
  description: "The student market section of the Fu Jen imMBA site. An administrator approves buyers and sellers.",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, profile] = await Promise.all([getLang(), getProfile()])
  return (
    <html lang={lang === "zh" ? "zh-Hant" : "en"} className={`${sans.variable} ${serif.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="market-shell min-h-full text-[#1c2434] antialiased">
        <I18nProvider lang={lang}>
          <MarketFrame profile={profile}>{children}</MarketFrame>
        </I18nProvider>
      </body>
    </html>
  )
}
