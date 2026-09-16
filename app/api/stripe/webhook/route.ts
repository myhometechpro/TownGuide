import {createHmac,timingSafeEqual} from "node:crypto";
import {NextResponse} from "next/server";
import {getAdminSupabase} from "@/lib/supabase/admin";
import {deliverVacationRentalAgreement} from "@/lib/vacation-rental-agreement";
export const runtime="nodejs";
type Session={id?:string;payment_link?:string|null;payment_status?:string;metadata?:{campaign_id?:string;vacation_rental_id?:string;vacation_rental_order_id?:string}};
type Event={id:string;type:string;data:{object:Session}};
function verify(raw:string,header:string,secret:string){const parts=header.split(",").map(x=>x.split("=")),timestamp=parts.find(x=>x[0]==="t")?.[1],signatures=parts.filter(x=>x[0]==="v1").map(x=>x[1]);if(!timestamp||!signatures.length||Math.abs(Date.now()/1000-Number(timestamp))>300)return false;const expected=Buffer.from(createHmac("sha256",secret).update(`${timestamp}.${raw}`).digest("hex"));return signatures.some(value=>{const received=Buffer.from(value);return expected.length===received.length&&timingSafeEqual(expected,received)})}
export async function POST(request:Request){
  const secret=process.env.STRIPE_WEBHOOK_SECRET,signature=request.headers.get("stripe-signature"),raw=await request.text();if(!secret||!signature||!verify(raw,signature,secret))return NextResponse.json({error:"Invalid signature"},{status:400});
  let event:Event;try{event=JSON.parse(raw) as Event}catch{return NextResponse.json({error:"Invalid payload"},{status:400})}
  const db=getAdminSupabase();if(!db)return NextResponse.json({error:"Service unavailable"},{status:503});
  const recorded=await db.from("stripe_webhook_events").insert({event_id:event.id,event_type:event.type});if(recorded.error?.code==="23505")return NextResponse.json({received:true,duplicate:true});if(recorded.error)return NextResponse.json({error:"Unable to record event"},{status:500});
  try{
    const session=event.data.object,rentalId=session.metadata?.vacation_rental_id,orderId=session.metadata?.vacation_rental_order_id;
    if(rentalId&&orderId){
      if(event.type==="checkout.session.completed"||event.type==="checkout.session.async_payment_succeeded"){
        const successful=event.type.includes("async")||session.payment_status==="paid";
        if(successful){const now=new Date().toISOString();const {error:orderError}=await db.from("vacation_rental_orders").update({status:"paid",stripe_checkout_session_id:session.id||null,stripe_paid_at:now,updated_at:now}).eq("id",orderId).eq("rental_id",rentalId);if(orderError)throw orderError;const {data:rental,error:rentalError}=await db.from("vacation_rentals").update({payment_status:"paid",status:"needs_review",updated_at:now}).eq("id",rentalId).select("id,owner_email,owner_name,property_name,advertising_start_date").single();if(rentalError||!rental)throw rentalError||new Error("Rental not found");await deliverVacationRentalAgreement(db,rental,orderId);}
      }else if(event.type==="checkout.session.async_payment_failed"||event.type==="checkout.session.expired"){
        const status=event.type.endsWith("expired")?"cancelled":"failed";await db.from("vacation_rental_orders").update({status,updated_at:new Date().toISOString()}).eq("id",orderId).eq("rental_id",rentalId);await db.from("vacation_rentals").update({payment_status:status,updated_at:new Date().toISOString()}).eq("id",rentalId);
      }
    }else if(event.type==="checkout.session.completed"||event.type==="checkout.session.async_payment_succeeded"){
      const successful=event.type.includes("async")||session.payment_status==="paid";if(successful){let update=db.from("ad_campaigns").update({paid:true,stripe_paid_at:new Date().toISOString(),stripe_checkout_session_id:session.id||null,updated_at:new Date().toISOString()});update=session.metadata?.campaign_id?update.eq("id",session.metadata.campaign_id):update.eq("payment_reference",session.payment_link||"");const {error}=await update;if(error)throw error;}
    }
    if((event.type==="checkout.session.completed"||event.type==="checkout.session.async_payment_succeeded")&&session.payment_link&&process.env.STRIPE_SECRET_KEY)await fetch(`https://api.stripe.com/v1/payment_links/${encodeURIComponent(session.payment_link)}`,{method:"POST",headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({active:"false"}),cache:"no-store"});
    return NextResponse.json({received:true});
  }catch(error){await db.from("stripe_webhook_events").delete().eq("event_id",event.id);console.error("Stripe webhook processing failed",error);return NextResponse.json({error:"Unable to process event"},{status:500});}
}
