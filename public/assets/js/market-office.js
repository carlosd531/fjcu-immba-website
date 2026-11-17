const OFFICE_MARKET_URL = "https://nqpokyfvniofcjqvmzle.supabase.co/functions/v1/office-market";
const OFFICE_MARKET_KEY = "sb_publishable_Q7Vc5ZSlbHikC835pFQ5Xg_pmz7AxFd";

function marketOfficeStatus(message, warn) {
  const el = document.getElementById("market-status");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden", "is-warn");
  if (warn) el.classList.add("is-warn");
}

async function marketOfficeCall(action, extra) {
  const session = typeof getAuthSession === "function" ? await getAuthSession() : null;
  const response = await fetch(OFFICE_MARKET_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: OFFICE_MARKET_KEY,
      Authorization: "Bearer " + (session?.access_token || "")
    },
    body: JSON.stringify({ action, ...(extra || {}) })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

function marketRoleLabel(role) {
  const labels = {
    en: { pending: "Pending", buyer: "Buyer", seller: "Seller", admin: "Administrator" },
    zh: { pending: "待核准", buyer: "買家", seller: "賣家", admin: "管理員" }
  };
  const lang = typeof getLang === "function" && getLang() === "zh" ? "zh" : "en";
  return labels[lang][role] || role || "—";
}

function marketWhen(value) {
  if (!value) return "—";
  const lang = typeof getLang === "function" && getLang() === "zh" ? "zh-Hant" : "en-GB";
  return new Date(value).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" });
}

function marketMoney(amount) {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(amount || 0);
}

function fillMarketQueue(id, rows, kind) {
  const root = document.getElementById(id);
  if (!root) return;
  if (!rows.length) {
    root.innerHTML = `<p class="muted">${escapeHtml(t("market.empty"))}</p>`;
    return;
  }
  root.innerHTML = rows.map((row) => `
    <article class="pending-admin-card">
      <h3>${escapeHtml(row.full_name || row.email)}</h3>
      <p class="muted">${escapeHtml(row.email)} · ${escapeHtml(marketWhen(row.created_at))}</p>
      ${row.note ? `<p>${escapeHtml(row.note)}</p>` : ""}
      <p class="cta-row">
        <button class="btn btn-gold" type="button" data-market-review="${kind}" data-target="${escapeHtml(row.id)}" data-approve="true">${escapeHtml(t("auth.approve"))}</button>
        <button class="btn btn-outline" type="button" data-market-review="${kind}" data-target="${escapeHtml(row.id)}" data-approve="false">${escapeHtml(t("auth.reject"))}</button>
      </p>
    </article>`).join("");
}

function renderMarketOffice(data) {
  const users = data.users || [];
  const orders = data.orders || [];
  const openOrders = orders.filter((order) => order.status === "placed" || order.status === "paid").length;
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  };
  set("market-stat-buyers", (data.buyers || []).length);
  set("market-stat-sellers", (data.sellers || []).length);
  set("market-stat-orders", openOrders);
  set("market-stat-users", users.length);
  fillMarketQueue("market-buyers", data.buyers || [], "review_buyer");
  fillMarketQueue("market-sellers", data.sellers || [], "review_seller");

  const userBody = document.querySelector("#market-users-table tbody");
  if (userBody) {
    userBody.innerHTML = users.map((row) => `
      <tr>
        <td>${escapeHtml(row.full_name)}</td>
        <td>${escapeHtml(row.email)}</td>
        <td>${escapeHtml(marketRoleLabel(row.role))}</td>
        <td>${escapeHtml(row.requested_role ? `${marketRoleLabel(row.requested_role)} · ${row.request_status}` : "—")}</td>
        <td>${escapeHtml(marketWhen(row.created_at))}</td>
      </tr>`).join("");
  }

  const orderBody = document.querySelector("#market-orders-table tbody");
  if (orderBody) {
    orderBody.innerHTML = orders.map((order) => {
      const items = (order.order_items || []).map((item) => item.title_en).join(", ");
      const total = (order.order_items || []).reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
      return `
        <tr>
          <td>${escapeHtml(order.status)}</td>
          <td>${escapeHtml(order.buyer || "")}</td>
          <td>${escapeHtml(order.seller || "")}</td>
          <td>${escapeHtml(items)}</td>
          <td>${escapeHtml(marketMoney(total))}</td>
          <td>${escapeHtml(marketWhen(order.created_at))}</td>
        </tr>`;
    }).join("") || `<tr><td colspan="6">${escapeHtml(t("market.empty"))}</td></tr>`;
  }

  const activityBody = document.querySelector("#market-activity-table tbody");
  if (activityBody) {
    activityBody.innerHTML = (data.activities || []).map((row) => `
      <tr>
        <td>${escapeHtml(marketWhen(row.created_at))}</td>
        <td>${escapeHtml(String(row.type || "").replaceAll("_", " "))}</td>
      </tr>`).join("") || `<tr><td colspan="2">${escapeHtml(t("market.empty"))}</td></tr>`;
  }
}

async function loadMarketOffice() {
  const data = await marketOfficeCall("snapshot");
  renderMarketOffice(data);
}

async function bindMarketOffice() {
  const root = document.getElementById("market-office");
  if (!root || root.dataset.bound === "1") return;
  root.dataset.bound = "1";
  root.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-market-review]");
    if (!button) return;
    button.disabled = true;
    try {
      await marketOfficeCall(button.dataset.marketReview, {
        target: button.dataset.target,
        approve: button.dataset.approve === "true"
      });
      marketOfficeStatus(t("market.saved"));
      await loadMarketOffice();
    } catch (error) {
      marketOfficeStatus(error.status === 409 ? t("market.notPending") : t("market.loadError"), true);
      button.disabled = false;
    }
  });
  try {
    await loadMarketOffice();
  } catch {
    marketOfficeStatus(t("market.loadError"), true);
  }
}
