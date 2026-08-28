import {NextResponse} from "next/server";
import {getAdminSupabase} from "@/lib/supabase/admin";
import {sendInquiryWebhook} from "@/lib/inquiry-webhook";
import {privateJson,rejectUnsafeJsonRequest} from "@/lib/request-security";

type Inquiry={business_name:string;contact_name:string;phone:string;email:string;website:string;category:string;interest:string;message:string};
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendEmail(message:{from:string;to:string[];subject:string;text:string;reply_to?:string}){
  const key=process.env.RESEND_API_KEY;
  if(!key)return false;
  try{const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(message),cache:"no-store",signal:AbortSignal.timeout(8000)});
  if(!response.ok){console.error("Inquiry email delivery failed",{status:response.status});return false}
  return true}catch(error){console.error("Inquiry email delivery failed",{reason:error instanceof Error?error.name:"unknown_error"});return false}
}

async function sendInquiryEmails(inquiry:Inquiry){
  const owner=process.env.INQUIRY_TO_EMAIL||"myhometechpro1@gmail.com";
  const from=process.env.INQUIRY_FROM_EMAIL||"Heber-Overgaard Visitor Guide <listings@visitheberovergaard.com>";
  const details=[`Business: ${inquiry.business_name}`,`Contact: ${inquiry.contact_name}`,`Email: ${inquiry.email}`,`Phone: ${inquiry.phone||"Not provided"}`,`Website: ${inquiry.website||"Not provided"}`,`Category: ${inquiry.category||"Not provided"}`,`Request: ${inquiry.interest}`,"",inquiry.message||"No message provided."].join("\n");
  const notice=sendEmail({from,to:[owner],reply_to:inquiry.email,subject:`New ${inquiry.interest}: ${inquiry.business_name}`,text:`A new visitor-guide request was submitted. Replying to this email will reply to the customer.\n\n${details}`});
  const thanks=sendEmail({from,to:[inquiry.email],reply_to:owner,subject:"We received your Heber-Overgaard visitor guide request",text:`Hello ${inquiry.contact_name},\n\nThank you for contacting the Heber-Overgaard Visitor Guide about ${inquiry.business_name}. We received your ${inquiry.interest.toLowerCase()} request and will review the information you provided.\n\nIf we need clarification, we will contact you at this email address.\n\nThank you,\nHeber-Overgaard Visitor Guide\nhttps://visitheberovergaard.com/`});
  const [ownerSent,thanksSent]=await Promise.all([notice,thanks]);
  return ownerSent&&thanksSent;
}

export async function POST(req:Request){
  try{
    const rejected=rejectUnsafeJsonRequest(req);if(rejected)return rejected;
    const b=await req.json();
    if(String(b.company_fax||"").trim())return privateJson({ok:true,emailSent:true});
    const email=String(b.email||"").trim().toLowerCase();
    if(!b.business_name||!b.contact_name||!emailPattern.test(email)||email.length>254)return NextResponse.json({error:"Missing or invalid required fields"},{status:400});
    const payload:Inquiry={business_name:String(b.business_name).trim().slice(0,200),contact_name:String(b.contact_name).trim().slice(0,200),phone:String(b.phone||"").trim().slice(0,50),email,website:String(b.website||"").trim().slice(0,500),category:String(b.category||"").trim().slice(0,100),interest:String(b.interest||"Other").trim().slice(0,100),message:String(b.message||"").trim().slice(0,3000)};
    const db=getAdminSupabase();if(!db)return NextResponse.json({error:"Contact storage is not configured"},{status:503});
    const {data:inquiry,error}=await db.from("business_inquiries").insert({...payload,status:"new"}).select("id,created_at").single();if(error||!inquiry)throw error||new Error("Inquiry was not returned after saving");
    const [emailSent]=await Promise.all([
      sendInquiryEmails(payload),
      sendInquiryWebhook({inquiryId:inquiry.id,inquiryType:payload.interest||"Other",category:payload.category,name:payload.contact_name,businessName:payload.business_name,email:payload.email,phone:payload.phone,message:payload.message,submittedAt:inquiry.created_at,adminPath:"/admin/inquiries"}),
    ]);
    return privateJson({ok:true,emailSent});
  }catch(error){console.error("Unable to save inquiry",error);return NextResponse.json({error:"Unable to save inquiry"},{status:500})}
}
