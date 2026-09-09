import {requireAdmin} from "@/lib/supabase/auth";

export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{id:string}>}){
  const {id}=await params,{db}=await requireAdmin();
  const {data}=await db.from("ad_campaigns").select("customer_request").eq("id",id).maybeSingle();
  return <>{data?.customer_request&&<section className="mx-auto mt-10 max-w-4xl border border-amber-400/40 bg-amber-50 p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-amber-800">Private — never displayed publicly</p><h2 className="mt-2 font-display text-2xl">Original customer request</h2><pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-ink/75">{data.customer_request}</pre></section>}{children}</>;
}
