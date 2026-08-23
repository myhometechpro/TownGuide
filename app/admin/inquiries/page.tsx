import Link from "next/link";
import { getSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateInquiry } from "../content-actions";

const statusStyles: Record<string, string> = {
  new: "bg-sky-900/50 text-sky-100 border-sky-300/30",
  reviewing: "bg-purple-900/50 text-purple-100 border-purple-300/30",
  resolved: "bg-emerald-900/50 text-emerald-100 border-emerald-300/30",
  declined: "bg-red-950/50 text-red-100 border-red-300/30",
};

export default async function Page() {
  const db = await getSupabase();
  if (!db) redirect("/admin");
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data = [] } = await db.from("business_inquiries").select("*").order("created_at", { ascending: false });

  return <section className="mx-auto max-w-5xl px-5 py-12">
    <Link href="/admin" className="text-sm font-bold text-forest">← Dashboard</Link>
    <h1 className="mt-6 font-display text-4xl">Listing requests &amp; corrections</h1>
    <p className="mb-6 mt-3 text-ink/60">Set a request to Reviewing to open the business editor. Saving the business automatically resolves the request.</p>
    {!data?.length ? <p className="bg-white p-8">No requests have arrived yet.</p> : <div className="space-y-4">{data.map((inquiry) => {
      const closed = inquiry.status === "resolved" || inquiry.status === "declined";
      return <article className="bg-white p-6" key={inquiry.id}>
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${closed ? "border-slate-300/30 bg-slate-800/60 text-slate-200" : "border-teal-300/30 bg-teal-900/50 text-teal-100"}`}>{closed ? "Closed" : "Open"}</span>
              <span className={`border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${statusStyles[inquiry.status] || statusStyles.new}`}>{String(inquiry.status).replace("_", " ")}</span>
            </div>
            <h2 className="mt-3 font-display text-2xl">{inquiry.business_name}</h2>
            <p className="mt-1 text-sm">{inquiry.interest} · {inquiry.contact_name} · <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></p>
          </div>
          <form action={updateInquiry} className="flex items-center gap-2">
            <input type="hidden" name="id" value={inquiry.id}/>
            <select name="status" defaultValue={inquiry.status} className="h-11 border border-cream/20 px-3">
              {["new", "reviewing", "resolved", "declined"].map((status) => <option value={status} key={status}>{status.replace("_", " ")}</option>)}
            </select>
            <button className="border border-cream/20 px-4 py-2 font-bold">Update</button>
          </form>
        </div>
        {inquiry.message && <p className="mt-5 border-t border-cream/10 pt-5 text-sm leading-6">{inquiry.message}</p>}
      </article>;
    })}</div>}
  </section>;
}
