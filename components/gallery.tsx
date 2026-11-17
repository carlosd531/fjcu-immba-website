"use client"

import { useState } from "react"

export function Gallery({ urls, alt }: { urls: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  if (!urls.length) {
    return <div className="flex aspect-[4/3] items-center justify-center rounded-[18px] bg-[#efe2c8] text-[#6d4e16]">{alt}</div>
  }
  return (
    <div>
      <img src={urls[index]} alt={alt} className="aspect-[4/3] w-full rounded-[18px] object-cover" />
      {urls.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {urls.map((url, i) => (
            <button key={url} type="button" onClick={() => setIndex(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${i === index ? "border-[#b68a3d]" : "border-[#e4e0d8]"}`}>
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
