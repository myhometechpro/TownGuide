import type {SupabaseClient} from "@supabase/supabase-js";
import {RENTAL_AGREEMENT_LAST_UPDATED,RENTAL_AGREEMENT_TEXT,RENTAL_AGREEMENT_VERSION} from "@/lib/vacation-rentals";

export async function deliverVacationRentalAgreement(db:SupabaseClient,rental:{id:string;owner_email:string;owner_name:string;property_name:string;advertising_start_date:string|null},orderId:string,options:{retryOf?:string}={}){
  const recipient=rental.owner_email.trim().toLowerCase();
  const deliveryKey=options.retryOf?`${rental.id}:${RENTAL_AGREEMENT_VERSION}:retry:${crypto.randomUUID()}`:`${rental.id}:${RENTAL_AGREEMENT_VERSION}:initial`;
  const {data,error}=await db.from("advertising_agreement_deliveries").insert({campaign_id:null,rental_id:rental.id,order_id:orderId,recipient_email:recipient,agreement_version:RENTAL_AGREEMENT_VERSION,agreement_last_updated:"2026-09-15",agreement_snapshot:RENTAL_AGREEMENT_TEXT,status:"pending",delivery_key:deliveryKey,retry_of:options.retryOf||null}).select("id").single();
  if(error?.code==="23505")return {ok:true,duplicate:true};
  if(error||!data)return {ok:false,reason:"Delivery history could not be created."};
  let status:"sent"|"failed"="failed",provider_message_id:string|null=null,failure_reason:string|null=null;
  const key=process.env.RESEND_API_KEY;
  if(!key)failure_reason="Email service is not configured.";
  else try{const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.INQUIRY_FROM_EMAIL||"Heber-Overgaard Visitor Guide <listings@visitheberovergaard.com>",to:[recipient],subject:`Your TownGuide Vacation Rental Advertising Agreement — ${RENTAL_AGREEMENT_VERSION}`,text:`Hello ${rental.owner_name},\n\nHere is the complete agreement accepted for ${rental.property_name}.\n\nAdvertising start: ${rental.advertising_start_date||"Begins when the listing is approved"}\nAgreement last updated: ${RENTAL_AGREEMENT_LAST_UPDATED}\n\n${RENTAL_AGREEMENT_TEXT}\n\nPlease retain this email for your records.`}),cache:"no-store",signal:AbortSignal.timeout(8000)});const body=await response.json().catch(()=>({})) as {id?:string};if(response.ok&&body.id){status="sent";provider_message_id=body.id}else failure_reason=`Provider rejected the message (HTTP ${response.status}).`;}catch(error){failure_reason=`Delivery request failed (${error instanceof Error?error.name:"unknown_error"}).`;}
  await db.from("advertising_agreement_deliveries").update({status,sent_at:status==="sent"?new Date().toISOString():null,provider_message_id,failure_reason}).eq("id",data.id);
  return {ok:status==="sent",deliveryId:data.id,reason:failure_reason||undefined};
}
