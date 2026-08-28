import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {getSupabase} from "@/lib/supabase/server";
import {rowToBusiness} from "@/lib/businesses";
import {AdminBusinessForm} from "@/components/admin-business-form";
import {DeleteBusinessButton} from "@/components/delete-business-button";
import {saveBusiness} from "../actions";

export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{inquiry?:string}>}){
  const db=await getSupabase();if(!db)redirect("/admin/businesses");
  const {data:{user}}=await db.auth.getUser();if(!user)redirect("/admin/login");
  const [{id},{inquiry}]=await Promise.all([params,searchParams]);
  const {data}=await db.from("businesses").select("id,name,slug,category,short_description,description,address,phone,email,website,image_url,latitude,longitude,location_type,lodging_type,hours_json,displaying_qr_sign,featured,sponsored,active").eq("id",id).maybeSingle();
  if(!data)notFound();
  return <section className="mx-auto max-w-4xl px-5 py-12"><Link href={inquiry?"/admin/inquiries":"/admin/businesses"} className="text-sm font-bold text-forest">← {inquiry?"Listing requests":"Businesses"}</Link><h1 className="mt-5 font-display text-4xl">Edit business</h1>{inquiry&&<p className="mt-3 border border-purple-300/30 bg-purple-900/30 p-4 font-bold text-purple-100">This correction was opened from a listing request. Saving it will mark that request Resolved and Closed.</p>}<AdminBusinessForm business={rowToBusiness(data)} inquiryId={inquiry} action={saveBusiness} deleteControl={<DeleteBusinessButton id={data.id} name={data.name}/>}/></section>
}
