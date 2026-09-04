"use client";

import {useRef,useState} from "react";

const fiveMb=5*1024*1024;

export function ImageUploadInput(){
  const input=useRef<HTMLInputElement>(null);
  const [status,setStatus]=useState<"idle"|"converting"|"ready"|"error">("idle");
  const [message,setMessage]=useState("");

  async function selectImage(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    setStatus("idle");setMessage("");
    if(!file)return;
    const extension=file.name.split(".").pop()?.toLowerCase();
    const isHeic=["heic","heif"].includes(extension||"")||["image/heic","image/heif"].includes(file.type);
    if(!isHeic){
      if(file.size>fiveMb){event.target.value="";setStatus("error");setMessage("That image is larger than 5 MB.")}
      return;
    }
    setStatus("converting");setMessage("Converting HEIC photo to JPG…");
    try{
      const {default:heic2any}=await import("heic2any");
      const result=await heic2any({blob:file,toType:"image/jpeg",quality:.82});
      const blob=Array.isArray(result)?result[0]:result;
      if(!blob||blob.size>fiveMb)throw new Error("The converted JPG is larger than 5 MB. Please choose a smaller photo.");
      const converted=new File([blob],`${file.name.replace(/\.(heic|heif)$/i,"")}.jpg`,{type:"image/jpeg",lastModified:Date.now()});
      const transfer=new DataTransfer();transfer.items.add(converted);
      if(input.current)input.current.files=transfer.files;
      setStatus("ready");setMessage("HEIC converted to JPG and ready to upload.");
    }catch(error){
      event.target.value="";
      setStatus("error");setMessage(error instanceof Error?error.message:"This HEIC photo could not be converted. Please try another photo.");
    }
  }

  return <div className="mt-2">
    <input ref={input} onChange={selectImage} className="block w-full text-sm" type="file" name="image_file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"/>
    {status!=="idle"&&<p role={status==="error"?"alert":"status"} className={`mt-2 text-xs font-bold ${status==="error"?"text-red-300":status==="ready"?"text-emerald-300":"text-ink/60"}`}>{message}</p>}
  </div>;
}
