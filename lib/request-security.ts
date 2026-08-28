import {NextResponse} from "next/server";

const JSON_TYPE="application/json";

export function rejectUnsafeJsonRequest(request:Request,maxBytes=64_000){
  const type=request.headers.get("content-type")?.split(";",1)[0].trim().toLowerCase();
  if(type!==JSON_TYPE)return NextResponse.json({error:"Unsupported content type"},{status:415});
  const length=Number(request.headers.get("content-length")||0);
  if(!Number.isFinite(length)||length<0||length>maxBytes)return NextResponse.json({error:"Request is too large"},{status:413});
  const origin=request.headers.get("origin");
  if(origin){
    try{if(new URL(origin).host!==new URL(request.url).host)return NextResponse.json({error:"Cross-site request rejected"},{status:403})}
    catch{return NextResponse.json({error:"Invalid request origin"},{status:403})}
  }
  return null;
}

export function privateJson(data:unknown,init?:ResponseInit){
  const response=NextResponse.json(data,init);
  response.headers.set("Cache-Control","no-store, max-age=0");
  response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
  return response;
}
