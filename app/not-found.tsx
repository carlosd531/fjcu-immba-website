import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <h1 className="font-display text-5xl text-[#0e1c33]">This page is not in the market.</h1>
      <p className="mt-3 text-[#5b6577]">這個頁面不在市集裡。</p>
      <Link href="/market" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#0e1c33] px-5 font-bold text-white">
        Back to the market
      </Link>
    </div>
  )
}
