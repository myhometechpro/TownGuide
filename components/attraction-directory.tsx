"use client";

import { useMemo, useState } from "react";
import type { Attraction } from "@/types";
import { AttractionCard } from "@/components/cards";

const filters = ["All", "Parks", "Lakes", "Museums", "Scenic", "Family Activities", "Historic", "Recreation", "Free"] as const;

function matches(item: Attraction, filter: typeof filters[number]) {
  if (filter === "All") return true;
  if (filter === "Free") return item.costType.toLowerCase() === "free";
  if (filter === "Museums") return item.category.toLowerCase() === "museums" || item.name.toLowerCase().includes("museum");
  return item.category.toLowerCase() === filter.toLowerCase();
}

export function AttractionDirectory({ attractions }: { attractions: Attraction[] }) {
  const [filter, setFilter] = useState<typeof filters[number]>("All");
  const visible = useMemo(() => attractions.filter((item) => matches(item, filter)), [attractions, filter]);

  return <>
    <div className="mb-8 flex flex-wrap gap-2" aria-label="Filter things to do">
      {filters.map((item) => <button type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter === item ? "bg-sky text-pine shadow-sm" : "bg-white hover:bg-sky/30"}`} key={item}>{item}</button>)}
    </div>
    <div aria-live="polite" className="sr-only">Showing {visible.length} {filter === "All" ? "things to do" : filter.toLowerCase()}</div>
    {visible.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <AttractionCard item={item} key={item.id}/>)}</div> : <p className="rounded-2xl bg-white p-8 text-ink/65">No published places are currently listed in {filter}.</p>}
  </>;
}
