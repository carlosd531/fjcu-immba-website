import Link from "next/link"
import { signUp } from "@/lib/actions"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import type { MessageKey } from "@/lib/i18n"

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string; kind?: string }> }) {
  const [lang, query] = await Promise.all([getLang(), searchParams])
  const kind = query.kind === "seller" ? "seller" : "buyer"
  const errorKey = query.error === "confirm" ? "errorConfirm" : query.error === "rate" ? "errorRate" : query.error === "auth" ? "errorAuth" : query.error === "errorRequest" ? "errorRequest" : query.error ? "errorGeneric" : ""
  return (
    <form action={signUp} className="mx-auto max-w-xl rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-6">
      <p className="rounded-xl bg-[#efe2c8] px-4 py-3 text-base font-semibold text-[#3a1d12]">{t(lang, "loginNotice")}</p>
      <h1 className="mt-4 font-display text-4xl">{t(lang, kind === "seller" ? "beSeller" : "startBuying")}</h1>
      <p className="mt-2 text-sm text-[#5b6577]">{t(lang, "signupLead")}</p>
      {errorKey ? <p className="mt-3 text-sm font-semibold text-[#8c3a32]">{t(lang, errorKey as MessageKey)}</p> : null}
      <label className="mt-4 block text-sm font-bold">{t(lang, "name")}<input name="name" required className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" /></label>
      <label className="mt-3 block text-sm font-bold">{t(lang, "email")}<input name="email" type="email" required className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" /></label>
      <label className="mt-3 block text-sm font-bold">{t(lang, "password")}<input name="password" type="password" minLength={8} required className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" /></label>
      <input type="hidden" name="kind" value={kind} />
      <label className="mt-3 block text-sm font-bold">{t(lang, "note")}<textarea name="note" className="mt-1 min-h-24 w-full rounded-xl border border-[#e4e0d8] px-3 py-2" /></label>
      <button className="mt-4 h-11 rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "signUp")}</button>
      <p className="mt-4 text-sm">{t(lang, "haveAccount")} <Link className="font-bold underline" href="/market/login">{t(lang, "signIn")}</Link></p>
    </form>
  )
}
