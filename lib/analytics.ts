export type AnalyticsEvent={eventType:string;entityType?:string;entityId?:string;qrLocationId?:string;metadata?:Record<string,string|number|boolean>};
export function track(event:AnalyticsEvent){if(typeof window==="undefined")return;fetch("/api/analytics",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(event),keepalive:true}).catch(()=>undefined)}
