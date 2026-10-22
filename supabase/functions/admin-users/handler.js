// Staff account management for the OQC admin panel.
// Shared by the Supabase Edge Function (index.ts) and the local test emulator, so it has no imports:
// the Supabase client factory and environment are passed in.
//
// Actions (POST JSON { action, ... }):
//   bootstrap       first Super Admin; needs header x-bootstrap-token (BOOTSTRAP_TOKEN secret or a single-use DB token) and no active Super Admin
//   create          new staff login with a temporary password            (users:create)
//   reset_password  new temporary password for a colleague               (users:update)
//   set_active      enable / disable a login                             (users:update)
//   update          role, name, job title, phone, department, teacher link (users:update)
//   delete          remove a login permanently                           (users:delete)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bootstrap-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

function fail(message, status = 400) {
  return json({ error: message }, status);
}

export function generatePassword() {
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `Oqc-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

function permitted(perms, permission) {
  const module = permission.split(":")[0];
  return perms.some((p) => p === "*" || p === permission || p === `${module}:*`);
}

function cleanText(value, max = 120) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim().slice(0, max);
  return text === "" ? null : text;
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 10 && password.length <= 72;
}

export async function handleRequest(req, { createClient, env }) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  const url = env.SUPABASE_URL;
  let serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey && env.SUPABASE_SECRET_KEYS) {
    // projects that only use the newer API keys expose them as a JSON map
    try {
      const keys = JSON.parse(env.SUPABASE_SECRET_KEYS);
      serviceKey = keys.default || Object.values(keys)[0];
    } catch {
      serviceKey = undefined;
    }
  }
  if (!url || !serviceKey) return fail("The server is not configured.", 500);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  let body;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.");
  }
  const action = body?.action;

  const roleExists = async (role) => {
    const { data } = await admin.from("app_roles").select("key").eq("key", role).maybeSingle();
    return Boolean(data);
  };

  const createLogin = async ({ email, fullName, role, password, mustChange }) => {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { role, full_name: fullName, must_change_password: mustChange },
    });
    if (error) {
      const msg = /already|exists|registered/i.test(error.message || "")
        ? "A login with this email already exists."
        : error.message || "Could not create the login.";
      return { error: msg };
    }
    const userId = data.user.id;
    // The database trigger creates the profile; make sure role/activation are right even if it raced.
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({ id: userId, email, full_name: fullName, role, is_active: true, must_change_password: mustChange }, { onConflict: "id" });
    if (profileError) return { error: profileError.message };
    return { userId };
  };

  // ---------------------------------------------------------------- bootstrap (first Super Admin)
  if (action === "bootstrap") {
    const expected = env.BOOTSTRAP_TOKEN || "";
    const given = req.headers.get("x-bootstrap-token") || "";
    let allowed = expected.length >= 24 && given === expected;
    if (!allowed && given.length >= 24) {
      // single-use token created in the database (see migration 20261013001300_bootstrap_token.sql)
      const { data: consumed } = await admin.rpc("consume_bootstrap_token", { p_token: given });
      allowed = consumed === true;
    }
    if (!allowed) return fail("Not allowed.", 403);
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);
    if ((count ?? 0) > 0) return fail("A Super Admin already exists. Sign in and add staff from Users.", 409);
    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.");
    const fullName = cleanText(body.full_name) || email.split("@")[0];
    const password = validPassword(body.password) ? body.password : generatePassword();
    const result = await createLogin({ email, fullName, role: "super_admin", password, mustChange: true });
    if (result.error) return fail(result.error);
    return json({ ok: true, user_id: result.userId, email, temporary_password: password });
  }

  // ---------------------------------------------------------------- everything else needs a signed-in staff member
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return fail("Please sign in again.", 401);
  const { data: who, error: whoError } = await admin.auth.getUser(token);
  if (whoError || !who?.user) return fail("Your session has expired. Please sign in again.", 401);
  const callerId = who.user.id;

  const { data: callerProfile } = await admin
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", callerId)
    .maybeSingle();
  if (!callerProfile?.is_active || !callerProfile.role) return fail("Your account is not active.", 403);
  const { data: permRows } = await admin.from("app_role_permissions").select("permission").eq("role", callerProfile.role);
  const perms = (permRows || []).map((r) => r.permission);
  const callerIsSuper = callerProfile.role === "super_admin";
  const require = (permission) => (permitted(perms, permission) ? null : fail("You do not have permission to do this.", 403));

  const loadTarget = async (userId) => {
    if (!userId || typeof userId !== "string") return { error: fail("Choose a user.") };
    const { data } = await admin.from("profiles").select("id, email, role, is_active").eq("id", userId).maybeSingle();
    if (!data) return { error: fail("User not found.", 404) };
    if (data.role === "super_admin" && !callerIsSuper) return { error: fail("Only a Super Admin can change a Super Admin account.", 403) };
    return { target: data };
  };

  if (action === "create") {
    const denied = require("users:create");
    if (denied) return denied;
    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) return fail("Enter a valid email address.");
    const role = String(body.role || "");
    if (!(await roleExists(role))) return fail("Choose a role.");
    if (role === "super_admin" && !callerIsSuper) return fail("Only a Super Admin can create another Super Admin.", 403);
    const fullName = cleanText(body.full_name);
    if (!fullName || fullName.length < 2) return fail("Enter the person's full name.");
    const password = body.password ? String(body.password) : generatePassword();
    if (!validPassword(password)) return fail("The password must be 10–72 characters.");
    const result = await createLogin({ email, fullName, role, password, mustChange: true });
    if (result.error) return fail(result.error);
    const extra = {
      job_title: cleanText(body.job_title),
      phone: cleanText(body.phone, 32),
      department: cleanText(body.department),
      teacher_id: body.teacher_id || null,
    };
    const { error: extraError } = await admin.from("profiles").update(extra).eq("id", result.userId);
    if (extraError) return json({ ok: true, user_id: result.userId, temporary_password: password, warning: extraError.message });
    return json({ ok: true, user_id: result.userId, temporary_password: password });
  }

  if (action === "reset_password") {
    const denied = require("users:update");
    if (denied) return denied;
    const { target, error } = await loadTarget(body.user_id);
    if (error) return error;
    const password = body.password ? String(body.password) : generatePassword();
    if (!validPassword(password)) return fail("The password must be 10–72 characters.");
    const { error: updError } = await admin.auth.admin.updateUserById(target.id, { password });
    if (updError) return fail(updError.message);
    await admin.from("profiles").update({ must_change_password: target.id !== callerId }).eq("id", target.id);
    return json({ ok: true, temporary_password: password });
  }

  if (action === "set_active") {
    const denied = require("users:update");
    if (denied) return denied;
    const { target, error } = await loadTarget(body.user_id);
    if (error) return error;
    if (target.id === callerId) return fail("You cannot disable your own account.");
    const active = Boolean(body.active);
    if (active && !target.role) return fail("Give the user a role before enabling the login.");
    const { error: banError } = await admin.auth.admin.updateUserById(target.id, { ban_duration: active ? "none" : "876000h" });
    if (banError) return fail(banError.message);
    const { error: updError } = await admin.from("profiles").update({ is_active: active }).eq("id", target.id);
    if (updError) return fail(updError.message);
    return json({ ok: true });
  }

  if (action === "update") {
    const denied = require("users:update");
    if (denied) return denied;
    const { target, error } = await loadTarget(body.user_id);
    if (error) return error;
    const patch = {};
    if (body.role !== undefined && body.role !== target.role) {
      if (target.id === callerId) return fail("You cannot change your own role.");
      if (!(await roleExists(String(body.role)))) return fail("Choose a role.");
      if (body.role === "super_admin" && !callerIsSuper) return fail("Only a Super Admin can grant Super Admin.", 403);
      patch.role = body.role;
    }
    for (const key of ["full_name", "job_title", "department"]) {
      if (body[key] !== undefined) patch[key] = cleanText(body[key]) ?? (key === "full_name" ? target.email : null);
    }
    if (body.phone !== undefined) patch.phone = cleanText(body.phone, 32);
    if (body.teacher_id !== undefined) patch.teacher_id = body.teacher_id || null;
    if (Object.keys(patch).length === 0) return json({ ok: true });
    const { error: updError } = await admin.from("profiles").update(patch).eq("id", target.id);
    if (updError) {
      const msg = /profiles_teacher_unique/.test(updError.message) ? "That teacher is already linked to another login." : updError.message;
      return fail(msg);
    }
    if (patch.role) {
      await admin.auth.admin.updateUserById(target.id, { app_metadata: { role: patch.role } });
    }
    return json({ ok: true });
  }

  if (action === "delete") {
    const denied = require("users:delete");
    if (denied) return denied;
    const { target, error } = await loadTarget(body.user_id);
    if (error) return error;
    if (target.id === callerId) return fail("You cannot delete your own account.");
    const { error: delError } = await admin.auth.admin.deleteUser(target.id);
    if (delError) return fail(delError.message);
    return json({ ok: true });
  }

  return fail("Unknown action.");
}
