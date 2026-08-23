import type {Metadata} from "next";
import {PageHero} from "@/components/page-hero";
import {BusinessDirectory} from "@/components/business-directory";
import {getBusinesses} from "@/lib/businesses";
import {getLiveAds} from "@/lib/advertising";
export const metadata:Metadata={title:"Local Business Directory",description:"Discover places to eat, shop, stay, and find services in Heber-Overgaard."};
export default async function Page({searchParams}:{searchParams:Promise<{category?:string}>}){const [businesses,search,featured]=await Promise.all([getBusinesses(),searchParams,getLiveAds("business_profile")]);return <><PageHero eyebrow="Support local" title="Local business directory" text="Find real places to eat, drink, stay, and gear up for your time in the high country. Always confirm current hours directly."/><section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><BusinessDirectory businesses={businesses} initialCategory={search.category} featuredBusinessIds={featured.map(c=>c.business_id)}/></section></>}
