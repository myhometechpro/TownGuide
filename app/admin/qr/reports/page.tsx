import Link from "next/link";
import { PrintReportButton } from "@/components/print-report-button";
import { requireAdmin } from "@/lib/supabase/auth";

type ScanRow = {
  scanned_at: string;
  qr_locations:
    | {
        code: string;
        name: string;
        businesses: { name: string } | { name: string }[] | null;
      }
    | {
        code: string;
        name: string;
        businesses: { name: string } | { name: string }[] | null;
      }[]
    | null;
};

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

function currentArizonaMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function monthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  return {
    start: `${month}-01T07:00:00.000Z`,
    end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T07:00:00.000Z`,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { db } = await requireAdmin();
  const params = await searchParams;
  const month = monthPattern.test(params.month || "")
    ? params.month!
    : currentArizonaMonth();
  const { start, end } = monthBounds(month);
  const { data, error } = await db
    .from("qr_scans")
    .select("scanned_at,qr_locations(code,name,businesses(name))")
    .gte("scanned_at", start)
    .lt("scanned_at", end)
    .order("scanned_at", { ascending: true });
  if (error) throw new Error(`Monthly scans could not be loaded: ${error.message}`);

  const scans = (data || []) as unknown as ScanRow[];
  const byLocation = new Map<string, { name: string; code: string; scans: number }>();
  const byDay = new Map<string, number>();

  for (const scan of scans) {
    const location = Array.isArray(scan.qr_locations)
      ? scan.qr_locations[0]
      : scan.qr_locations;
    if (!location) continue;
    const business = Array.isArray(location.businesses)
      ? location.businesses[0]
      : location.businesses;
    const existing = byLocation.get(location.code);
    byLocation.set(location.code, {
      code: location.code,
      name: business?.name || location.name,
      scans: (existing?.scans || 0) + 1,
    });
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Phoenix",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(scan.scanned_at));
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }

  const locations = [...byLocation.values()].sort((a, b) => b.scans - a.scans);
  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "America/Phoenix",
  }).format(new Date(`${month}-15T12:00:00-07:00`));

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-ink print:p-0">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link href="/admin/qr" className="font-bold text-forest">← QR tools</Link>
          <PrintReportButton />
        </div>
        <header className="mt-8 border-b-4 border-pine pb-7 print:mt-0">
          <p className="text-xs font-black uppercase tracking-[.2em] text-forest">
            TownGuide QR performance
          </p>
          <h1 className="mt-2 font-display text-4xl">Monthly scan report</h1>
          <p className="mt-3 text-ink/60">{monthLabel} · Arizona time</p>
        </header>
        <form className="mt-7 flex flex-wrap items-end gap-3 print:hidden">
          <label className="text-sm font-bold">
            Report month
            <input
              type="month"
              name="month"
              defaultValue={month}
              className="mt-2 block h-12 border border-cream/30 bg-[#202a24] px-3 text-cream"
            />
          </label>
          <button className="h-12 bg-pine px-5 font-bold text-cream">View report</button>
        </form>
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="bg-pine p-5 text-cream">
            <p className="text-4xl font-black">{scans.length}</p>
            <p className="mt-1 text-sm text-cream/70">Total scans</p>
          </article>
          <article className="bg-pine p-5 text-cream">
            <p className="text-4xl font-black">{locations.length}</p>
            <p className="mt-1 text-sm text-cream/70">Locations scanned</p>
          </article>
          <article className="bg-pine p-5 text-cream">
            <p className="truncate text-2xl font-black">{locations[0]?.name || "No scans"}</p>
            <p className="mt-1 text-sm text-cream/70">
              {locations[0] ? `${locations[0].scans} scans · top location` : "Top location"}
            </p>
          </article>
        </section>
        <section className="mt-10">
          <h2 className="font-display text-3xl">Scans by location</h2>
          <div className="mt-5 overflow-hidden border border-cream/30">
            <table className="w-full text-left text-sm">
              <thead className="bg-pine text-cream">
                <tr><th className="p-3">Location</th><th className="p-3">Code</th><th className="p-3 text-right">Scans</th></tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr className="border-t border-cream/30" key={location.code}>
                    <td className="p-3 font-bold">{location.name}</td>
                    <td className="p-3 font-mono text-xs">{location.code}</td>
                    <td className="p-3 text-right text-lg font-black">{location.scans}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!locations.length && <p className="p-5 text-ink/60">No QR scans were recorded this month.</p>}
          </div>
        </section>
        {days.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-3xl">Daily totals</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {days.map(([day, count]) => (
                <div className="flex justify-between border border-cream/30 p-3" key={day}>
                  <span>{day}</span><strong>{count}</strong>
                </div>
              ))}
            </div>
          </section>
        )}
        <footer className="mt-12 border-t border-cream/30 pt-5 text-xs text-ink/55">
          Counts include tracked TownGuide QR scans recorded from the first through the last day of the selected month in Arizona time.
        </footer>
      </div>
    </main>
  );
}
