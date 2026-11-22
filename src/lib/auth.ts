import "server-only";
import { redirect } from "next/navigation";
import { readSessionId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
export type AppUser={id:string;name:string;email:string;role:"admin"|"user"};
export async function getCurrentUser():Promise<AppUser|null>{const id=await readSessionId();if(!id)return null;const {data}=await supabaseAdmin.from("users").select("id,name,email,role").eq("id",id).maybeSingle();if(!data)return null;return data as AppUser;}
export async function requireAuth(){const user=await getCurrentUser();if(!user)redirect("/login");return user;}
export async function requireAdmin(){const user=await getCurrentUser();if(!user)redirect("/login");if(user.role!=="admin")redirect("/dashboard");return user;}
