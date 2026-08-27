"use client";

export function ConfirmDeleteButton({id,name,action,label="Delete"}:{id:string;name:string;action:(formData:FormData)=>void|Promise<void>;label?:string}){
  return <button type="submit" name="id" value={id} formAction={action} formNoValidate onClick={(event)=>{if(!window.confirm(`Are you sure you want to permanently delete ${name}? This cannot be undone.`))event.preventDefault()}} className="border border-red-500 bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800">{label}</button>
}
