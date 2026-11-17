"use client"

import { createContext, useContext } from "react"
import { messages, type MessageKey } from "@/lib/i18n"
import type { Lang } from "@/lib/types"

const I18nContext = createContext<{ lang: Lang; t: (key: MessageKey, vars?: Record<string, string | number>) => string }>({
  lang: "en",
  t: (key) => messages.en[key],
})

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  function translate(key: MessageKey, vars?: Record<string, string | number>) {
    let text: string = messages[lang][key]
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value))
      }
    }
    return text
  }
  return <I18nContext.Provider value={{ lang, t: translate }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
