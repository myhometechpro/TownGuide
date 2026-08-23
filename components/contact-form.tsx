"use client";

import {useState} from "react";

const categories=[
  "Restaurants",
  "Coffee",
  "Lodging",
  "Shopping",
  "Grocery & Markets",
  "Gas & Convenience",
  "Automotive",
  "Outdoor & Adventure",
  "Recreation",
  "Family Activities",
  "Entertainment",
  "Health & Medical",
  "Beauty & Wellness",
  "Home Services",
  "Construction & Trades",
  "Professional Services",
  "Real Estate",
  "Arts, Crafts & Gifts",
  "Nonprofit & Community",
  "Other",
];

type State="idle"|"sending"|"sent"|"saved_no_email"|"error";

export function ContactForm(){
  const [state,setState]=useState<State>("idle");
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setState("sending");
    const form=new FormData(e.currentTarget);
    try{
      const res=await fetch("/api/inquiries",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(form))});
      const result=await res.json() as {emailSent?:boolean};
      setState(res.ok?(result.emailSent?"sent":"saved_no_email"):"error");
    }catch{setState("error")}
  }
  if(state==="sent")return <div className="rounded-3xl bg-white p-10 text-center"><h2 className="font-display text-3xl">Thanks for reaching out.</h2><p className="mt-3">Your request was saved and a confirmation email was sent.</p></div>;
  if(state==="saved_no_email")return <div className="rounded-3xl border border-amber-600/30 bg-white p-10 text-center"><h2 className="font-display text-3xl">Your request was saved.</h2><p className="mt-3">The email confirmation could not be delivered. The site owner can still review your request in the Admin portal.</p></div>;
  const input="focus-ring mt-2 h-12 w-full rounded-xl border border-cream/20 px-3 font-normal";
  return <form onSubmit={submit} className="grid gap-5 rounded-3xl bg-white p-6 shadow-soft md:grid-cols-2">
    <label className="text-sm font-bold">Business name<input name="business_name" required className={input}/></label>
    <label className="text-sm font-bold">Contact name<input name="contact_name" required className={input}/></label>
    <label className="text-sm font-bold">Phone<input name="phone" type="tel" className={input}/></label>
    <label className="text-sm font-bold">Email<input name="email" required type="email" className={input}/></label>
    <label className="text-sm font-bold">Website<input name="website" type="url" className={input}/></label>
    <label className="text-sm font-bold">Business category<select name="category" required defaultValue="" className={input}><option value="" disabled>Select a category</option>{categories.map(category=><option key={category}>{category}</option>)}</select></label>
    <label className="text-sm font-bold">Request type<select name="interest" className={input}>{["Free Listing","Update a Listing","QR Location","Local Deal","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="text-sm font-bold md:col-span-2">Message<textarea name="message" rows={5} className="mt-2 w-full rounded-xl border border-cream/20 p-3 font-normal"/></label>
    <div className="md:col-span-2"><button disabled={state==="sending"} className="min-h-13 border border-cream/20 bg-pine px-7 py-4 font-bold text-cream disabled:opacity-50">{state==="sending"?"Sending…":"Send request"}</button>{state==="error"&&<p role="alert" className="mt-3 text-sm font-bold text-red-700">We couldn&apos;t save that request. Please check the fields and try again.</p>}</div>
  </form>;
}
