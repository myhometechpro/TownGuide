"use client";

import { useFormStatus } from "react-dom";
import { deleteBusiness } from "@/app/admin/businesses/actions";

function DeleteButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="border border-red-500 bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">
    {pending ? "Deleting…" : "Delete business"}
  </button>;
}

export function DeleteBusinessButton({ id, name }: { id: string; name: string }) {
  return <form action={deleteBusiness} onSubmit={(event) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? Related advertising campaigns and deals will also be deleted. This cannot be undone.`)) event.preventDefault();
  }} className="mt-6 flex justify-end">
    <input type="hidden" name="id" value={id}/>
    <DeleteButton/>
  </form>;
}
