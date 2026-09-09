import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=(path)=>readFile(new URL(path,import.meta.url),"utf8");

test("customer submissions are separated from public advertisement copy",async()=>{
  const route=await read("../app/api/advertising-requests/route.ts");
  assert.match(route,/ad_copy:message,customer_request:customerRequest/);
  assert.doesNotMatch(route,/ad_copy:adCopy/);
});

test("legacy private details are removed from public ad copy",async()=>{
  const migration=await read("../supabase/migrations/017_private_advertising_requests.sql");
  assert.match(migration,/customer_request = coalesce\(customer_request, ad_copy\)/);
  assert.match(migration,/ad_copy = nullif\(btrim\(split_part/);
  assert.match(migration,/approved = false/);
  assert.match(migration,/drop policy if exists "public reads live ad campaigns"/);
});

test("campaign approval requires public advertisement text",async()=>{
  const actions=await read("../app/admin/advertising/actions.ts");
  assert.match(actions,/Public advertisement text is required before a campaign can be approved or activated/);
});
