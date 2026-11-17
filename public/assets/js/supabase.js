const SUPABASE_URL = "https://euguitrxspkpspmybylx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Z3VpdHJ4c3BrcHNwbXlieWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDI5MzcsImV4cCI6MjEwODAxODkzN30.bkPNK5X9VDDwndU7K5Pr8Ujzw1WzntYKy9jKAbpdxmI";

function supabaseHeaders(extra) {
  const token = (typeof getAccessToken === "function" && getAccessToken()) || SUPABASE_ANON_KEY;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: "Bearer " + token,
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

function facultyToRow(item) {
  return {
    id: item.id,
    name: item.name || "",
    name_zh: item.nameZh || "",
    title: item.title || "",
    title_zh: item.titleZh || "",
    education: item.edu || "",
    education_zh: item.eduZh || "",
    research_fields: item.specs || "",
    research_fields_zh: item.specsZh || "",
    department: item.dept || "",
    department_zh: item.deptZh || "",
    email: item.email || "",
    phone: item.tel || "",
    website: item.website || "",
    image_url: item.photo || "",
    category: item.category === "adjunct" ? "adjunct" : "full-time",
    sort_order: Number(item.order) || 1,
    status: item.status === "draft" ? "draft" : "published",
    updated_at: new Date().toISOString()
  };
}

function rowToFaculty(row, index) {
  return {
    id: row.id,
    name: row.name || "",
    nameZh: row.name_zh || "",
    title: row.title || "",
    titleZh: row.title_zh || "",
    edu: row.education || "",
    eduZh: row.education_zh || "",
    specs: row.research_fields || "",
    specsZh: row.research_fields_zh || "",
    dept: row.department || "",
    deptZh: row.department_zh || "",
    email: row.email || "",
    tel: row.phone || "",
    website: row.website || "",
    photo: row.image_url || "",
    category: row.category === "adjunct" ? "adjunct" : "full-time",
    order: row.sort_order === 0 || row.sort_order ? Number(row.sort_order) : index + 1,
    status: row.status === "draft" ? "draft" : "published"
  };
}

async function fetchRemoteFaculty() {
  const rows = await supabaseJson("faculty?select=*&order=sort_order.asc", {
    headers: supabaseHeaders()
  });
  return Array.isArray(rows) ? rows.map((row, index) => rowToFaculty(row, index)) : [];
}

async function syncFacultyToSupabase(items) {
  const rows = (items || []).map(facultyToRow);
  if (rows.length) {
    await supabaseJson("faculty", {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(rows)
    });
  }
  const keep = new Set(rows.map((row) => row.id));
  const existing = await supabaseJson("faculty?select=id", { headers: supabaseHeaders() });
  const extra = (existing || []).map((row) => row.id).filter((id) => !keep.has(id));
  if (extra.length) {
    const filter = extra.map((id) => `"${String(id).replace(/"/g, "")}"`).join(",");
    await supabaseJson(`faculty?id=in.(${filter})`, {
      method: "DELETE",
      headers: supabaseHeaders({ Prefer: "return=minimal" })
    });
  }
}
