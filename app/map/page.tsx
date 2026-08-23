import Link from "next/link";
import {ExternalLink,MapPin} from "lucide-react";
import {PageHero} from "@/components/page-hero";

export default function Page(){return <>
  <PageHero eyebrow="Find your way" title="Explore the map" text="Orient yourself in Heber-Overgaard, then browse the guide for local places and turn-by-turn directions."/>
  <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
    <div className="overflow-hidden rounded-[2rem] border border-pine/10 bg-white shadow-soft">
      <iframe title="Map of Heber-Overgaard, Arizona" src="https://www.google.com/maps?q=Heber-Overgaard%2C%20Arizona&z=13&output=embed" className="h-[58vh] min-h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex gap-3"><MapPin className="mt-1 shrink-0 text-forest"/><p className="leading-7 text-ink/65">Select a business or attraction in the guide for its exact address and directions. Forest roads and recreation access can be seasonal, so check current conditions before leaving the highway.</p></div>
      <a href="https://www.google.com/maps/search/?api=1&query=Heber-Overgaard%2C%20Arizona" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-pine px-5 py-4 font-bold text-cream">Open Google Maps <ExternalLink size={17}/></a>
    </div>
    <div className="mt-8 flex flex-wrap gap-3">{[["Things to do","/things-to-do"],["Food & drink","/businesses?category=Restaurants"],["Shopping","/businesses?category=Shopping"],["Trails","/trails"],["Places to stay","/stay"],["Visitor essentials","/visitor-info"]].map(([label,href])=><Link className="rounded-full bg-white px-4 py-3 text-sm font-bold shadow-soft" href={href} key={label}>{label}</Link>)}</div>
  </section>
</>}
