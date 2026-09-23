import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

test("events persist and display an optional end time",()=>{
  assert.match(read("supabase/migrations/019_event_end_time.sql"),/add column if not exists end_time time/);
  assert.match(read("components/admin-content-forms.tsx"),/name="end_time"/);
  assert.match(read("app/admin/content-actions.ts"),/end_time:String\(f\.get\("end_time"\)/);
  assert.match(read("lib/content.ts"),/endTime:r\.end_time\|\|undefined/);
  assert.match(read("components/cards.tsx"),/item\.endTime/);
  assert.ok(read("components/cards.tsx").includes('return `${hour}:${String(minutes).padStart(2,"0")} ${suffix}`'));
  assert.ok(read("components/cards.tsx").includes('`${start} - ${formatEventTime(item.endTime)}`'));
});
