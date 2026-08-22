"use client";
export function PrintReportButton(){return <button onClick={()=>window.print()} className="bg-pine px-5 py-3 font-bold text-cream print:hidden">Print or save as PDF</button>}
