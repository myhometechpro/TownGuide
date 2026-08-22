import {getSupabase} from "@/lib/supabase/server";import {redirect} from "next/navigation";
export function AdminSignOut(){async function signOut(){"use server";const db=await getSupabase();if(db)await db.auth.signOut();redirect("/admin/login")}return <form action={signOut}><button className="border border-cream/20 px-4 py-2 text-sm font-bold">Sign out</button></form>}
