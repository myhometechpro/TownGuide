"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatus } from "@/app/admin/content-actions";

const statuses = ["new", "reviewing", "resolved", "declined"] as const;

export function InquiryStatusForm({ id, initialStatus }: { id: string; initialStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [savedStatus, setSavedStatus] = useState(initialStatus);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    setError("");
    startTransition(async () => {
      try {
        const destination = await updateInquiryStatus(id, status);
        setSavedStatus(status);
        if (destination) router.push(destination);
        else router.refresh();
      } catch {
        setStatus(savedStatus);
        setError("Status could not be updated.");
      }
    });
  }

  return <div className="flex flex-wrap items-center justify-end gap-2">
    <select aria-label="Inquiry status" value={status} onChange={(event) => setStatus(event.target.value)} disabled={pending} className="h-11 border border-cream/20 px-3">
      {statuses.map((item) => <option value={item} key={item}>{item.replace("_", " ")}</option>)}
    </select>
    <button type="button" onClick={save} disabled={pending || status === savedStatus} className="border border-cream/20 px-4 py-2 font-bold disabled:opacity-50">{pending ? "Updating…" : "Update"}</button>
    {error && <p role="alert" className="w-full text-right text-xs font-bold text-red-700">{error}</p>}
  </div>;
}
