import Link from "next/link";
import { headers } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminSignOut } from "@/components/admin-sign-out";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get("x-town-guide-path") || "";
  const login = path === "/admin/login";
  const customerReport = path.endsWith("/report");
  const printView = path === "/admin/qr/print";

  if (!login) await requireAdmin();

  // Customer-facing reports and print sheets keep their print-specific styling.
  if (customerReport || printView) return <>{children}</>;

  return (
    <div className="admin-theme min-h-screen">
      {!login && (
        <div className="admin-portal-bar border-b px-5 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link href="/admin" className="focus-ring flex items-center gap-3">
              <span className="admin-portal-icon flex size-10 items-center justify-center rounded-full">
                <ShieldCheck size={21} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Admin portal</span>
                <span className="block font-bold text-white">TownGuide Content Manager</span>
              </span>
            </Link>
            <AdminSignOut />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
