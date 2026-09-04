import { getLiveMapAds } from "@/lib/advertising";
import { getBusinesses } from "@/lib/businesses";
import { getAttractions, getEvents, getTrails } from "@/lib/content";
import {
  cleanOptional,
  isPhysicalBusiness,
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

type Coordinates = { latitude: number; longitude: number };

const businessCoordinates: Record<string, Coordinates> = {
  "aztec-coffee-taproom": { latitude: 34.3917584, longitude: -110.5266689 },
  "red-onion-bar-grill": { latitude: 34.4207809, longitude: -110.5798145 },
  "sanders-coffee-co": { latitude: 34.4220061, longitude: -110.5799635 },
  "best-western-sawmill-inn": { latitude: 34.4286647, longitude: -110.5868114 },
  "d-m-outfitters": { latitude: 34.4308948, longitude: -110.5984665 },
  "junes-cafe": { latitude: 34.418396, longitude: -110.5755983 },
  "ponderosa-cafe": { latitude: 34.4139155, longitude: -110.5710212 },
  "pit-stop-pizza": { latitude: 34.389628, longitude: -110.5454108 },
  "kls-asian-kitchen": { latitude: 34.4198635, longitude: -110.5790722 },
  "ajs-getaway-rv-park": { latitude: 34.4233679, longitude: -110.5658775 },
  "big-red-barn-marketplace": { latitude: 34.4304802, longitude: -110.5990152 },
  "three-bears-cafe": { latitude: 34.4315236, longitude: -110.5959016 },
  "alibertos-mexican-restaurant": { latitude: 34.4307471, longitude: -110.5938991 },
  "casa-ramos": { latitude: 34.4309807, longitude: -110.5924192 },
  "the-market-at-heber": { latitude: 34.4299466, longitude: -110.5979119 },
  "ace-hardware-overgaard": { latitude: 34.4054404, longitude: -110.5643063 },
  "basecamp-rv": { latitude: 34.369204, longitude: -110.4068988 },
  "christinas-woodshed-cafe": { latitude: 34.389618, longitude: -110.5454822 },
  "gigis-pizza": { latitude: 34.3950735, longitude: -110.5574135 },
  "heber-overgaard-chevron": { latitude: 34.4182812, longitude: -110.5776666 },
  "dairy-queen-heber-overgaard": { latitude: 34.4182812, longitude: -110.5776666 },
  "gustava-betty-soul-food": { latitude: 34.4230109, longitude: -110.5809737 },
  "junk-warehouse": { latitude: 34.389628, longitude: -110.5454108 },
  "miss-bos-mercantile": { latitude: 34.3920419, longitude: -110.5268472 },
  "mogollon-family-dentistry": { latitude: 34.422088, longitude: -110.5662892 },
  "overgaard-rv-resort": { latitude: 34.394044, longitude: -110.5537442 },
  "mountain-top-fitness": { latitude: 34.4137321, longitude: -110.5709614 },
  "napa-of-overgaard": { latitude: 34.4043317, longitude: -110.5658764 },
  "packers-print-ship": { latitude: 34.414272, longitude: -110.571455 },
  "the-cabin-bar-grill": { latitude: 34.3947953, longitude: -110.5566808 },
  "windy-hills-lavender-farm": { latitude: 34.4268883, longitude: -110.5857924 },
  "woodchuck-saw-cycle": { latitude: 34.4315177, longitude: -110.5934389 },
  "260-brewery-wild-women-saloon": { latitude: 34.3901153, longitude: -110.5357908 },
  "amore-rim-salon": { latitude: 34.4220275, longitude: -110.5799495 },
  "bolt-adventures-transport-containers": { latitude: 34.4063135, longitude: -110.5657302 },
  "bryce-computers": { latitude: 34.4303375, longitude: -110.5983836 },
  "canyon-rim-dental-heber": { latitude: 34.4274242, longitude: -110.5861092 },
  "country-club-storage": { latitude: 34.3965487, longitude: -110.5511519 },
  "golden-soul-massage-studio": { latitude: 34.3917584, longitude: -110.5266689 },
  "lady-nays-boutique": { latitude: 34.4304802, longitude: -110.5990152 },
  "overgaard-market": { latitude: 34.3912845, longitude: -110.5519455 },
  "pots-plus": { latitude: 34.3927939, longitude: -110.5560117 },
  "arizona-building-supply": { latitude: 34.4107584, longitude: -110.5699159 },
  "heber-rv-resort": { latitude: 34.4267422, longitude: -110.5544046 },
  "rim-country-senior-center": { latitude: 34.3868653, longitude: -110.5536686 },
};

const attractionCoordinates: Record<string, Coordinates> = {
  "rock-house-museum": { latitude: 34.4299666, longitude: -110.5964934 },
  "woods-canyon-lake": { latitude: 34.337649, longitude: -110.9500876 },
  "willow-springs-lake": { latitude: 34.3091793, longitude: -110.8763454 },
  "black-canyon-lake": { latitude: 34.3288615, longitude: -110.7003518 },
};

function coordinatesFor(
  latitudeValue: unknown,
  longitudeValue: unknown,
  fallback?: Coordinates,
): Coordinates | undefined {
  const latitude = validLatitude(latitudeValue);
  const longitude = validLongitude(longitudeValue);
  if (
    latitude !== undefined &&
    longitude !== undefined &&
    latitude >= 33.5 &&
    latitude <= 35.5 &&
    longitude >= -112.5 &&
    longitude <= -109.5
  ) {
    return { latitude, longitude };
  }
  return fallback;
}

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

function separateSharedLocations(points: MapPoint[]) {
  const groups = new Map<string, MapPoint[]>();
  for (const point of points) {
    const key = `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`;
    groups.set(key, [...(groups.get(key) || []), point]);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.forEach((point, index) => {
      const angle = (index / group.length) * Math.PI * 2;
      point.latitude += Math.sin(angle) * 0.0001;
      point.longitude += Math.cos(angle) * 0.00012;
    });
  }
  return points;
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
    const coordinates = coordinatesFor(
      item.latitude,
      item.longitude,
      businessCoordinates[item.slug],
    );
    if (
      !isPhysicalBusiness(item) ||
      !cleanOptional(item.address) ||
      !coordinates
    ) {
      continue;
    }
    points.push({
      id: `business-${item.id}`,
      name: item.name,
      category: item.category,
      kind: businessKind(item.category),
      description: cleanOptional(item.shortDescription),
      address: cleanOptional(item.address),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      href: `/businesses/${item.slug}`,
      advertisement: adByBusiness.get(item.id),
    });
  }

  for (const item of attractions) {
    const coordinates = coordinatesFor(
      item.latitude,
      item.longitude,
      attractionCoordinates[item.slug],
    );
    if (!coordinates) continue;
    points.push({
      id: `attraction-${item.id}`,
      name: item.name,
      category: item.category,
      kind: recreationKind(item.name, item.category),
      description: cleanOptional(item.description),
      address: cleanOptional(item.address),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
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

  return separateSharedLocations(points.filter(isRimCountryCoordinate));
}
