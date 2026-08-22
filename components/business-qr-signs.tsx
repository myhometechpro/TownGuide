"use client";

import {useState} from "react";
import QRCode from "qrcode";
import JSZip from "jszip";

type Sign={name:string;slug:string;code:string;trackingCode:string;scans:number};
const safe=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const filename=(sign:Sign)=>`heber-overgaard-sign-${sign.trackingCode.toLowerCase()}-${safe(sign.name)}.png`;
const csvCell=(value:string|number)=>`"${String(value).replaceAll('"','""')}"`;

function crossReferenceCsv(signs:Sign[]){
  const header=["tracking_code","business_name","qr_tracking_url","website_destination","sign_filename","current_scans"];
  const rows=signs.map(sign=>[sign.trackingCode,sign.name,`https://visitheberovergaard.com/go/${sign.code}`,"https://visitheberovergaard.com/",filename(sign),sign.scans]);
  return [header,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n");
}

function saveBlob(blob:Blob,name:string){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

async function renderSign(sign:Sign){
  const template=new Image();template.src="/images/qr/heber-overgaard-sign-template.png";
  await new Promise<void>((resolve,reject)=>{template.onload=()=>resolve();template.onerror=()=>reject(new Error("Template failed to load"))});
  const qr=await QRCode.toDataURL(`https://visitheberovergaard.com/go/${encodeURIComponent(sign.code)}`,{width:390,margin:3,errorCorrectionLevel:"H",color:{dark:"#000000",light:"#ffffff"}});
  const qrImage=new Image();qrImage.src=qr;
  await new Promise<void>((resolve,reject)=>{qrImage.onload=()=>resolve();qrImage.onerror=()=>reject(new Error("QR failed to render"))});
  const canvas=document.createElement("canvas");canvas.width=template.naturalWidth;canvas.height=template.naturalHeight;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas unavailable");
  ctx.drawImage(template,0,0);ctx.fillStyle="#fff";ctx.fillRect(344,489,434,425);ctx.drawImage(qrImage,366,493,390,390);
  ctx.fillStyle="#123725";ctx.font="700 18px ui-monospace, SFMono-Regular, Menlo, monospace";ctx.textAlign="center";ctx.fillText(`SIGN ${sign.trackingCode}`,561,905);
  return canvas.toDataURL("image/png");
}

export function BusinessQrSigns({signs}:{signs:Sign[]}){
  const [busy,setBusy]=useState<string>();
  async function download(sign:Sign){setBusy(sign.code);try{const url=await renderSign(sign),a=document.createElement("a");a.href=url;a.download=filename(sign);a.click()}finally{setBusy(undefined)}}
  function downloadCsv(){saveBlob(new Blob([crossReferenceCsv(signs)],{type:"text/csv;charset=utf-8"}),"heber-overgaard-qr-sign-cross-reference.csv")}
  async function downloadAll(){setBusy("all");try{const zip=new JSZip();for(const sign of signs){const url=await renderSign(sign);zip.file(filename(sign),url.split(",")[1],{base64:true})}zip.file("heber-overgaard-qr-sign-cross-reference.csv",crossReferenceCsv(signs));saveBlob(await zip.generateAsync({type:"blob"}),"heber-overgaard-business-qr-signs.zip")}finally{setBusy(undefined)}}
  return <>
    <div className="mt-8 flex flex-wrap gap-3"><button onClick={downloadAll} disabled={!!busy} className="border border-cream/20 bg-white px-5 py-3 font-bold disabled:opacity-50">{busy==="all"?`Creating ${signs.length} signs…`:`Download all ${signs.length} signs + CSV (.zip)`}</button><button onClick={downloadCsv} disabled={!!busy} className="border border-cream/20 bg-white px-5 py-3 font-bold disabled:opacity-50">Download cross-reference CSV</button></div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{signs.map(sign=><article className="border border-cream/10 bg-white p-5" key={sign.code}><p className="text-xs font-bold uppercase tracking-wider text-forest">Tracked business sign · {sign.trackingCode}</p><h2 className="mt-2 font-display text-xl">{sign.name}</h2><p className="mt-2 text-xs text-ink/55">visitheberovergaard.com/go/{sign.code}</p><p className="mt-3 text-2xl font-black text-forest">{sign.scans} <span className="text-sm font-bold text-ink/55">scans</span></p><div className="mt-5 flex gap-3"><button onClick={()=>download(sign)} disabled={!!busy} className="bg-pine px-4 py-3 font-bold text-cream disabled:opacity-50">{busy===sign.code?"Creating…":"Download sign"}</button><a href={`/go/${sign.code}`} target="_blank" className="border border-cream/20 px-4 py-3 font-bold">Test link</a></div></article>)}</div>
  </>;
}
