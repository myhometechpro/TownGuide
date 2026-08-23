"use client";
import {useMemo,useState} from "react";
type Props={business:string;contactName?:string|null;contactEmail?:string|null;contactPhone?:string|null;product:string;amount:number;start:string;end:string;url?:string|null};
export function BillingTools({business,contactName,contactEmail,contactPhone,product,amount,start,end,url}:Props){
  const [copied,setCopied]=useState(""),greeting=contactName?.trim()||"there",friendly=(date:string)=>new Date(`${date}T12:00:00`).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),startLabel=friendly(start),endLabel=friendly(end);
  const message=useMemo(()=>`Hello ${greeting},

Thank you for choosing to advertise ${business} with the Heber-Overgaard Visitor Guide.

Campaign: ${product}
Campaign dates: ${startLabel} through ${endLabel}
Total: $${(amount/100).toFixed(2)}
${url?`\nComplete your payment securely here:\n${url}`:"\nPlease contact us when you are ready to arrange payment."}

Once payment and advertising content are approved, we will confirm that your campaign is ready to run.

If you have any questions, simply reply to this email.

Thank you for supporting the Heber-Overgaard Visitor Guide and our local community.`,[greeting,business,product,amount,startLabel,endLabel,url]);
  const subject=`Advertising campaign for ${business}`;
  async function copy(label:string,value:string){await navigator.clipboard.writeText(value);setCopied(label)}
  return <div className="mt-4 rounded-xl bg-sand/20 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-forest">Campaign contact</p><p className="mt-1 font-bold">{contactName||"Contact name needed"}</p><p className="text-sm text-ink/65">{contactEmail||"Email needed"}{contactPhone?` · ${contactPhone}`:""}</p></div>{contactPhone&&<a href={`tel:${contactPhone}`} className="border border-cream/20 px-3 py-2 text-sm font-bold">Call contact</a>}</div><p className="mt-4 text-xs font-black uppercase tracking-wider text-forest">Billing shortcuts</p><div className="mt-3 flex flex-wrap gap-2"><a href={`mailto:${encodeURIComponent(contactEmail||"")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`} className="border border-cream/20 px-3 py-2 text-sm font-bold">Open email</a><a href={`sms:${contactPhone||""}?&body=${encodeURIComponent(message.replace(/\n+/g," "))}`} className="border border-cream/20 px-3 py-2 text-sm font-bold">Open text</a><button onClick={()=>copy("Message",message)} className="border border-cream/20 px-3 py-2 text-sm font-bold">Copy message</button>{url&&<button onClick={()=>copy("Payment link",url)} className="border border-cream/20 px-3 py-2 text-sm font-bold">Copy payment link</button>}</div>{copied&&<p className="mt-2 text-xs font-bold text-forest">{copied} copied.</p>}</div>
}
