const SUPABASE_URL = "https://euguitrxspkpspmybylx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Z3VpdHJ4c3BrcHNwbXlieWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDI5MzcsImV4cCI6MjEwODAxODkzN30.bkPNK5X9VDDwndU7K5Pr8Ujzw1WzntYKy9jKAbpdxmI";

function supabaseHeaders(extra) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: "Bearer " + SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    ...extra
  };
}

function newsToRow(item) {
  return {
    slug: item.slug,
    date: item.date || null,
    url: item.url || "",
    display_order: Number(item.order) || 1,
    status: item.status === "draft" ? "draft" : "published",
    top: !!item.top,
    tag: item.tag || "",
    tag_zh: item.tagZh || "",
    title: item.title || "",
    title_zh: item.titleZh || "",
    body: item.body || "",
    body_zh: item.bodyZh || "",
    images: item.images || [],
    updated_at: new Date().toISOString()
  };
}

function rowToNews(row, index) {
  return {
    slug: row.slug,
    date: row.date || "",
    url: row.url || "",
    order: row.display_order === 0 || row.display_order ? Number(row.display_order) : index + 1,
    status: row.status === "draft" ? "draft" : "published",
    top: !!row.top,
    tag: row.tag || "",
    tagZh: row.tag_zh || "",
    title: row.title || "",
    titleZh: row.title_zh || "",
    body: row.body || "",
    bodyZh: row.body_zh || "",
    images: row.images || []
  };
}

async function supabaseJson(path, options) {
  const response = await fetch(SUPABASE_URL + "/rest/v1/" + path, options);
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    const error = new Error((data && (data.message || data.error)) || "Supabase request failed");
    error.status = response.status;
    error.code = data && data.code;
    error.missingTable = data && data.code === "PGRST205";
    throw error;
  }
  return data;
}

async function fetchRemoteNews() {
  const rows = await supabaseJson("announcements?select=*&order=date.desc", {
    headers: supabaseHeaders()
  });
  return Array.isArray(rows) ? rows.map((row, index) => rowToNews(row, index)) : [];
}

async function syncNewsToSupabase(items) {
  const rows = (items || []).map(newsToRow);
  if (rows.length) {
    await supabaseJson("announcements", {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(rows)
    });
  }
  const keep = new Set(rows.map((row) => row.slug));
  const existing = await supabaseJson("announcements?select=slug", { headers: supabaseHeaders() });
  const extra = (existing || []).map((row) => row.slug).filter((slug) => !keep.has(slug));
  if (extra.length) {
    const filter = extra.map((slug) => `"${slug.replace(/"/g, "")}"`).join(",");
    await supabaseJson(`announcements?slug=in.(${filter})`, {
      method: "DELETE",
      headers: supabaseHeaders({ Prefer: "return=minimal" })
    });
  }
}
