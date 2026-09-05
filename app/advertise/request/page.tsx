import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { AdvertisingRequestForm } from "@/components/advertising-request-form";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { AdProduct } from "@/lib/advertising";

export const metadata: Metadata = { title: "Advertise Your Business", description: "Request a clearly labeled advertising campaign in the Heber-Overgaard visitor guide." };

export default async function Page() {
  const db = getAdminSupabase();
  const { data } = db ? await db.from("ad_products").select("*").eq("active", true).order("price_cents") : { data: [] };
  const products = (data || []) as AdProduct[];
  return <>
    <PageHero eyebrow="Reach local visitors" title="Advertise your business" text="Tell us what you would like to promote. Your request creates a private draft for review—nothing is published or billed automatically."/>
    <section className="mx-auto max-w-4xl px-5 py-14">
      {products.length ? <AdvertisingRequestForm products={products}/> : <div className="border border-cream/10 bg-white p-8"><h2 className="font-display text-2xl">Advertising requests are temporarily unavailable.</h2><p className="mt-3">Advertising packages are being updated. Please return soon to submit a paid-placement request.</p><Link href="/advertise" className="mt-5 inline-block bg-pine px-5 py-3 font-bold text-cream">View advertising examples</Link></div>}
      <p className="mt-5 text-sm leading-6 text-ink/60">Submitting a request does not create a contract or guarantee placement. We will confirm content, dates, pricing, approval, and payment before an advertisement runs.</p>
    </section>
  </>;
}
