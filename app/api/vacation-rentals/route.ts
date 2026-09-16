import {NextResponse} from "next/server";
import {getAdminSupabase} from "@/lib/supabase/admin";
import {privateJson} from "@/lib/request-security";
import {sendInquiryWebhook} from "@/lib/inquiry-webhook";
import {RENTAL_AGREEMENT_TEXT,RENTAL_AGREEMENT_VERSION,splitList,validateRentalImages,validateRentalUrls} from "@/lib/vacation-rentals";

export const runtime="nodejs";
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
const text=(form:FormData,key:string,max:number)=>String(form.get(key)||"").trim().slice(0,max);
const slugify=(value:string)=>value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,65)||"vacation-rental";
function sameOrigin(request:Request){const origin=request.headers.get("origin");if(!origin)return true;try{return new URL(origin).host===new URL(request.url).host}catch{return false}}

async function notifyAdmin(payload:{id:string;property:string;owner:string;email:string;location:string;created_at:string}){
  const site=(process.env.NEXT_PUBLIC_SITE_URL||"").replace(/\/+$/,"");
  const review=`${site}/admin/vacation-rentals/${payload.id}`;
  const webhook=sendInquiryWebhook({inquiryId:payload.id,inquiryType:"Vacation Rental Submission",category:payload.location,name:payload.owner,businessName:payload.property,message:`Status: Payment Pending`,submittedAt:payload.created_at,adminPath:`/admin/vacation-rentals/${payload.id}`});
  const key=process.env.RESEND_API_KEY;if(!key)return webhook;
  const email=fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.INQUIRY_FROM_EMAIL||"Heber-Overgaard Visitor Guide <listings@visitheberovergaard.com>",to:[process.env.INQUIRY_TO_EMAIL||"myhometechpro1@gmail.com"],subject:`New vacation rental submission: ${payload.property}`,text:`Vacation Rental Submission\nProperty: ${payload.property}\nOwner/manager: ${payload.owner}\nGeneral location: ${payload.location}\nStatus: Payment Pending\nReview: ${review}`}),cache:"no-store",signal:AbortSignal.timeout(8000)}).catch(()=>null);
  await Promise.all([webhook,email]);
}

export async function POST(request:Request){
  let uploaded:string[]=[];
  try{
    if(!sameOrigin(request))return NextResponse.json({error:"Cross-site request rejected"},{status:403});
    const length=Number(request.headers.get("content-length")||0);if(length>53*1024*1024)return NextResponse.json({error:"Upload is too large"},{status:413});
    const form=await request.formData();if(text(form,"company_fax",100))return privateJson({ok:true});
    const submissionId=text(form,"submission_id",50),ownerName=text(form,"owner_name",120),ownerEmail=text(form,"owner_email",254).toLowerCase(),ownerPhone=text(form,"owner_phone",50),propertyName=text(form,"property_name",140),location=text(form,"location",30),propertyType=text(form,"property_type",30),shortDescription=text(form,"short_description",220),description=text(form,"description",4000),generalArea=text(form,"general_area",160),preferredContact=text(form,"preferred_contact",10);
    const photos=form.getAll("photos").filter((item):item is File=>item instanceof File&&item.size>0),imageError=validateRentalImages(photos),{urls,valid}=validateRentalUrls({airbnb:form.get("airbnb_url"),vrbo:form.get("vrbo_url"),direct:form.get("direct_booking_url")});
    const acknowledgements=["authorized","content_rights","compliance","advertising_only","booking_responsibility","terms_accepted"];
    if(!uuidPattern.test(submissionId)||!ownerName||!emailPattern.test(ownerEmail)||!ownerPhone||!propertyName||!shortDescription||!description||!valid||imageError||!acknowledgements.every(k=>form.get(k)==="yes")||!["email","phone"].includes(preferredContact)||!["Heber","Overgaard","Forest Lakes","Nearby area"].includes(location)||!["Cabin","House","Condo","Guesthouse","Other"].includes(propertyType))return NextResponse.json({error:imageError||"Complete all required fields and provide at least one valid booking URL."},{status:400});
    const maxGuests=Number(form.get("max_guests")),bedrooms=Number(form.get("bedrooms")),bathrooms=Number(form.get("bathrooms"));if(!Number.isFinite(maxGuests)||maxGuests<1||maxGuests>100||!Number.isFinite(bedrooms)||bedrooms<0||!Number.isFinite(bathrooms)||bathrooms<0)return NextResponse.json({error:"Enter valid capacity, bedroom, and bathroom values."},{status:400});
    const db=getAdminSupabase();if(!db)return NextResponse.json({error:"Vacation rental submissions are not configured."},{status:503});
    const {data:prior}=await db.from("vacation_rentals").select("id").eq("submission_id",submissionId).maybeSingle();if(prior){const {data:priorOrder}=await db.from("vacation_rental_orders").select("stripe_payment_link_url,status").eq("rental_id",prior.id).order("created_at",{ascending:false}).limit(1).maybeSingle();return privateJson({ok:true,duplicate:true,checkoutUrl:priorOrder?.status==="pending"?priorOrder.stripe_payment_link_url:null,reviewPath:"/stay"});}
    const folder=crypto.randomUUID();for(const [index,file] of photos.entries()){const extension=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg",path=`${folder}/${String(index+1).padStart(2,"0")}.${extension}`;const {error}=await db.storage.from("vacation-rental-images").upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;uploaded.push(path);}
    const photoUrls=uploaded.map(path=>db.storage.from("vacation-rental-images").getPublicUrl(path).data.publicUrl),featuredIndex=Math.min(Math.max(Number(form.get("featured_index"))||0,0),photoUrls.length-1),acceptedAt=new Date().toISOString();
    const {data:product,error:productError}=await db.from("vacation_rental_products").select("id,name,price_cents,duration_days").eq("code","founding-annual").eq("active",true).single();if(productError||!product)throw new Error("Vacation rental package is unavailable.");
    const slug=`${slugify(propertyName)}-${crypto.randomUUID().slice(0,8)}`;
    const {data:rental,error:rentalError}=await db.from("vacation_rentals").insert({submission_id:submissionId,owner_name:ownerName,owner_email:ownerEmail,owner_phone:ownerPhone,preferred_contact:preferredContact,authorized_to_advertise:true,property_name:propertyName,slug,location,general_area:generalArea||null,property_type:propertyType,short_description:shortDescription,description,max_guests:maxGuests,bedrooms,bathrooms,pet_friendly:form.get("pet_friendly")==="yes",amenities:splitList(form.get("amenities")),highlights:splitList(form.get("highlights")),airbnb_url:urls.airbnb||null,vrbo_url:urls.vrbo||null,direct_booking_url:urls.direct||null,featured_image_url:photoUrls[featuredIndex],photo_urls:photoUrls,status:"payment_pending",payment_status:"pending",agreement_version:RENTAL_AGREEMENT_VERSION,agreement_accepted_at:acceptedAt,agreement_snapshot:RENTAL_AGREEMENT_TEXT,acknowledgements:Object.fromEntries(acknowledgements.map(key=>[key,true]))}).select("id,created_at").single();if(rentalError||!rental)throw rentalError||new Error("Submission was not saved.");
    const {data:order,error:orderError}=await db.from("vacation_rental_orders").insert({rental_id:rental.id,product_id:product.id,amount_cents:product.price_cents,status:"pending",agreement_version:RENTAL_AGREEMENT_VERSION,agreement_accepted_at:acceptedAt,agreement_snapshot:RENTAL_AGREEMENT_TEXT}).select("id").single();if(orderError||!order)throw orderError||new Error("Order was not saved.");
    await notifyAdmin({id:rental.id,property:propertyName,owner:ownerName,email:ownerEmail,location,created_at:rental.created_at});
    const key=process.env.STRIPE_SECRET_KEY;if(!key)return privateJson({ok:true,saved:true,message:"Your submission was saved. We will contact you with a secure payment link."});
    const headers={Authorization:`Bearer ${key}`,"Content-Type":"application/x-www-form-urlencoded"};
    const priceResponse=await fetch("https://api.stripe.com/v1/prices",{method:"POST",headers,body:new URLSearchParams({currency:"usd",unit_amount:String(product.price_cents),"product_data[name]":`${product.name} — ${propertyName}`}),cache:"no-store"}),price=await priceResponse.json() as {id?:string};if(!priceResponse.ok||!price.id)return privateJson({ok:true,saved:true,message:"Your submission was saved. We will contact you with a secure payment link."});
    const linkResponse=await fetch("https://api.stripe.com/v1/payment_links",{method:"POST",headers,body:new URLSearchParams({"line_items[0][price]":price.id,"line_items[0][quantity]":"1","metadata[vacation_rental_order_id]":order.id,"metadata[vacation_rental_id]":rental.id,"restrictions[completed_sessions][limit]":"1",after_completion_type:"redirect","after_completion[redirect][url]":`${(process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin).replace(/\/+$/,"")}/vacation-rentals/thank-you?paid=1`}),cache:"no-store"}),link=await linkResponse.json() as {id?:string;url?:string};if(!linkResponse.ok||!link.id||!link.url)return privateJson({ok:true,saved:true,message:"Your submission was saved. We will contact you with a secure payment link."});
    await db.from("vacation_rental_orders").update({stripe_payment_link_id:link.id,stripe_payment_link_url:link.url,updated_at:new Date().toISOString()}).eq("id",order.id);
    return privateJson({ok:true,checkoutUrl:link.url});
  }catch(error){console.error("Vacation rental submission failed",error);if(uploaded.length){const db=getAdminSupabase();await db?.storage.from("vacation-rental-images").remove(uploaded);}return NextResponse.json({error:"We could not complete the submission. Please try again."},{status:500});}
}
