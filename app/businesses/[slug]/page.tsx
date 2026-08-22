import {notFound} from "next/navigation";
import {Clock,ExternalLink,MapPin,Phone} from "lucide-react";
import {businesses,deals} from "@/lib/data";
import {getBusiness} from "@/lib/businesses";
import {getLiveAds} from "@/lib/advertising";
import {DealCard} from "@/components/cards";
import {SponsoredPlacement} from "@/components/sponsored-placement";

export function generateStaticParams(){return businesses.map(b=>({slug:b.slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,b=await getBusiness(slug);if(!b)notFound();
  const current=deals.filter(d=>d.businessId===b.id),enhanced=await getLiveAds("business_profile",b.id);
  return <><section className="border-b border-cream/10 bg-pine"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><p className="text-sm font-bold uppercase tracking-wider text-forest">{b.category} · Free directory listing</p><h1 className="mt-3 max-w-3xl font-display text-4xl text-cream md:text-6xl">{b.name}</h1></div></section>
  {enhanced.length>0&&<section className="mx-auto max-w-7xl px-5 pt-12 lg:px-8"><SponsoredPlacement campaign={enhanced[0]} compact/></section>}
  <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr] lg:px-8"><div><h2 className="font-display text-3xl">About</h2><p className="mt-5 text-lg leading-8 text-ink/70">{b.description}</p><div className="mt-8 flex flex-wrap gap-3">{b.phone&&<a href={`tel:${b.phone}`} className="inline-flex min-h-12 items-center gap-2 border border-cream/20 bg-pine px-5 font-bold text-cream"><Phone size={18}/> Call</a>}{b.website&&<a href={b.website} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 border border-cream/20 px-5 font-bold"><ExternalLink size={18}/> Website</a>}{b.address&&<a href={`https://maps.google.com/?q=${encodeURIComponent(b.address)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 border border-cream/20 px-5 font-bold"><MapPin size={18}/> Directions</a>}</div>{current.length>0&&<div className="mt-14"><h2 className="mb-5 font-display text-3xl">Current deals</h2>{current.map(x=><DealCard item={x} business={b} key={x.id}/>)}</div>}</div><aside className="h-fit border border-cream/10 bg-white p-6"><h2 className="font-display text-2xl">Listing details</h2><div className="mt-5 space-y-5 text-sm">{b.address&&<p className="flex gap-3"><MapPin className="shrink-0 text-forest" size={20}/>{b.address}</p>}{b.phone&&<p className="flex gap-3"><Phone className="shrink-0 text-forest" size={20}/>{b.phone}</p>}<p className="flex gap-3"><Clock className="shrink-0 text-forest" size={20}/>Hours can change — verify directly</p></div><p className="mt-6 border-t border-cream/10 pt-5 text-xs leading-5 text-ink/55">This is a free informational directory listing. Details can change; confirm hours, services, and availability directly.</p></aside></section></>
}
