export async function sendVacationRentalPaymentLink(input:{email:string;ownerName:string;propertyName:string;checkoutUrl:string;amountCents:number}){
  const key=process.env.RESEND_API_KEY;
  if(!key)return {ok:false,reason:"Email service is not configured."};
  try{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.INQUIRY_FROM_EMAIL||"Heber-Overgaard Visitor Guide <listings@visitheberovergaard.com>",to:[input.email],subject:`Complete your TownGuide vacation rental listing — ${input.propertyName}`,text:`Hello ${input.ownerName},\n\nYour vacation-rental submission for ${input.propertyName} is ready for payment.\n\nAmount due: $${(input.amountCents/100).toFixed(2)} for one year\nSecure payment link: ${input.checkoutUrl}\n\nPayment places the listing into review. It does not publish the property automatically. The one-year advertising period begins when the approved listing starts.\n\nAfter successful payment, we will email a complete copy of the accepted Advertising Terms/Agreement.\n\nThank you,\nHeber-Overgaard TownGuide`}),cache:"no-store",signal:AbortSignal.timeout(8000)});
    if(!response.ok)return {ok:false,reason:`Email provider returned HTTP ${response.status}.`};
    return {ok:true};
  }catch(error){return {ok:false,reason:error instanceof Error?error.message:"Payment email failed."};}
}
