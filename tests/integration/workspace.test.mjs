/* global fetch, AbortSignal, process, setTimeout, clearTimeout */
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { createClient } from "@supabase/supabase-js";

// Discover only this checkout's disposable stack. Never read hosted environment files.
const status = JSON.parse(execFileSync("node_modules/.bin/supabase", ["status", "-o", "json"], {
  stdio: ["ignore", "pipe", "pipe"], encoding: "utf8",
}));
assert.equal(status.API_URL, "http://127.0.0.1:54621");
assert.ok(status.PUBLISHABLE_KEY?.startsWith("sb_publishable_"));
const settings = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const client = (key = status.PUBLISHABLE_KEY) => createClient(status.API_URL, key, settings);
// The local administrator is used only to revoke/restore a synthetic membership.
const admin = client(status.SERVICE_ROLE_KEY);
const company = (n) => `61000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const facility = (n) => `62000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const clientAId = "60000000-0000-4000-8000-000000000003";
const base = "http://127.0.0.1:3421";
const users = {};
let server;
let org;

async function api(user, resource, method = "GET", body) {
  const response = await fetch(`${base}/api/v1/${resource}`, {
    method, signal: AbortSignal.timeout(30000),
    headers: { "Content-Type": "application/json", ...(user ? { Authorization: `Bearer ${users[user].token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json(), cache: response.headers.get("cache-control") };
}
async function rows(user, table) {
  const result = await users[user].db.from(table).select("*");
  assert.equal(result.error, null);
  return result.data.filter((row) => !("archived_at" in row) || row.archived_at === null);
}
before(async () => {
  // Refuse to claim or terminate an existing preview on the integration port.
  const occupied = await fetch(`${base}/api/v1/organizations`).then(() => true, () => false);
  assert.equal(occupied, false, "Port 3421 must be free");
  for (const name of ["owner-a", "owner-b", "client-a", "client-b"]) {
    const db = client();
    const result = await db.auth.signInWithPassword({ email: `${name}@ambientis.test`, password: "Ambientis-local-only-2026!" });
    assert.equal(result.error, null, `Synthetic sign-in failed: ${name}`);
    users[name] = { db, token: result.data.session.access_token };
  }
  org = (await rows("owner-a", "organizations"))[0].id;
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3421"], {
    // These settings override any ignored hosted .env.local, without rewriting it.
    env: { ...process.env, NODE_ENV: "development", AMBIENTIS_INTEGRATION: "true", NEXT_TELEMETRY_DISABLED: "1", SUPABASE_LOCAL_MODE: "true", SUPABASE_URL: status.API_URL, SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY },
    stdio: "ignore",
  });
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error("Integration app exited before readiness");
    try { if ((await api(null, "organizations")).status === 401) return; } catch { /* Server is still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Integration app did not become ready");
}, { timeout: 150000 });
after(async () => {
  if (org) {
    const restored = await admin.from("organization_members").update({ active: true }).eq("organization_id", org).eq("user_id", clientAId);
    assert.equal(restored.error, null);
  }
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill("SIGTERM");
    const timer = setTimeout(() => server.kill("SIGKILL"), 10000);
    await exited;
    clearTimeout(timer);
  }
});

test("anonymous and forged-token requests cannot read records", async () => {
  assert.equal((await api(null, "organizations")).status, 401);
  const response = await fetch(`${base}/api/v1/organizations`, { headers: { Authorization: "Bearer forged-token" } });
  assert.equal(response.status, 401);
  assert.equal((await client().from("companies").select("*")).error?.code, "42501");
});
test("real Auth tokens isolate two consultancies and two clients in one consultancy", async () => {
  const owned = await rows("owner-a", "companies");
  assert.ok(owned.every((r) => r.organization_id === org));
  assert.ok([company(1), company(2)].every((id) => owned.some((r) => r.id === id)));
  assert.deepEqual((await rows("owner-b", "companies")).map((r) => r.id), [company(3)]);
  assert.deepEqual((await rows("client-a", "companies")).map((r) => r.id), [company(1)]);
  assert.deepEqual((await rows("client-b", "companies")).map((r) => r.id), [company(2)]);
  const response = await api("client-a", `companies?organization_id=${org}`);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data.map((r) => r.id), [company(1)]);
  assert.match(response.cache, /private, no-store/);
  assert.deepEqual((await api("owner-b", `companies?organization_id=${org}`)).body.data, []);
});
test("internal requirements, contacts, draft requests and audit remain hidden", async () => {
  const process = "63000000-0000-4000-8000-000000000001";
  const requirement = "64000000-0000-4000-8000-000000000001";
  const db = users["owner-a"].db;
  // Requests and private contacts intentionally remain synthetic local fixtures.
  const contact = await db.from("company_contacts").insert({ organization_id: org, company_id: company(1), name: "Synthetic private contact", email: `${randomUUID()}@ambientis.test` }).select().single();
  assert.equal(contact.error, null);
  for (const state of ["draft", "sent"]) {
    const result = await db.from("document_requests").insert({ organization_id: org, facility_id: facility(1), process_id: process, requirement_id: requirement, message: "Synthetic request", status: state }).select().single();
    assert.equal(result.error, null);
  }
  assert.equal((await rows("client-a", "requirements")).length, 1);
  assert.equal((await rows("client-b", "requirements")).length, 0);
  assert.deepEqual(await rows("client-a", "company_contacts"), []);
  assert.deepEqual(await rows("client-a", "audit_events"), []);
  const sharedRequests = await rows("client-a", "document_requests");
  assert.ok(sharedRequests.length > 0);
  assert.ok(sharedRequests.every((r) => r.status === "sent"));
  assert.ok((await rows("owner-a", "document_requests")).some((r) => r.status === "draft"));
});
test("direct Data API denies escalation, cross-tenant references and audit rewrites", async () => {
  const a = users["owner-a"].db;
  const b = users["owner-b"].db;
  const orgB = (await rows("owner-b", "organizations"))[0].id;
  assert.equal((await users["client-a"].db.from("organization_members").update({ role: "owner" }).eq("user_id", clientAId)).error?.code, "42501");
  assert.equal((await b.from("facilities").insert({ organization_id: orgB, company_id: company(1), name: "Forbidden", sector: "gases", state: "GO", city: "Goiânia" })).error?.code, "23503");
  assert.equal((await a.from("companies").update({ organization_id: orgB }).eq("id", company(1))).error?.code, "42501");
  assert.equal((await a.from("processes").update({ status: "approved", version: 2 }).eq("id", "63000000-0000-4000-8000-000000000001")).error?.code, "23514");
  assert.equal((await a.from("audit_events").update({ operation: "forged" }).eq("organization_id", org)).error?.code, "42501");
  const result = await api("client-a", "companies", "POST", { organization_id: org, name: "Forbidden", sector: "other" });
  assert.equal(result.status, 403);
});
test("membership revocation takes effect even for an already-issued token", async () => {
  assert.equal((await api("client-a", `companies?organization_id=${org}`)).body.data.length, 1);
  try {
    assert.equal((await admin.from("organization_members").update({ active: false }).eq("organization_id", org).eq("user_id", clientAId)).error, null);
    assert.deepEqual(await rows("client-a", "companies"), []);
    assert.deepEqual((await api("client-a", `companies?organization_id=${org}`)).body.data, []);
  } finally {
    assert.equal((await admin.from("organization_members").update({ active: true }).eq("organization_id", org).eq("user_id", clientAId)).error, null);
  }
});
test("API preserves server authorship and rejects a stale concurrent revision", async () => {
  const created = await api("owner-a", "companies", "POST", { organization_id: org, name: "Synthetic concurrency fixture", sector: "other" });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.created_by, "60000000-0000-4000-8000-000000000001");
  const change = { id: created.body.data.id, organization_id: org, version: 1, changes: { name: "Synthetic edited fixture" } };
  const results = await Promise.all([api("owner-a", "companies", "PATCH", change), api("owner-a", "companies", "PATCH", change)]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  assert.equal((await users["owner-a"].db.from("companies").update({ archived_at: new Date().toISOString(), version: 3 }).eq("id", change.id)).error, null);
  const bootstrap = await api("owner-a", "organizations", "POST", { name: "Retry" });
  assert.equal(bootstrap.status, 201);
  assert.equal(bootstrap.body.data.id, org);
});
