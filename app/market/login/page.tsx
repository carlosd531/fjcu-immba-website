import Link from "next/link"
import { signIn } from "@/lib/actions"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [lang, query] = await Promise.all([getLang(), searchParams])
  return (
    <form action={signIn} className="mx-auto max-w-xl rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-6 shadow-[0_18px_50px_rgba(14,28,51,0.08)]">
      <p className="rounded-xl bg-[#efe2c8] px-4 py-3 text-base font-semibold text-[#3a1d12]">{t(lang, "loginNotice")}</p>
      <h1 className="mt-4 font-display text-4xl">{t(lang, "marketSignIn")}</h1>
      {query.error ? <p className="mt-3 text-sm font-semibold text-[#8c3a32]">{t(lang, query.error === "confirm" ? "errorConfirm" : query.error === "stock" ? "errorStock" : "errorAuth")}</p> : null}
      <label className="mt-4 block text-sm font-bold">{t(lang, "email")}<input name="email" type="email" required autoComplete="username" className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" /></label>
      <label className="mt-3 block text-sm font-bold">{t(lang, "password")}<input name="password" type="password" required autoComplete="current-password" className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" /></label>
      <button className="mt-4 h-11 rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "signIn")}</button>
      <p className="mt-4 text-sm">{t(lang, "needAccount")} <Link href="/market/signup" className="font-bold underline">{t(lang, "signUp")}</Link></p>
    </form>
  )
}
