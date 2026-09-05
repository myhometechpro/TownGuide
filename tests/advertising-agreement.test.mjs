import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public terms omit the internal attorney reminder and show the current policy", async () => {
  const terms = await read("app/advertising-terms/page.tsx");
  assert.doesNotMatch(terms, /terms should be reviewed by an Arizona attorney before accepting paid advertising/i);
  assert.match(terms, /first 3 calendar days/);
  assert.match(terms, /not automatically guaranteed/);
  assert.match(terms, /within 6 months/);
  assert.match(terms, /full-refund policy/);
});

test("agreement delivery is immutable, idempotent, and retryable", async () => {
  const migration = await read("supabase/migrations/015_advertising_agreement_delivery.sql");
  const delivery = await read("lib/advertising-agreement.ts");
  assert.match(migration, /agreement_snapshot text not null/);
  assert.match(migration, /delivery_key text not null unique/);
  assert.match(migration, /retry_of uuid references/);
  assert.match(delivery, /insertError\?\.code === "23505"/);
  assert.match(delivery, /status: "pending"/);
  assert.match(delivery, /status === "sent"/);
});

test("agreement records and retries remain admin-only", async () => {
  const migration = await read("supabase/migrations/015_advertising_agreement_delivery.sql");
  const action = await read("app/admin/advertising/actions.ts");
  assert.match(migration, /enable row level security/);
  assert.match(migration, /admins read agreement deliveries/);
  assert.doesNotMatch(migration, /public (reads|inserts|updates).*agreement/i);
  assert.match(action, /requireAdmin\(\)/);
  assert.match(action, /Only a failed agreement delivery can be retried/);
});

test("legacy campaigns load without agreement tracking values", async () => {
  const model = await read("lib/advertising.ts");
  assert.match(model, /agreement_version:string\|null/);
  assert.match(model, /agreement_accepted_at:string\|null/);
});
