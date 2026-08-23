import QRCode from "qrcode";
import Link from "next/link";
import {requireAdmin} from "@/lib/supabase/auth";
import {PrintButton} from "@/components/print-button";

type TentSign={name:string;code:string;trackingCode:string;scans:number;qr:string};

function Artwork({sign}:{sign:TentSign}){return <div className="tent-art">
  <img src="/images/qr/heber-overgaard-sign-template.png" alt="" className="tent-template"/>
  <span className="tent-qr-mask"/>
  <img src={sign.qr} alt={`QR code for ${sign.name}`} className="tent-qr"/>
  <span className="tent-code">SIGN {sign.trackingCode}</span>
</div>}

function Tent({sign}:{sign?:TentSign}){return <div className={`tent-column ${sign?"":"tent-empty"}`}>
  {sign&&<><div className="tent-tab tent-tab-top">OVERLAP / TAPE INSIDE</div><div className="tent-face tent-face-top"><Artwork sign={sign}/></div><div className="fold-label">FOLD</div><div className="tent-face tent-face-bottom"><Artwork sign={sign}/></div><div className="tent-tab tent-tab-bottom">OVERLAP / TAPE INSIDE</div></>}
</div>}

export default async function Page(){
  const {db}=await requireAdmin();
  const [{data:businesses},{data:locations}]=await Promise.all([db.from("businesses").select("id,name").eq("active",true).order("name"),db.from("qr_locations").select("code,business_id,qr_scans(count)").eq("active",true)]);
  const byBusiness=new Map((locations||[]).map(x=>[x.business_id,{code:x.code,scans:x.qr_scans?.[0]?.count||0}]));
  const base=(businesses||[]).filter(x=>byBusiness.has(x.id)).map(x=>({name:x.name,trackingCode:`HO-${x.id.replaceAll("-","").slice(0,6).toUpperCase()}`,...byBusiness.get(x.id)!})).sort((a,b)=>b.scans-a.scans);
  const signs:TentSign[]=await Promise.all(base.map(async sign=>({...sign,qr:await QRCode.toDataURL(`https://visitheberovergaard.com/go/${encodeURIComponent(sign.code)}`,{width:700,margin:3,errorCorrectionLevel:"H",color:{dark:"#000000",light:"#ffffff"}})})));
  const sheets=Array.from({length:Math.ceil(signs.length/2)},(_,index)=>signs.slice(index*2,index*2+2));
  return <section className="tent-print-root">
    <div className="no-print mx-auto max-w-4xl px-5 py-10"><Link href="/admin/qr" className="font-bold text-forest">← QR locations</Link><h1 className="mt-5 font-display text-4xl">Print-ready table tents</h1><p className="mt-3 max-w-2xl text-ink/60">Each US Letter page contains two tents with 4×5-inch finished faces. Print at actual size (100%), disable browser headers and footers, cut down the center, fold on the horizontal line, then overlap and tape the end tabs inside.</p><div className="mt-6"><PrintButton/></div></div>
    <div className="tent-sheets">{sheets.map((sheet,index)=><div className="tent-sheet" key={index}><Tent sign={sheet[0]}/><Tent sign={sheet[1]}/><span className="cut-label">CUT</span></div>)}</div>
    <style>{`
      .tent-sheets{display:grid;gap:24px;justify-content:center;padding:24px;overflow:auto;background:#d7d3c9}
      .tent-sheet{position:relative;width:8.5in;height:11in;display:grid;grid-template-columns:4.25in 4.25in;background:white;box-shadow:0 8px 28px rgba(0,0,0,.2);overflow:hidden}
      .tent-column{position:relative;width:4.25in;height:11in}
      .tent-column:first-child{border-right:.7pt dashed #777}
      .tent-face{height:5in;display:flex;align-items:center;justify-content:center;position:relative}
      .tent-face-bottom{border-top:.7pt dashed #777}
      .tent-face-top .tent-art{transform:rotate(180deg)}
      .tent-art{position:relative;width:4in;height:5in;overflow:hidden;background:#f5efe2}
      .tent-tab{height:.5in;display:flex;align-items:center;justify-content:center;color:#777;font:6pt Arial,sans-serif;letter-spacing:1px}
      .tent-tab-top{transform:rotate(180deg)}
      .tent-template{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}
      .tent-qr-mask{position:absolute;left:30.7%;top:34.9%;width:38.8%;height:30.4%;background:white}
      .tent-qr{position:absolute;left:32.7%;top:35.2%;width:34.8%;height:27.9%}
      .tent-code{position:absolute;left:31%;top:63.2%;width:38%;color:#123725;background:white;text-align:center;font:700 7pt ui-monospace,SFMono-Regular,Menlo,monospace;line-height:1.2}
      .fold-label{position:absolute;z-index:2;left:.08in;top:calc(5.5in - 7px);padding:0 3px;background:white;color:#666;font:6pt Arial,sans-serif;letter-spacing:1px}
      .cut-label{position:absolute;z-index:2;left:calc(4.25in - 10px);top:.05in;padding:1px 3px;background:white;color:#666;font:6pt Arial,sans-serif;letter-spacing:1px;writing-mode:vertical-rl}
      .tent-empty{background:white}
      @media print{
        @page{size:letter portrait;margin:0}
        body>header,body>footer,.no-print,body>nav{display:none!important}
        html,body,main,.tent-print-root,.tent-sheets{margin:0!important;padding:0!important;background:white!important}
        .tent-sheets{display:block;overflow:visible}
        .tent-sheet{box-shadow:none;break-after:page;page-break-after:always}
        .tent-sheet:last-child{break-after:auto;page-break-after:auto}
      }
    `}</style>
  </section>;
}
