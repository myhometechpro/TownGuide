"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { MapAdvertisement, MapPoint, MapPointKind } from "@/lib/map-points";

const markerStyles: Record<MapPointKind, { color: string; label: string }> = {
  business: { color: "#276f76", label: "Businesses" },
  dining: { color: "#b7552b", label: "Food & drink" },
  lodging: { color: "#9b6b43", label: "Lodging" },
  lake: { color: "#347ca3", label: "Lakes" },
  recreation: { color: "#39734d", label: "Recreation" },
  event: { color: "#a44747", label: "Events" },
};

function recordAdEvent(campaignId: string, eventType: "impression" | "click") {
  void fetch("/api/ad-events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ campaignId, eventType }),
    keepalive: true,
  });
}

function addPopupLink(
  popup: HTMLDivElement,
  href: string,
  label: string,
  advertisement?: MapAdvertisement,
) {
  const link = document.createElement("a");
  link.textContent = label;
  link.href = href;
  link.className = "town-map-popup-link";
  if (href.startsWith("http")) {
    link.target = "_blank";
    link.rel = advertisement ? "noreferrer sponsored" : "noreferrer";
  }
  if (advertisement) {
    link.addEventListener("click", () =>
      recordAdEvent(advertisement.campaignId, "click"),
    );
  }
  popup.append(link);
}

function createListingPopup(point: MapPoint) {
  const popup = document.createElement("div");
  popup.className = "town-map-popup";
  const title = document.createElement("strong");
  const meta = document.createElement("div");
  const description = document.createElement("p");

  title.textContent = point.name;
  title.className = "town-map-popup-title";
  meta.textContent = point.category;
  meta.className = "town-map-popup-meta";
  description.textContent = point.description || point.address || "";
  popup.append(title, meta);
  if (description.textContent) popup.append(description);
  if (point.address && point.description) {
    const address = document.createElement("p");
    address.textContent = point.address;
    address.className = "town-map-popup-address";
    popup.append(address);
  }
  addPopupLink(popup, point.href, "View TownGuide details");
  return popup;
}

function createAdvertisementPopup(point: MapPoint, advertisement: MapAdvertisement) {
  const popup = document.createElement("div");
  popup.className = "town-map-popup town-map-ad-popup";
  const badge = document.createElement("span");
  const headline = document.createElement("strong");
  const business = document.createElement("div");

  badge.textContent = "Paid advertisement";
  badge.className = "town-map-ad-badge";
  headline.textContent = advertisement.headline;
  headline.className = "town-map-ad-headline";
  business.textContent = point.name;
  business.className = "town-map-popup-meta";
  popup.append(badge);

  if (advertisement.imageUrl) {
    const image = document.createElement("img");
    image.src = advertisement.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    image.className = "town-map-ad-image";
    popup.append(image);
  }

  popup.append(headline, business);
  if (advertisement.copy) {
    const copy = document.createElement("p");
    copy.textContent = advertisement.copy;
    popup.append(copy);
  }
  addPopupLink(
    popup,
    advertisement.destinationUrl || point.href,
    "View today’s offer",
    advertisement,
  );
  return popup;
}

export function TownMap({ points }: { points: MapPoint[] }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    const recordedImpressions = new Set<string>();

    void import("leaflet").then((L) => {
      if (disposed || !container.current) return;

      map = L.map(container.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([34.414, -110.57], 12);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, and the GIS User Community',
          maxZoom: 19,
        },
      ).addTo(map);

      const bounds: [number, number][] = [];

      for (const point of points) {
        const position: [number, number] = [point.latitude, point.longitude];
        const advertisement = point.advertisement;
        bounds.push(position);

        const marker = L.circleMarker(position, {
          radius: advertisement ? 11 : 9,
          color: advertisement ? "#f0c84b" : "#ffffff",
          weight: advertisement ? 4 : 2,
          fillColor: markerStyles[point.kind].color,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindPopup(
            advertisement
              ? createAdvertisementPopup(point, advertisement)
              : createListingPopup(point),
            { maxWidth: 320, minWidth: 230 },
          );

        if (advertisement) {
          marker.on("popupopen", () => {
            if (recordedImpressions.has(advertisement.campaignId)) return;
            recordedImpressions.add(advertisement.campaignId);
            recordAdEvent(advertisement.campaignId, "impression");
          });
        }
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      }

      observer = new ResizeObserver(() => map?.invalidateSize());
      observer.observe(container.current);
      window.setTimeout(() => map?.invalidateSize(), 150);
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      map?.remove();
    };
  }, [points]);

  return (
    <div>
      <div
        ref={container}
        className="town-map h-[62vh] min-h-[440px] w-full sm:min-h-[520px]"
        aria-label={`Interactive TownGuide map with ${points.length} locations`}
      />
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold">
        {Object.entries(markerStyles).map(([kind, style]) => (
          <span className="inline-flex items-center gap-2" key={kind}>
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: style.color }}
            />
            {style.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-full border-[3px] border-[#f0c84b]" />
          Today’s advertiser
        </span>
      </div>
      {points.length === 0 && (
        <p className="mt-4 border border-sand/30 bg-white p-4 text-sm text-ink/65">
          The map is ready. Pins will appear automatically as published listings
          receive verified coordinates.
        </p>
      )}
    </div>
  );
}
