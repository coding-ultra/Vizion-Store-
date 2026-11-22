import {requireAuth} from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";
export const dynamic="force-dynamic";
export default async function ProfilePage(){const user=await requireAuth();return <><h1 className="text-3xl font-bold">Your Profile</h1><p className="mt-2 text-gray-400">Update your account name or password.</p><ProfileForm name={user.name} email={user.email}/></>;}
