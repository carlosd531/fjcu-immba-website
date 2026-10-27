const ALUMNI_FIELDS = [
  "full_name",
  "student_id",
  "department",
  "degree_program",
  "admission_year",
  "graduation_year",
  "email",
  "phone",
  "company",
  "job_title"
];

const ALUMNI_COLUMN_STORE = "immbaAlumniColumnsV2";
const ALUMNI_DEFAULT_COLUMNS = ["full_name", "student_id", "department", "degree_program", "admission_year", "graduation_year", "email", "phone", "company", "job_title"];
const ALUMNI_DEGREES = ["Bachelor's Program", "Master's Program", "Doctoral Program"];
const ALUMNI_DEPARTMENTS = [
  "International Business and Trade",
  "Business Administration",
  "Accounting",
  "Finance",
  "Information Management",
  "Economics",
  "Law",
  "Statistics"
];

function alumniEmpty() {
  return {
    id: "",
    full_name: "",
    student_id: "",
    department: "International Business and Trade",
    degree_program: "Master's Program",
    admission_year: "",
    graduation_year: "",
    email: "",
    phone: "",
    company: "",
    job_title: ""
  };
}

function alumniYear(value) {
  const year = String(value || "").replace(/\D/g, "");
  return year ? Number(year) : null;
}

function normalizeAlumniDegree(value) {
  const raw = String(value || "").trim();
  if (ALUMNI_DEGREES.includes(raw)) return raw;
  const compact = raw.toLowerCase().replace(/[.’']/g, "");
  if (!compact) return "Master's Program";
  if (compact.includes("bachelor") || ["ba", "bs", "bba", "undergraduate"].includes(compact)) return "Bachelor's Program";
  if (compact.includes("master") || ["mba", "ma", "ms", "msc", "immba"].includes(compact)) return "Master's Program";
  if (compact.includes("doctoral") || compact.includes("doctor") || compact.includes("phd") || compact === "dba") return "Doctoral Program";
  return raw;
}

function unwrapAuditValue(value) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/^"|"$/g, "");
}

function alumniRecordLabel(row) {
  const data = row.after_data || row.before_data || {};
  const studentId = unwrapAuditValue(data.student_id);
  const name = unwrapAuditValue(data.full_name);
  if (studentId) return "Alumni #" + studentId;
  if (name) return name;
  const shortId = String(row.alumni_id || "").slice(0, 8);
  return shortId ? "Alumni #" + shortId : "—";
}

function alumniActionCode(action) {
  if (action === "insert") return "CREATE";
  if (action === "update") return "UPDATE";
  if (action === "delete") return "DELETE";
  return (action || "").toUpperCase();
}

function alumniChangeSummary(row) {
  if (row.action === "insert") return typeof t === "function" ? t("alumni.changeNew") : "New record";
  if (row.action === "delete") return typeof t === "function" ? t("alumni.changeDeleted") : "Record deleted";
  const changes = row.changes && typeof row.changes === "object" ? row.changes : {};
  const keys = Object.keys(changes);
  if (!keys.length) return typeof t === "function" ? t("alumni.changeUpdated") : "Record updated";
  return keys.map((key) => {
    const label = typeof t === "function" ? t("alumni.field." + key) : key;
    const from = unwrapAuditValue(changes[key] && changes[key].from) || "—";
    const to = unwrapAuditValue(changes[key] && changes[key].to) || "—";
    const template = typeof t === "function" ? t("alumni.changeField") : "{field} changed from {from} to {to}";
    return template.replace("{field}", label).replace("{from}", from).replace("{to}", to);
  }).join("; ");
}

function alumniVisibleColumns() {
  try {
    const raw = JSON.parse(localStorage.getItem(ALUMNI_COLUMN_STORE) || "null");
    if (Array.isArray(raw) && raw.length) return raw.filter((key) => ALUMNI_FIELDS.includes(key));
  } catch {
    /* keep defaults */
  }
  return ALUMNI_DEFAULT_COLUMNS.slice();
}

function saveAlumniVisibleColumns(keys) {
  localStorage.setItem(ALUMNI_COLUMN_STORE, JSON.stringify(keys));
}

function alumniCell(row, key) {
  const value = row[key];
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

const ALUMNI_HEADER_ALIASES = {
  full_name: ["full_name", "name", "alumni name", "alumni_name"],
  student_id: ["student_id", "alumni_no", "id", "student id"],
  department: ["department", "program", "department / program"],
  degree_program: ["degree_program", "degree", "degree program", "degree level"],
  admission_year: ["admission_year", "admission year"],
  graduation_year: ["graduation_year", "graduation year", "year"],
  email: ["email"],
  phone: ["phone"],
  company: ["company", "current company"],
  job_title: ["job_title", "jobtitle", "job title", "current position"]
};

const ALUMNI_CSV_HEADERS = {
  full_name: "Name",
  student_id: "Student ID",
  department: "Department",
  degree_program: "Degree Program",
  admission_year: "Admission Year",
  graduation_year: "Graduation Year",
  email: "Email",
  phone: "Phone",
  company: "Current Company",
  job_title: "Job Title"
};

function canonicalAlumniHeader(header) {
  const key = String(header || "").trim().toLowerCase().replace(/_/g, " ");
  return ALUMNI_FIELDS.find((field) => ALUMNI_HEADER_ALIASES[field].some((alias) => alias.replace(/_/g, " ") === key)) || "";
}

function isKnownDegreeValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return true;
  if (ALUMNI_DEGREES.includes(raw)) return true;
  const compact = raw.toLowerCase().replace(/[.’']/g, "");
  return compact.includes("bachelor") || compact.includes("master") || compact.includes("doctoral") || compact.includes("phd") || ["mba", "ba", "bs", "bba"].includes(compact);
}

function parseAlumniCsv(text) {
  const rows = [];
  let emptyRows = 0;
  let row = [];
  let cell = "";
  let inQuotes = false;
  const pushCell = () => {
    row.push(cell);
    cell = "";
  };
  const pushRow = () => {
    if (row.some((part) => String(part).trim() !== "")) rows.push(row);
    else if (row.length) emptyRows += 1;
    row = [];
  };
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") pushCell();
    else if (ch === "\n") {
      pushCell();
      pushRow();
    } else if (ch !== "\r") cell += ch;
  }
  pushCell();
  pushRow();
  if (!rows.length) return { headers: [], records: [], emptyRows };
  const headers = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((parts, index) => {
    const item = { __line: index + 2 };
    headers.forEach((header, col) => {
      item[header.trim().toLowerCase()] = (parts[col] || "").trim();
    });
    return item;
  });
  return { headers, records, emptyRows };
}

async function readAlumniCsvFile(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let text = "";
  if (bytes[0] === 0xff && bytes[1] === 0xfe) text = new TextDecoder("utf-16le").decode(buffer);
  else if (bytes[0] === 0xfe && bytes[1] === 0xff) text = new TextDecoder("utf-16be").decode(buffer);
  else text = new TextDecoder("utf-8").decode(buffer);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return text;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function alumniToCsv(list) {
  const header = ALUMNI_FIELDS.map((key) => ALUMNI_CSV_HEADERS[key]).join(",");
  const body = list.map((row) => ALUMNI_FIELDS.map((key) => csvEscape(key === "degree_program" ? normalizeAlumniDegree(row[key]) : (row[key] == null ? "" : row[key]))).join(","));
  return "\uFEFF" + [header, ...body].join("\n");
}

function downloadAlumniCsv(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function validateAlumniImport(text, existingRows) {
  const issues = [];
  const valid = [];
  if (!text || !text.trim()) {
    issues.push({ level: "error", message: typeof t === "function" ? t("alumni.valEmptyFile") : "The CSV file is empty." });
    return { valid, issues, emptyRows: 0 };
  }
  if ((text.match(/\uFFFD/g) || []).length > 3) {
    issues.push({ level: "error", message: typeof t === "function" ? t("alumni.valEncoding") : "The file encoding looks damaged. Save the CSV as UTF-8 and try again." });
  }
  const parsed = parseAlumniCsv(text);
  const mapped = parsed.headers.map(canonicalAlumniHeader);
  const unknown = parsed.headers.filter((header, index) => header && !mapped[index]);
  if (unknown.length) {
    issues.push({
      level: "error",
      message: (typeof t === "function" ? t("alumni.valColumns") : "Unknown column names: {cols}. Use the CSV template.").replace("{cols}", unknown.join(", "))
    });
  }
  if (!mapped.includes("full_name") || !mapped.includes("student_id")) {
    issues.push({ level: "error", message: typeof t === "function" ? t("alumni.valNeedNameCol") : "The CSV must include Name and Student ID columns. Use the template." });
    return { valid, issues, emptyRows: parsed.emptyRows };
  }
  if (parsed.emptyRows) {
    issues.push({
      level: "warn",
      message: (typeof t === "function" ? t("alumni.valEmptyRows") : "{n} empty row(s) were skipped.").replace("{n}", String(parsed.emptyRows))
    });
  }
  const seenIds = new Map();
  const existingIds = new Set((existingRows || []).map((row) => String(row.student_id || "")).filter(Boolean));
  parsed.records.forEach((raw) => {
    const line = raw.__line;
    const row = alumniFromCsvRow(raw);
    const degreeRaw = raw["degree program"] || raw.degree_program || raw.degree || "";
    if (!row.full_name) {
      issues.push({ level: "error", message: (typeof t === "function" ? t("alumni.valNeedName") : "Row {n}: Name is required.").replace("{n}", String(line)) });
      return;
    }
    if (!row.student_id) {
      issues.push({ level: "error", message: (typeof t === "function" ? t("alumni.valNeedId") : "Row {n}: Student ID is required.").replace("{n}", String(line)) });
      return;
    }
    if (degreeRaw && !isKnownDegreeValue(degreeRaw)) {
      issues.push({
        level: "error",
        message: (typeof t === "function" ? t("alumni.valDegree") : "Row {n}: invalid Degree Program “{value}”. Use Bachelor's Program, Master's Program, or Doctoral Program.").replace("{n}", String(line)).replace("{value}", degreeRaw)
      });
      return;
    }
    if (row.student_id) {
      if (seenIds.has(row.student_id)) {
        issues.push({
          level: "error",
          message: (typeof t === "function" ? t("alumni.valDupFile") : "Row {n}: duplicate student_id {id} in this file.").replace("{n}", String(line)).replace("{id}", row.student_id)
        });
        return;
      }
      seenIds.set(row.student_id, line);
      if (existingIds.has(row.student_id)) {
        issues.push({
          level: "warn",
          message: (typeof t === "function" ? t("alumni.valDupDb") : "Row {n}: student_id {id} already exists and will be updated.").replace("{n}", String(line)).replace("{id}", row.student_id)
        });
      }
    }
    valid.push(row);
  });
  return { valid, issues, emptyRows: parsed.emptyRows };
}

function alumniFromCsvRow(raw) {
  const studentId = (raw.student_id || raw["student id"] || raw.alumni_no || "").trim();
  return {
    full_name: (raw.full_name || raw.name || "").trim(),
    student_id: studentId || null,
    department: (raw.department || raw.program || "").trim(),
    degree_program: normalizeAlumniDegree(raw["degree program"] || raw.degree_program || raw.degree),
    admission_year: alumniYear(raw.admission_year || raw["admission year"]),
    graduation_year: alumniYear(raw.graduation_year || raw["graduation year"] || raw.year),
    email: (raw.email || "").trim(),
    phone: (raw.phone || "").trim(),
    company: (raw.company || raw["current company"] || "").trim(),
    job_title: (raw.job_title || raw.jobtitle || raw["job title"] || "").trim()
  };
}

function alumniPayload(form) {
  const studentId = String(form.student_id || "").trim();
  return {
    full_name: String(form.full_name || "").trim(),
    student_id: studentId || null,
    department: String(form.department || "").trim(),
    degree_program: normalizeAlumniDegree(form.degree_program),
    admission_year: alumniYear(form.admission_year),
    graduation_year: alumniYear(form.graduation_year),
    email: String(form.email || "").trim(),
    phone: String(form.phone || "").trim(),
    company: String(form.company || "").trim(),
    job_title: String(form.job_title || "").trim(),
    updated_at: new Date().toISOString()
  };
}

async function bindAdminAlumni() {
  const sb = typeof authClient === "function" ? authClient() : null;
  const table = document.querySelector("#alumni-table tbody");
  const auditTable = document.querySelector("#alumni-audit-table tbody");
  const form = document.getElementById("alumni-form");
  const status = document.getElementById("alumni-status");
  if (!sb || !table || !form) return;

  let rows = [];
  let auditRows = [];
  let editingId = "";

  const show = (message, kind) => {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("hidden", "is-warn");
    if (kind === "warn") status.classList.add("is-warn");
  };

  const setStat = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  };

  const visible = () => {
    const checked = [...document.querySelectorAll("[data-alumni-col]:checked")].map((el) => el.value);
    return checked.length ? checked : ALUMNI_DEFAULT_COLUMNS.slice();
  };

  const matchesFilters = (row) => {
    const name = (document.getElementById("alumni-filter-name")?.value || "").trim().toLowerCase();
    const year = (document.getElementById("alumni-filter-year")?.value || "").trim();
    const department = (document.getElementById("alumni-filter-department")?.value || "").trim().toLowerCase();
    const degree = (document.getElementById("alumni-filter-degree")?.value || "").trim();
    const company = (document.getElementById("alumni-filter-company")?.value || "").trim().toLowerCase();
    if (name && !String(row.full_name || "").toLowerCase().includes(name)) return false;
    if (year && String(row.graduation_year || "") !== year) return false;
    if (department && String(row.department || "").toLowerCase() !== department) return false;
    if (degree && normalizeAlumniDegree(row.degree_program) !== degree) return false;
    if (company && !String(row.company || "").toLowerCase().includes(company) && String(row.company || "").toLowerCase() !== company) return false;
    return true;
  };

  const filteredRows = () => rows.filter(matchesFilters);

  const uniqueOptions = (key) => {
    const values = [...new Set(rows.map((row) => String(row[key] || "").trim()).filter(Boolean))].sort();
    return values;
  };

  const fillFilter = (id, values, current) => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = `<option value="">${t("alumni.any")}</option>` + values.map((value) =>
      `<option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(value)}</option>`
    ).join("");
  };

  const renderColumns = () => {
    const box = document.getElementById("alumni-columns");
    if (!box) return;
    const selected = alumniVisibleColumns();
    box.innerHTML = ALUMNI_FIELDS.map((key) => `
      <label class="admin-check alumni-col-check">
        <input type="checkbox" data-alumni-col value="${key}" ${selected.includes(key) ? "checked" : ""}>
        <span>${t("alumni.field." + key)}</span>
      </label>`).join("");
  };

  const renderHead = () => {
    const head = document.querySelector("#alumni-table thead tr");
    if (!head) return;
    const cols = visible();
    head.innerHTML = cols.map((key) => `<th>${t("alumni.field." + key)}</th>`).join("") + `<th>${t("admin.colActions")}</th>`;
  };

  const renderTable = () => {
    const cols = visible();
    const filtered = filteredRows();
    setStat("alumni-stat-total", rows.length);
    setStat("alumni-stat-shown", filtered.length);
    table.innerHTML = filtered.map((row) => `
      <tr data-id="${row.id}">
        ${cols.map((key) => `<td>${escapeHtml(key === "degree_program" ? normalizeAlumniDegree(row[key]) : alumniCell(row, key))}</td>`).join("")}
        <td class="admin-actions">
          <button class="btn btn-outline" type="button" data-edit="${row.id}">${t("admin.update")}</button>
          <button class="btn btn-outline" type="button" data-delete="${row.id}">${t("admin.delete")}</button>
        </td>
      </tr>`).join("") || `<tr><td colspan="${cols.length + 1}">${t("alumni.empty")}</td></tr>`;
  };

  const renderAudit = () => {
    if (!auditTable) return;
    const q = (document.getElementById("alumni-audit-search")?.value || "").trim().toLowerCase();
    const list = auditRows.filter((row) => {
      if (!q) return true;
      return [row.actor_email, alumniActionCode(row.action), alumniRecordLabel(row), alumniChangeSummary(row)].join(" ").toLowerCase().includes(q);
    });
    auditTable.innerHTML = list.map((row) => `
      <tr>
        <td>${escapeHtml((row.changed_at || "").replace("T", " ").slice(0, 16).replace("T", " "))}</td>
        <td>${escapeHtml(row.actor_email || "—")}</td>
        <td>${escapeHtml(alumniActionCode(row.action))}</td>
        <td>${escapeHtml(alumniRecordLabel(row))}</td>
        <td>${escapeHtml(alumniChangeSummary(row))}</td>
      </tr>`).join("") || `<tr><td colspan="5">${t("alumni.auditEmpty")}</td></tr>`;
  };

  const fillForm = (item) => {
    ALUMNI_FIELDS.forEach((key) => {
      const input = form.elements[key];
      if (!input) return;
      if (key === "department" && item[key] && ![...input.options].some((opt) => opt.value === item[key])) {
        const extra = document.createElement("option");
        extra.value = item[key];
        extra.textContent = item[key];
        input.appendChild(extra);
      }
      if (key === "degree_program") input.value = normalizeAlumniDegree(item[key]);
      else input.value = item[key] == null ? "" : item[key];
    });
    form.elements.id.value = item.id || "";
    document.getElementById("alumni-form-title").textContent = item.id ? t("alumni.edit") : t("alumni.create");
    form.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const load = async () => {
    const [{ data, error }, audit] = await Promise.all([
      sb.from("alumni").select("*").order("updated_at", { ascending: false }),
      sb.from("alumni_audit").select("id,alumni_id,action,actor_email,changed_at,changes,before_data,after_data").order("changed_at", { ascending: false }).limit(200)
    ]);
    if (error) {
      show(error.message || t("alumni.supabaseMissing"), "warn");
      rows = [];
    } else {
      rows = data || [];
    }
    if (audit.error) auditRows = [];
    else auditRows = audit.data || [];
    const yearNow = document.getElementById("alumni-filter-year")?.value || "";
    const departmentNow = document.getElementById("alumni-filter-department")?.value || "";
    const degreeNow = document.getElementById("alumni-filter-degree")?.value || "";
    const companyNow = document.getElementById("alumni-filter-company")?.value || "";
    fillFilter("alumni-filter-year", uniqueOptions("graduation_year"), yearNow);
    fillFilter("alumni-filter-department", [...new Set(ALUMNI_DEPARTMENTS.concat(uniqueOptions("department")))].sort(), departmentNow);
    fillFilter("alumni-filter-degree", ALUMNI_DEGREES, degreeNow);
    fillFilter("alumni-filter-company", uniqueOptions("company"), companyNow);
    renderHead();
    renderTable();
    renderAudit();
  };

  renderColumns();
  renderHead();

  document.getElementById("alumni-columns")?.addEventListener("change", () => {
    saveAlumniVisibleColumns(visible());
    renderHead();
    renderTable();
  });

  ["alumni-filter-name", "alumni-filter-year", "alumni-filter-department", "alumni-filter-degree", "alumni-filter-company"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderTable);
    document.getElementById(id)?.addEventListener("change", renderTable);
  });

  document.getElementById("alumni-export")?.addEventListener("click", () => {
    const list = filteredRows();
    if (!list.length) {
      show(t("alumni.exportEmpty"), "warn");
      return;
    }
    downloadAlumniCsv("alumni-filtered.csv", alumniToCsv(list));
    show(t("alumni.exported").replace("{n}", String(list.length)));
  });

  document.getElementById("alumni-columns-btn")?.addEventListener("click", () => {
    document.getElementById("alumni-columns")?.classList.toggle("hidden");
  });
  document.getElementById("alumni-audit-search")?.addEventListener("input", renderAudit);

  document.getElementById("alumni-new")?.addEventListener("click", () => {
    editingId = "";
    fillForm(alumniEmpty());
  });

  document.getElementById("alumni-cancel")?.addEventListener("click", () => {
    form.classList.add("hidden");
    form.reset();
    editingId = "";
  });

  table.addEventListener("click", async (event) => {
    const editId = event.target.closest("[data-edit]")?.getAttribute("data-edit");
    const deleteId = event.target.closest("[data-delete]")?.getAttribute("data-delete");
    if (editId) {
      const item = rows.find((row) => row.id === editId);
      if (!item) return;
      editingId = editId;
      fillForm(item);
      return;
    }
    if (!deleteId) return;
    if (!confirm(t("alumni.deleteConfirm"))) return;
    const { error } = await sb.from("alumni").delete().eq("id", deleteId);
    if (error) {
      show(error.message, "warn");
      return;
    }
    show(t("alumni.deleted"));
    await load();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = alumniPayload(data);
    if (!payload.full_name || !payload.student_id) {
      show(t("alumni.needName"), "warn");
      return;
    }
    const session = typeof getAuthSession === "function" ? await getAuthSession() : null;
    payload.updated_by = session?.user?.id || null;
    let error;
    if (data.id) {
      ({ error } = await sb.from("alumni").update(payload).eq("id", data.id));
    } else {
      payload.created_by = session?.user?.id || null;
      ({ error } = await sb.from("alumni").insert(payload));
    }
    if (error) {
      show(error.message, "warn");
      return;
    }
    form.classList.add("hidden");
    form.reset();
    editingId = "";
    show(t("alumni.saved"));
    await load();
  });

  let pendingImport = [];
  const importPanel = document.getElementById("alumni-import-panel");
  const importIssues = document.getElementById("alumni-import-issues");
  const importSummary = document.getElementById("alumni-import-summary");

  const showImportReport = (result) => {
    pendingImport = result.valid;
    if (importPanel) importPanel.classList.remove("hidden");
    const errors = result.issues.filter((item) => item.level === "error").length;
    const warns = result.issues.filter((item) => item.level === "warn").length;
    if (importSummary) {
      importSummary.textContent = t("alumni.valSummary")
        .replace("{valid}", String(result.valid.length))
        .replace("{errors}", String(errors))
        .replace("{warns}", String(warns));
    }
    if (importIssues) {
      importIssues.innerHTML = result.issues.length
        ? result.issues.map((item) => `<li class="${item.level === "error" ? "is-warn" : ""}">${escapeHtml(item.message)}</li>`).join("")
        : `<li>${escapeHtml(t("alumni.valOk"))}</li>`;
    }
    const confirmBtn = document.getElementById("alumni-import-confirm");
    if (confirmBtn) confirmBtn.disabled = result.valid.length === 0;
  };

  document.getElementById("alumni-import")?.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const text = await readAlumniCsvFile(file);
    showImportReport(validateAlumniImport(text, rows));
    importPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("alumni-import-cancel")?.addEventListener("click", () => {
    pendingImport = [];
    importPanel?.classList.add("hidden");
  });

  document.getElementById("alumni-import-confirm")?.addEventListener("click", async () => {
    if (!pendingImport.length) return;
    const session = typeof getAuthSession === "function" ? await getAuthSession() : null;
    const actor = session?.user?.id || null;
    const stamped = pendingImport.map((row) => ({
      ...row,
      updated_at: new Date().toISOString(),
      updated_by: actor,
      created_by: actor
    }));
    const withNo = stamped.filter((row) => row.student_id);
    const withoutNo = stamped.filter((row) => !row.student_id);
    const chunk = async (list, upsert) => {
      for (let i = 0; i < list.length; i += 40) {
        const slice = list.slice(i, i + 40);
        const result = upsert
          ? await sb.from("alumni").upsert(slice, { onConflict: "student_id" })
          : await sb.from("alumni").insert(slice);
        if (result.error) throw result.error;
      }
    };
    try {
      if (withNo.length) await chunk(withNo, true);
      if (withoutNo.length) await chunk(withoutNo, false);
      const count = pendingImport.length;
      pendingImport = [];
      importPanel?.classList.add("hidden");
      await load();
      show(t("alumni.importedVerify").replace("{n}", String(count)).replace("{total}", String(rows.length)));
    } catch (error) {
      show(error.message || t("alumni.supabaseMissing"), "warn");
    }
  });

  await load();
}
