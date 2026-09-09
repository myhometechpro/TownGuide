import {NextResponse} from "next/server";

const JSON_TYPE="application/json";

function requestHosts(request:Request){
  const hosts=new Set<string>();
  try{hosts.add(new URL(request.url).host.toLowerCase())}catch{}
  for(const name of ["host","x-forwarded-host"]){
    const value=request.headers.get(name)?.split(",",1)[0].trim().toLowerCase();
    if(value)hosts.add(value);
  }
  return hosts;
}

export function rejectUnsafeJsonRequest(request:Request,maxBytes=64_000){
  const type=request.headers.get("content-type")?.split(";",1)[0].trim().toLowerCase();
  if(type!==JSON_TYPE)return NextResponse.json({error:"Unsupported content type"},{status:415});
  const length=Number(request.headers.get("content-length")||0);
  if(!Number.isFinite(length)||length<0||length>maxBytes)return NextResponse.json({error:"Request is too large"},{status:413});
  const origin=request.headers.get("origin");
  if(origin){
    try{if(!requestHosts(request).has(new URL(origin).host.toLowerCase()))return NextResponse.json({error:"Cross-site request rejected"},{status:403})}
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
