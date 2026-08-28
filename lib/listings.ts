import type {Business} from "@/types";

const missingValues=new Set(["","na","n/a","none","null","undefined","not available","unknown"]);
export function cleanOptional(value:unknown):string|undefined{if(value===null||value===undefined)return undefined;const text=String(value).trim();return missingValues.has(text.toLowerCase())?undefined:text}
export function validLatitude(value:unknown):number|undefined{if(value===null||value===undefined||String(value).trim()==="")return undefined;const number=Number(value);return Number.isFinite(number)&&number>=-90&&number<=90?number:undefined}
export function validLongitude(value:unknown):number|undefined{if(value===null||value===undefined||String(value).trim()==="")return undefined;const number=Number(value);return Number.isFinite(number)&&number>=-180&&number<=180?number:undefined}
export function validCoordinate(value:unknown):number|undefined{return validLongitude(value)}
export function isPhysicalBusiness(business:Pick<Business,"locationType">){return (business.locationType||"physical")==="physical"}
export function canMapBusiness(business:Business){return isPhysicalBusiness(business)&&!!cleanOptional(business.address)&&validLatitude(business.latitude)!==undefined&&validLongitude(business.longitude)!==undefined}

export const lodgingTypes=["All","Cabins","Hotels","Vacation Rentals","RV","Camping"] as const;
export type LodgingType=typeof lodgingTypes[number];
export function normalizeLodgingType(business:Business):Exclude<LodgingType,"All">|"Other"{const explicit=cleanOptional(business.lodgingType)?.toLowerCase().replace(/[_-]+/g," ");if(explicit){if(explicit.includes("cabin"))return "Cabins";if(explicit.includes("hotel")||explicit.includes("motel")||explicit.includes("inn"))return "Hotels";if(explicit.includes("vacation")||explicit.includes("rental"))return "Vacation Rentals";if(explicit==="rv"||explicit.includes("rv park")||explicit.includes("rv resort"))return "RV";if(explicit.includes("camp"))return "Camping"}const text=`${business.name} ${business.shortDescription} ${business.description}`.toLowerCase();if(/\bcabin(s)?\b/.test(text))return "Cabins";if(/\b(rv|recreational vehicle)\b/.test(text))return "RV";if(/\b(camp|campground|camping)\b/.test(text))return "Camping";if(/\b(vacation rental|short-term rental|airbnb|vrbo)\b/.test(text))return "Vacation Rentals";if(/\b(hotel|motel|inn|lodge|lodging)\b/.test(text))return "Hotels";return "Other"}
