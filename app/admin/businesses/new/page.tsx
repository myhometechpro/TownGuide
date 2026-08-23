import Link from "next/link";
import { getSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminBusinessForm } from "@/components/admin-business-form";
import { saveBusiness } from "../actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ inquiry?: string }> }) {
  const db = await getSupabase();
  if (db) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) redirect("/admin/login");
  }
  const { inquiry: inquiryId } = await searchParams;
  const { data: inquiry } = inquiryId && db
    ? await db.from("business_inquiries").select("business_name,phone,website,category,message").eq("id", inquiryId).maybeSingle()
    : { data: null };
  const defaults = inquiry ? {
    name: inquiry.business_name,
    phone: inquiry.phone || "",
    website: inquiry.website || "",
    category: inquiry.category || "Other",
    shortDescription: String(inquiry.message || "").slice(0, 180),
    description: inquiry.message || "",
    active: true,
  } : undefined;

  return <section className="mx-auto max-w-4xl px-5 py-12">
    <Link href={inquiryId ? "/admin/inquiries" : "/admin/businesses"} className="text-sm font-bold text-forest">← {inquiryId ? "Listing requests" : "Businesses"}</Link>
    <h1 className="mt-5 font-display text-4xl">Add a business</h1>
    {inquiryId && <p className="mt-3 border border-purple-300/30 bg-purple-900/30 p-4 font-bold text-purple-100">This form was opened from a listing request. Saving it will mark that request Resolved and Closed.</p>}
    <AdminBusinessForm business={defaults} inquiryId={inquiryId} action={saveBusiness} connected={!!db}/>
  </section>;
}
