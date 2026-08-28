import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendInquiryWebhook } from "@/lib/inquiry-webhook";
import {privateJson,rejectUnsafeJsonRequest} from "@/lib/request-security";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
type Details = { businessName:string;contactName:string;email:string;phone:string;website:string;productName:string;days:number;priceCents:number;startDate:string;headline:string;message:string };

function addDays(date:string,days:number){const value=new Date(`${date}T12:00:00Z`);value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10)}
function slugify(value:string){return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,70)||"advertising-lead"}

async function sendEmail(message:{from:string;to:string[];subject:string;text:string;reply_to?:string}){
  const key=process.env.RESEND_API_KEY;if(!key){console.error("Advertising request email skipped: RESEND_API_KEY is not configured");return false}
  try{const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(message),cache:"no-store",signal:AbortSignal.timeout(8000)});
  if(!response.ok){console.error("Advertising request email delivery failed",{status:response.status});return false}return true}catch(error){console.error("Advertising request email delivery failed",{reason:error instanceof Error?error.name:"unknown_error"});return false}
}
async function sendRequestEmails(r:Details){
  const owner=process.env.INQUIRY_TO_EMAIL||"myhometechpro1@gmail.com",from=process.env.INQUIRY_FROM_EMAIL||"Heber-Overgaard Visitor Guide <listings@visitheberovergaard.com>",term=`${r.days} days · $${(r.priceCents/100).toFixed(2)}`;
  const details=[`Business: ${r.businessName}`,`Contact: ${r.contactName}`,`Email: ${r.email}`,`Phone: ${r.phone||"Not provided"}`,`Website: ${r.website||"Not provided"}`,`Requested service: ${r.productName}`,`Requested term: ${term}`,`Preferred start: ${r.startDate}`,`Headline: ${r.headline||"Not provided"}`,"",r.message].join("\n");
  const notice=sendEmail({from,to:[owner],reply_to:r.email,subject:`New advertising request: ${r.businessName}`,text:`A private draft campaign was created in the Admin portal. Replying to this email will reply to the customer.\n\n${details}`});
  const thanks=sendEmail({from,to:[r.email],reply_to:owner,subject:"We received your Heber-Overgaard advertising request",text:`Hello ${r.contactName},\n\nThank you for asking about advertising ${r.businessName} in the Heber-Overgaard Visitor Guide. We received your request for ${r.productName} (${term}).\n\nYour request is not yet a contract, invoice, or published advertisement. We will review the details and contact you to confirm the content, dates, pricing, and next steps.\n\nThank you,\nHeber-Overgaard Visitor Guide\nhttps://visitheberovergaard.com/`});
  const [ownerSent,thanksSent]=await Promise.all([notice,thanks]);return ownerSent&&thanksSent;
}

export async function POST(req:Request){
  try{
    const rejected=rejectUnsafeJsonRequest(req);if(rejected)return rejected;
    const b=await req.json();if(String(b.company_fax||"").trim())return privateJson({ok:true,emailSent:true});
    const businessName=String(b.business_name||"").trim().slice(0,200),contactName=String(b.contact_name||"").trim().slice(0,200),email=String(b.email||"").trim().toLowerCase().slice(0,254),productId=String(b.product_id||"").trim(),message=String(b.message||"").trim().slice(0,3000);
    if(!businessName||!contactName||!emailPattern.test(email)||!productId||!message)return NextResponse.json({error:"Missing or invalid required fields"},{status:400});
    const db=getAdminSupabase();if(!db)return NextResponse.json({error:"Advertising requests are not configured"},{status:503});
    const {data:product,error:productError}=await db.from("ad_products").select("id,name,price_cents,half_price_cents,duration_days").eq("id",productId).eq("active",true).maybeSingle();
    if(productError||!product)return NextResponse.json({error:"The selected advertising service is unavailable"},{status:400});
    const pricingTerm=b.pricing_term==="half"?"half":"full",days=pricingTerm==="half"?14:product.duration_days,priceCents=pricingTerm==="half"?product.half_price_cents:product.price_cents,today=new Date().toISOString().slice(0,10),requestedStart=String(b.start_date||"").trim(),startDate=datePattern.test(requestedStart)&&requestedStart>=today?requestedStart:today,endDate=addDays(startDate,Math.max(1,days)-1),phone=String(b.phone||"").trim().slice(0,50),website=String(b.website||"").trim().slice(0,500),requestedHeadline=String(b.headline||"").trim().slice(0,90);
    const {data:existing}=await db.from("businesses").select("id").ilike("name",businessName).limit(1).maybeSingle();let businessId=existing?.id;
    if(!businessId){const slug=`${slugify(businessName)}-advertising-lead-${crypto.randomUUID().slice(0,8)}`;const {data:created,error}=await db.from("businesses").insert({name:businessName,slug,phone:phone||null,website:website||null,email,category:"Other",short_description:"Advertising inquiry — not published",description:"Private business lead created from a customer advertising request.",active:false}).select("id").single();if(error||!created)throw error||new Error("Unable to create business lead");businessId=created.id}
    const details:Details={businessName,contactName,email,phone,website,productName:product.name,days,priceCents,startDate,headline:requestedHeadline,message};
    const adCopy=["CUSTOMER ADVERTISING REQUEST",`Contact: ${contactName}`,`Email: ${email}`,`Phone: ${phone||"Not provided"}`,`Website: ${website||"Not provided"}`,`Requested service: ${product.name}`,`Requested term: ${days} days · $${(priceCents/100).toFixed(2)}`,"","Customer message:",message].join("\n");
    const {data:campaign,error:campaignError}=await db.from("ad_campaigns").insert({business_id:businessId,product_id:product.id,headline:requestedHeadline||`Advertising request — ${businessName}`,ad_copy:adCopy,contact_name:contactName,contact_email:email,contact_phone:phone||null,destination_url:website||null,start_date:startDate,end_date:endDate,billing_price_cents:priceCents,booked_duration_days:days,pricing_term:pricingTerm,approved:false,paid:false,status:"draft"}).select("id,created_at").single();if(campaignError||!campaign)throw campaignError||new Error("Campaign was not returned after saving");
    const [emailSent]=await Promise.all([
      sendRequestEmails(details),
      sendInquiryWebhook({inquiryId:campaign.id,inquiryType:"Advertising",category:product.name,name:contactName,businessName,email,phone,message,submittedAt:campaign.created_at,adminPath:`/admin/advertising/${campaign.id}`}),
    ]);
    return privateJson({ok:true,emailSent});
  }catch(error){console.error("Unable to save advertising request",error);return NextResponse.json({error:"Unable to save advertising request"},{status:500})}
}
