"use client";

import { useMemo, useState } from "react";
import type { AdProduct } from "@/lib/advertising";

type State = "idle" | "sending" | "sent" | "saved_no_email" | "error";

export function AdvertisingRequestForm({ products }: { products: AdProduct[] }) {
  const [state, setState] = useState<State>("idle");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [term, setTerm] = useState<"full" | "half">("full");
  const product = useMemo(() => products.find((item) => item.id === productId), [products, productId]);
  const price = term === "half" ? product?.half_price_cents : product?.price_cents;
  const days = term === "half" ? 14 : product?.duration_days;
  const input = "focus-ring mt-2 h-12 w-full border border-cream/20 bg-white px-3 font-normal";
  const [submissionId] = useState(() => crypto.randomUUID());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/advertising-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { emailSent?: boolean };
      setState(response.ok ? (result.emailSent ? "sent" : "saved_no_email") : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") return <div className="border border-forest/30 bg-white p-10 text-center"><h2 className="font-display text-3xl">Thank you for reaching out.</h2><p className="mt-3">Your advertising request was received. We sent you a confirmation email and will follow up after reviewing the campaign details.</p></div>;
  if (state === "saved_no_email") return <div className="border border-amber-600/30 bg-white p-10 text-center"><h2 className="font-display text-3xl">Your request was saved.</h2><p className="mt-3">The email confirmation could not be delivered, but your campaign request will be reviewed by the website Administrator.</p></div>;

  return <form onSubmit={submit} className="grid gap-5 border border-cream/10 bg-white p-6 shadow-soft md:grid-cols-2">
    <input type="hidden" name="submission_id" value={submissionId}/>
    <input type="text" name="company_fax" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true"/>
    <label className="text-sm font-bold">Business name<input name="business_name" required maxLength={200} className={input}/></label>
    <label className="text-sm font-bold">Contact name<input name="contact_name" required maxLength={200} className={input}/></label>
    <label className="text-sm font-bold">Email<input name="email" required type="email" maxLength={254} className={input}/></label>
    <label className="text-sm font-bold">Phone<input name="phone" type="tel" maxLength={50} className={input}/></label>
    <label className="text-sm font-bold md:col-span-2">Business website<input name="website" type="url" maxLength={500} className={input}/></label>
    <label className="text-sm font-bold">Advertising service<select name="product_id" required value={productId} onChange={(event) => setProductId(event.target.value)} className={input}>{products.map((item) => <option value={item.id} key={item.id}>{item.name} — {item.placement==="homepage"?"Homepage only":item.placement==="business_profile"?"Business profile only":"Homepage and business profile"}</option>)}</select></label>
    <label className="text-sm font-bold">Campaign length<select name="pricing_term" value={term} onChange={(event) => setTerm(event.target.value as "full" | "half")} className={input}><option value="full">Full · {product?.duration_days || 30} days</option><option value="half">Half · 14 days</option></select></label>
    <div className="border border-forest/30 bg-forest/10 p-4 text-sm font-bold md:col-span-2">Selected service: {days || 0} days · ${((price || 0) / 100).toFixed(2)}</div>
    <label className="text-sm font-bold">Preferred start date<input name="start_date" type="date" className={input}/></label>
    <label className="text-sm font-bold">Campaign headline or offer<input name="headline" maxLength={90} className={input} placeholder="Optional—we can help write it"/></label>
    <label className="text-sm font-bold md:col-span-2">What would you like to advertise?<textarea name="message" required maxLength={3000} rows={6} className="mt-2 w-full border border-cream/20 bg-white p-3 font-normal" placeholder="Tell us about the promotion, message, photos, or destination you have in mind."/></label>
    <label className="flex items-start gap-3 border border-forest/20 bg-forest/5 p-4 text-sm leading-6 md:col-span-2"><input name="agreement_accepted" value="yes" type="checkbox" required className="mt-1 size-5 shrink-0"/><span>I have read and agree to the <a href="/advertising-terms" target="_blank" rel="noreferrer" className="font-bold text-forest underline">Advertising Terms/Agreement</a>, last updated September 5, 2026. A complete copy will be emailed to me.</span></label>
    <div className="md:col-span-2"><button disabled={state === "sending" || products.length === 0} className="min-h-13 bg-pine px-7 py-4 font-bold text-cream disabled:opacity-50">{state === "sending" ? "Sending request…" : "Request advertising"}</button>{state === "error" && <p role="alert" className="mt-3 text-sm font-bold text-red-600">We couldn&apos;t save that request. Please check the form and try again.</p>}</div>
  </form>;
}
