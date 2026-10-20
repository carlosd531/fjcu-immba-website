function authClient() {
  if (!window.__immbaAuth && window.supabase) {
    window.__immbaAuth = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
    });
  }
  return window.__immbaAuth;
}

function authRedirectTo(page) {
  return new URL(page, window.location.origin).href;
}

function getAccessToken() {
  return window.__immbaAccessToken || "";
}

async function getAuthSession() {
  const sb = authClient();
  if (!sb) return null;
  const { data, error } = await sb.auth.getSession();
  if (error) return null;
  const session = data.session || null;
  window.__immbaAccessToken = session?.access_token || "";
  return session;
}

async function getAuthProfile(userId) {
  const sb = authClient();
  if (!sb || !userId) return null;
  const { data, error } = await sb.from("profiles").select("id,email,role,created_at").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

function isEmailVerified(user) {
  return !!(user && (user.email_confirmed_at || user.confirmed_at));
}

function canEditContent(profile) {
  return profile && (profile.role === "admin" || profile.role === "super_admin");
}

function canApproveAdmins(profile) {
  return profile && profile.role === "super_admin";
}

function authNext(page) {
  const url = new URL(page, window.location.href);
  url.searchParams.set("lang", typeof getLang === "function" ? getLang() : "en");
  window.location.href = url.pathname.replace(/^\//, "") + url.search;
}

async function signOutAdmin() {
  const sb = authClient();
  if (sb) await sb.auth.signOut();
  window.__immbaAccessToken = "";
  authNext("login.html");
}

function showAuthStatus(message, kind) {
  const el = document.getElementById("auth-status");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden", "is-warn");
  if (kind === "warn") el.classList.add("is-warn");
}

function mountAdminAccount(profile) {
  const nav = document.querySelector(".admin-side-nav");
  if (!nav || !profile) return;
  if (canApproveAdmins(profile) && !nav.querySelector("[data-admin-users]")) {
    const users = document.createElement("a");
    users.href = typeof withLang === "function" ? withLang("admin-users.html") : "admin-users.html";
    users.dataset.adminUsers = "1";
    users.textContent = typeof t === "function" ? t("auth.users") : "Administrators";
    if (document.body.dataset.page === "admin-users.html") users.classList.add("is-active");
    nav.appendChild(users);
  }
  if (!document.getElementById("admin-sign-out")) {
    const btn = document.createElement("button");
    btn.id = "admin-sign-out";
    btn.type = "button";
    btn.className = "btn btn-outline admin-sign-out";
    btn.textContent = typeof t === "function" ? t("auth.signOut") : "Sign out";
    btn.addEventListener("click", signOutAdmin);
    nav.appendChild(btn);
  }
  const meta = document.getElementById("admin-account-meta");
  if (meta) {
    const roleKey = "auth.role." + profile.role;
    meta.textContent = `${profile.email} · ${typeof t === "function" ? t(roleKey) : profile.role}`;
  }
}

async function guardBackOffice(options) {
  const session = await getAuthSession();
  if (!session?.user) {
    authNext("login.html");
    return null;
  }
  if (!isEmailVerified(session.user)) {
    authNext("verify-email.html");
    return null;
  }
  let profile = null;
  try {
    profile = await getAuthProfile(session.user.id);
  } catch {
    showAuthStatus(typeof t === "function" ? t("auth.profileError") : "Could not load your role.", "warn");
    return null;
  }
  if (!profile || profile.role === "pending" || profile.role === "rejected") {
    authNext("admin-waiting.html");
    return null;
  }
  if (options?.superAdmin && !canApproveAdmins(profile)) {
    authNext("admin-news.html");
    return null;
  }
  if (options?.content && !canEditContent(profile)) {
    authNext("admin-waiting.html");
    return null;
  }
  mountAdminAccount(profile);
  return { session, profile };
}

function bindAuthPages() {
  const page = document.body.dataset.page;
  const sb = authClient();
  if (!sb) return;

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm).entries());
      if ((data.password || "") !== (data.confirm || "")) {
        showAuthStatus(t("auth.passwordMismatch"), "warn");
        return;
      }
      const { error } = await sb.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: { emailRedirectTo: authRedirectTo("auth-callback.html") }
      });
      if (error) {
        showAuthStatus(error.message, "warn");
        return;
      }
      showAuthStatus(t("auth.registerOk"));
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());
      const { data: result, error } = await sb.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password
      });
      if (error) {
        showAuthStatus(error.message, "warn");
        return;
      }
      window.__immbaAccessToken = result.session?.access_token || "";
      const user = result.user;
      if (!isEmailVerified(user)) {
        authNext("verify-email.html");
        return;
      }
      let profile = null;
      try {
        profile = await getAuthProfile(user.id);
      } catch {
        showAuthStatus(t("auth.profileError"), "warn");
        return;
      }
      if (canEditContent(profile)) authNext("admin-news.html");
      else authNext("admin-waiting.html");
    });
  }

  const forgotForm = document.getElementById("forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(forgotForm).entries());
      const { error } = await sb.auth.resetPasswordForEmail(data.email.trim(), {
        redirectTo: authRedirectTo("reset-password.html")
      });
      if (error) {
        showAuthStatus(error.message, "warn");
        return;
      }
      showAuthStatus(t("auth.resetSent"));
    });
  }

  const resetForm = document.getElementById("reset-form");
  if (resetForm) {
    resetForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(resetForm).entries());
      if ((data.password || "") !== (data.confirm || "")) {
        showAuthStatus(t("auth.passwordMismatch"), "warn");
        return;
      }
      const { error } = await sb.auth.updateUser({ password: data.password });
      if (error) {
        showAuthStatus(error.message, "warn");
        return;
      }
      showAuthStatus(t("auth.resetOk"));
    });
  }

  if (page === "verify-email.html") {
    document.getElementById("resend-verify")?.addEventListener("click", async () => {
      const session = await getAuthSession();
      const email = session?.user?.email || document.getElementById("verify-email")?.value;
      if (!email) {
        showAuthStatus(t("auth.needEmail"), "warn");
        return;
      }
      const { error } = await sb.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: authRedirectTo("auth-callback.html") }
      });
      showAuthStatus(error ? error.message : t("auth.verifySent"), error ? "warn" : "");
    });
  }

  if (page === "auth-callback.html") {
    getAuthSession().then((session) => {
      if (!session?.user) {
        showAuthStatus(t("auth.callbackFail"), "warn");
        return;
      }
      showAuthStatus(isEmailVerified(session.user) ? t("auth.verified") : t("auth.callbackPending"));
    });
  }

  if (page === "admin-waiting.html") {
    getAuthSession().then(async (session) => {
      if (!session?.user) {
        authNext("login.html");
        return;
      }
      if (!isEmailVerified(session.user)) {
        authNext("verify-email.html");
        return;
      }
      try {
        const profile = await getAuthProfile(session.user.id);
        const lead = document.getElementById("waiting-lead");
        if (lead) {
          if (profile?.role === "rejected") lead.textContent = t("auth.rejected");
          else if (canEditContent(profile)) authNext("admin-news.html");
          else lead.textContent = t("auth.pending");
        }
        const meta = document.getElementById("admin-account-meta");
        if (meta && profile) meta.textContent = `${profile.email} · ${t("auth.role." + profile.role)}`;
      } catch {
        showAuthStatus(t("auth.profileError"), "warn");
      }
    });
    document.getElementById("admin-sign-out")?.addEventListener("click", signOutAdmin);
  }

}

async function bindAdminUsers() {
  const table = document.querySelector("#admin-users-table tbody");
  const status = document.getElementById("auth-status");
  const sb = authClient();
  if (!table || !sb) return;

  const show = (message, kind) => {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("hidden", "is-warn");
    if (kind === "warn") status.classList.add("is-warn");
  };

  const render = async () => {
    const { data, error } = await sb.from("profiles").select("id,email,role,created_at").order("created_at", { ascending: true });
    if (error) {
      show(error.message, "warn");
      return;
    }
    table.innerHTML = (data || []).map((row) => `
      <tr data-id="${row.id}">
        <td>${escapeHtml(row.email)}</td>
        <td><span class="admin-pill admin-pill-${row.role === "admin" || row.role === "super_admin" ? "published" : row.role === "rejected" ? "warn" : "draft"}">${escapeHtml(t("auth.role." + row.role))}</span></td>
        <td>${escapeHtml((row.created_at || "").slice(0, 10))}</td>
        <td class="admin-actions">
          ${row.role === "super_admin" ? "—" : `
            <button class="btn btn-outline" type="button" data-approve="${row.id}" ${row.role === "admin" ? "disabled" : ""}>${t("auth.approve")}</button>
            <button class="btn btn-outline" type="button" data-reject="${row.id}" ${row.role === "rejected" ? "disabled" : ""}>${t("auth.reject")}</button>
          `}
        </td>
      </tr>`).join("");
  };

  table.addEventListener("click", async (event) => {
    const approve = event.target.closest("[data-approve]")?.getAttribute("data-approve");
    const reject = event.target.closest("[data-reject]")?.getAttribute("data-reject");
    const id = approve || reject;
    if (!id) return;
    const role = approve ? "admin" : "rejected";
    const { error } = await sb.from("profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      show(error.message, "warn");
      return;
    }
    await render();
    show(approve ? t("auth.approved") : t("auth.rejectedOk"));
  });

  await render();
}
