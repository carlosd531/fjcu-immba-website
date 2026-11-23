import { NextResponse } from "next/server"

const DELIMITER = ";"

export function csvCell(value: string | number) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return `"${String(value).replaceAll('"', '""')}"`
}

export function csvResponse(filename: string, rows: Array<Array<string | number>>) {
  const body = ["sep=;", ...rows.map((row) => row.map(csvCell).join(DELIMITER))].join("\r\n")
  return new NextResponse(`\uFEFF${body}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
