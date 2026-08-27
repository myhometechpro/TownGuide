"use client";

import { deleteBusiness } from "@/app/admin/businesses/actions";

export function DeleteBusinessButton({ id, name }: { id: string; name: string }) {
  return <button type="submit" name="id" value={id} formAction={deleteBusiness} formNoValidate onClick={(event) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? Related advertising campaigns and deals will also be deleted. This cannot be undone.`)) event.preventDefault();
  }} className="border border-red-500 bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800">
    Delete business
  </button>;
}
