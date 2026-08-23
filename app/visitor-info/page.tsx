import type {Metadata} from "next";
import Link from "next/link";
import {BellRing,CloudSun,ExternalLink,Flame,Fuel,Hospital,ShoppingBasket,TreePine,TriangleAlert} from "lucide-react";
import {PageHero} from "@/components/page-hero";

export const metadata:Metadata={title:"Visitor Information"};

const resources=[
  {Icon:CloudSun,title:"Weather forecast",text:"Current conditions and the official National Weather Service forecast for Heber-Overgaard.",label:"View NWS forecast",href:"https://forecast.weather.gov/MapClick.php?CityName=Heber-Overgaard&e=0&site=FGZ&state=AZ&textField1=34.414&textField2=-110.569",external:true},
  {Icon:TriangleAlert,title:"Road conditions",text:"Check crashes, closures, construction, cameras, weather alerts, and conditions on AZ-260.",label:"Open AZ511",href:"https://www.az511.gov/",external:true},
  {Icon:Flame,title:"Fire restrictions",text:"See current restrictions across federal and Arizona state-managed lands before using flame or equipment.",label:"Check restrictions",href:"https://wildlandfire.az.gov/fire-restrictions",external:true},
  {Icon:TreePine,title:"Forest alerts & closures",text:"Review active Apache–Sitgreaves National Forest road, trail, recreation-site, and emergency closures.",label:"View forest alerts",href:"https://www.fs.usda.gov/r03/apache-sitgreaves/alerts",external:true},
  {Icon:BellRing,title:"Emergency notifications",text:"Visitors can register for Navajo County phone, text, or email warnings and evacuation instructions.",label:"Ready Navajo County",href:"https://www.navajocountyaz.gov/282/Ready-Navajo-County-Notification-System",external:true},
  {Icon:Flame,title:"Local burn information",text:"For local fire conditions and open-flame guidance, call the Heber-Overgaard Fire District Burn Line: (928) 535-6709.",label:"Fire District information",href:"https://hofdaz.com/contact-us",external:true},
  {Icon:Fuel,title:"Fuel & supplies",text:"Find local gas, convenience stores, auto services, and other roadside essentials in the directory.",label:"Browse local businesses",href:"/businesses",external:false},
  {Icon:ShoppingBasket,title:"Groceries & provisions",text:"Find local markets and shops where you can stock up for a cabin, campsite, or day outdoors.",label:"Browse shopping",href:"/businesses?category=Shopping",external:false},
] as const;

export default function Page(){return <>
  <PageHero eyebrow="Know before you go" title="Visitor essentials" text="Quick links for planning a safe, comfortable high-country visit. Conditions can change quickly, so check the official sources before heading out."/>
  <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{resources.map(({Icon,title,text,label,href,external})=><Link href={href} target={external?"_blank":undefined} rel={external?"noreferrer":undefined} className="group flex min-h-64 flex-col rounded-3xl bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg" key={title}>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-sky/25 text-forest"><Icon size={23}/></span>
      <h2 className="mt-5 font-display text-xl">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink/60">{text}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-forest">{label}{external&&<ExternalLink size={14}/>}</span>
    </Link>)}</div>
    <div className="mt-8 flex gap-3 rounded-2xl border border-red-900/20 bg-red-950/10 p-5 text-sm leading-6"><Hospital className="shrink-0 text-red-800"/><p><strong>For an emergency, call 911.</strong> Do not rely on this guide for emergency notices. For non-emergency Fire District questions, call <a className="font-bold underline" href="tel:+19285354346">(928) 535-4346</a>.</p></div>
    <p className="mt-6 text-xs leading-5 text-ink/55">This independent visitor guide links to third-party and government resources for convenience. Conditions, restrictions, and closures can change without notice. Always follow posted orders and instructions from public-safety officials and land managers.</p>
  </section>
</>}
