"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export function ResetQrScansButton({
  action,
  total,
}: {
  action: () => void | Promise<void>;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-red-400/60 bg-red-950/30 px-5 py-3 font-bold text-red-100 hover:bg-red-950/50"
      >
        Reset all scans
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-scans-title"
        >
          <div className="w-full max-w-lg border border-red-300/40 bg-[#102f36] p-7 shadow-2xl">
            <span className="flex size-12 items-center justify-center rounded-full bg-red-950/60 text-red-200">
              <AlertTriangle aria-hidden="true" />
            </span>
            <p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-red-200">Permanent reset</p>
            <h2 id="reset-scans-title" className="mt-2 font-display text-3xl text-white">Are you sure?</h2>
            <p className="mt-4 leading-7 text-slate-200">
              Resetting will permanently delete all {total.toLocaleString()} recorded QR scans and their scan data.
              This cannot be undone.
            </p>
            <p className="mt-3 text-sm text-slate-300">
              Businesses, QR locations, signs, and tracking codes will remain active and will begin counting again from zero.
            </p>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-teal-100/30 px-5 py-3 font-bold text-white"
              >
                Cancel
              </button>
              <form action={action}>
                <button className="bg-red-700 px-5 py-3 font-black text-white hover:bg-red-600">
                  Yes, reset every scan
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
