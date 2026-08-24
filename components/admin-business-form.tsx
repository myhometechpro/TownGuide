import Link from "next/link";
import type {Business} from "@/types";

const categories=["Restaurants","Coffee","Lodging","Shopping","Outdoor & Adventure","Automotive","Professional Services","Health & Wellness","Entertainment","Real Estate","Home Services","Other"];

export function AdminBusinessForm({business,inquiryId,action,connected=true}:{business?:Partial<Business>;inquiryId?:string;action:(formData:FormData)=>void|Promise<void>;connected?:boolean}){
  const field="mt-2 h-12 w-full border border-cream/20 bg-[#202a24] px-3 text-cream",editing=Boolean(business?.id);
  return <form action={action} className="mt-8 grid gap-5 border border-cream/10 bg-white p-6 md:grid-cols-2">
    <input type="hidden" name="id" value={business?.id||""}/><input type="hidden" name="inquiry_id" value={inquiryId||""}/>
    <label className="text-sm font-bold">Business name<input className={field} name="name" defaultValue={business?.name} required/></label>
    <label className="text-sm font-bold">URL name (slug)<input className={field} name="slug" defaultValue={business?.slug} placeholder="created-from-name-if-blank"/></label>
    <label className="text-sm font-bold">Category<select className={field} name="category" defaultValue={business?.category||"Other"}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="text-sm font-bold">Phone<input className={field} name="phone" defaultValue={business?.phone}/></label>
    <label className="text-sm font-bold md:col-span-2">Address<input className={field} name="address" defaultValue={business?.address}/></label>
    <label className="text-sm font-bold md:col-span-2">Website<input className={field} type="url" name="website" defaultValue={business?.website}/></label>
    <fieldset className="grid gap-4 border border-forest/25 bg-forest/5 p-4 md:col-span-2 md:grid-cols-2">
      <legend className="px-2 font-bold">Operating hours</legend>
      <label className="text-sm font-bold md:col-span-2">Published schedule<textarea className="mt-2 min-h-28 w-full border border-cream/20 bg-[#202a24] p-3 text-cream" name="hours" placeholder={"Mon–Fri: 8 AM–5 PM\nSat: 9 AM–4 PM\nSun: Closed"} defaultValue={business?.hours}/></label>
      <label className="text-sm font-bold">Source URL<input className={field} type="url" name="hours_source" defaultValue={business?.hoursSource}/></label>
      <label className="text-sm font-bold">Last verified<input className={field} type="date" name="hours_verified_at" defaultValue={business?.hoursVerifiedAt}/></label>
      <p className="text-xs text-ink/55 md:col-span-2">Leave the schedule blank when reliable public hours cannot be confirmed. Visitors will be told to verify directly.</p>
    </fieldset>
    <label className="text-sm font-bold md:col-span-2">Short directory description<input className={field} name="short_description" defaultValue={business?.shortDescription} maxLength={180}/></label>
    <label className="text-sm font-bold md:col-span-2">Full description<textarea className="mt-2 min-h-32 w-full border border-cream/20 bg-[#202a24] p-3 text-cream" name="description" defaultValue={business?.description}/></label>
    <label className="flex items-center gap-3 text-sm font-bold"><input className="h-5 w-5" type="checkbox" name="active" defaultChecked={business?.active!==false}/>Published on directory</label>
    <label className="flex items-start gap-3 border border-forest/30 bg-forest/10 p-4 text-sm font-bold md:col-span-2"><input className="mt-0.5 h-5 w-5" type="checkbox" name="create_qr_sign" defaultChecked={!editing}/><span>Create a tracked QR sign after saving<span className="mt-1 block text-xs font-normal text-ink/60">Uses the official Heber-Overgaard sign template and opens it in QR tools for downloading.</span></span></label>
    <div className="flex justify-end gap-3 md:col-span-2"><Link href={inquiryId?"/admin/inquiries":"/admin/businesses"} className="border border-cream/20 px-5 py-3 font-bold">Cancel</Link><button disabled={!connected} className="bg-pine px-5 py-3 font-bold text-cream disabled:cursor-not-allowed disabled:opacity-40">{editing?"Save changes":"Add business"}</button></div>
  </form>
}
