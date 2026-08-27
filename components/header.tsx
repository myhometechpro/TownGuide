"use client";

import Link from "next/link";
import {Menu,Mountain} from "lucide-react";
import {usePathname} from "next/navigation";
import {useEffect,useRef} from "react";

const links=[["Explore","/things-to-do"],["Eat & Drink","/businesses?category=Restaurants"],["Trails","/trails"],["Events","/events"],["Stay","/stay"],["History","/history"],["Visitor Info","/visitor-info"]];

export function Header(){const menu=useRef<HTMLDetailsElement>(null),pathname=usePathname();const closeMenu=()=>menu.current?.removeAttribute("open");useEffect(closeMenu,[pathname]);return <header className="sticky top-0 z-40 border-b border-cream/10 bg-pine/95 text-cream backdrop-blur">
  <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
    <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg"><Mountain size={28} className="text-forest"/><span className="leading-tight"><b className="block font-display text-base md:text-lg">Welcome to</b><span className="text-sm tracking-wide text-forest">HEBER-OVERGAARD</span></span></Link>
    <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">{links.map(([label,href])=><Link className="focus-ring rounded text-sm font-semibold hover:text-forest" href={href} key={label}>{label}</Link>)}<Link href="/contact?interest=Free%20Listing" className="border border-cream/30 px-5 py-3 font-bold hover:bg-white">Add your business</Link></nav>
    <details ref={menu} className="group relative lg:hidden">
      <summary className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded-lg border border-cream/20 px-3 py-2 font-bold [&::-webkit-details-marker]:hidden"><Menu size={20}/><span className="text-sm">Menu</span></summary>
      <nav aria-label="Mobile primary" className="absolute right-0 top-[calc(100%+12px)] grid w-72 gap-1 border border-cream/15 bg-pine p-3 shadow-2xl">{links.map(([label,href])=><Link onClick={closeMenu} className="px-4 py-3 font-semibold hover:bg-white hover:text-pine" href={href} key={label}>{label}</Link>)}<Link onClick={closeMenu} href="/contact?interest=Free%20Listing" className="mt-2 bg-cream px-4 py-4 text-center font-black text-pine">Add your business</Link></nav>
    </details>
  </div>
</header>}
