import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const source=await readFile(new URL("../lib/request-security.ts",import.meta.url),"utf8");

test("same-origin checks account for reverse-proxy hosts",()=>{
  assert.match(source,/\["host","x-forwarded-host"\]/);
  assert.match(source,/requestHosts\(request\)\.has\(new URL\(origin\)\.host\.toLowerCase\(\)\)/);
});

test("origin protection still rejects hosts outside the trusted request hosts",()=>{
  assert.match(source,/Cross-site request rejected/);
  assert.doesNotMatch(source,/endsWith\(/);
});
