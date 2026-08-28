import { getLiveMapAds } from "@/lib/advertising";
import { getBusinesses } from "@/lib/businesses";
import { getAttractions, getEvents, getTrails } from "@/lib/content";
import {
  canMapBusiness,
  cleanOptional,
  validLatitude,
  validLongitude,
} from "@/lib/listings";

export type MapPointKind =
  | "business"
  | "dining"
  | "lodging"
  | "lake"
  | "recreation"
  | "event";

export type MapAdvertisement = {
  campaignId: string;
  headline: string;
  copy?: string;
  imageUrl?: string;
  destinationUrl?: string;
};

export type MapPoint = {
  id: string;
  name: string;
  category: string;
  kind: MapPointKind;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  href: string;
  advertisement?: MapAdvertisement;
};

const isRimCountryCoordinate = ({ latitude, longitude }: MapPoint) =>
  latitude >= 33.5 &&
  latitude <= 35.5 &&
  longitude >= -112.5 &&
  longitude <= -109.5;

function businessKind(category: string): MapPointKind {
  const value = category.toLowerCase();
  if (value.includes("restaurant") || value.includes("food") || value.includes("drink")) {
    return "dining";
  }
  if (value.includes("lodging") || value.includes("hotel") || value.includes("cabin")) {
    return "lodging";
  }
  return "business";
}

function recreationKind(name: string, category: string): MapPointKind {
  return `${name} ${category}`.toLowerCase().includes("lake")
    ? "lake"
    : "recreation";
}

export async function getTownMapPoints(): Promise<MapPoint[]> {
  const [businesses, attractions, trails, events, liveAds] = await Promise.all([
    getBusinesses(),
    getAttractions(),
    getTrails(),
    getEvents(),
    getLiveMapAds(),
  ]);
  const points: MapPoint[] = [];
  const adByBusiness = new Map<string, MapAdvertisement>();

  for (const campaign of liveAds) {
    if (adByBusiness.has(campaign.business_id)) continue;
    adByBusiness.set(campaign.business_id, {
      campaignId: campaign.id,
      headline: campaign.headline,
      copy: cleanOptional(campaign.ad_copy),
      imageUrl: cleanOptional(campaign.image_url),
      destinationUrl: cleanOptional(campaign.destination_url),
    });
  }

  for (const item of businesses) {
    if (!canMapBusiness(item)) continue;
    points.push({
      id: `business-${item.id}`,
      name: item.name,
      category: item.category,
      kind: businessKind(item.category),
      description: cleanOptional(item.shortDescription),
      address: cleanOptional(item.address),
      latitude: item.latitude!,
      longitude: item.longitude!,
      href: `/businesses/${item.slug}`,
      advertisement: adByBusiness.get(item.id),
    });
  }

  for (const item of attractions) {
    const latitude = validLatitude(item.latitude);
    const longitude = validLongitude(item.longitude);
    if (latitude === undefined || longitude === undefined) continue;
    points.push({
      id: `attraction-${item.id}`,
      name: item.name,
      category: item.category,
      kind: recreationKind(item.name, item.category),
      description: cleanOptional(item.description),
      address: cleanOptional(item.address),
      latitude,
      longitude,
      href: `/things-to-do/${item.slug}`,
    });
  }

  for (const item of trails) {
    const latitude = validLatitude(item.latitude);
    const longitude = validLongitude(item.longitude);
    if (latitude === undefined || longitude === undefined) continue;
    points.push({
      id: `trail-${item.id}`,
      name: item.name,
      category: item.activityType,
      kind: recreationKind(item.name, item.activityType),
      description: cleanOptional(item.description),
      latitude,
      longitude,
      href: "/trails",
    });
  }

  for (const item of events) {
    const latitude = validLatitude(item.latitude);
    const longitude = validLongitude(item.longitude);
    if (latitude === undefined || longitude === undefined) continue;
    points.push({
      id: `event-${item.id}`,
      name: item.name,
      category: item.category,
      kind: "event",
      description: cleanOptional(item.description),
      address: cleanOptional(item.address),
      latitude,
      longitude,
      href: "/events",
    });
  }

  return points.filter(isRimCountryCoordinate);
}
