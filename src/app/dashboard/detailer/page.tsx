import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { Detailer } from "@/types/db";

export default async function DetailerDashboard() {
  const profile = await requireRole("detailer");
  const supabase = await createClient();
  const { data } = await supabase.from("detailers").select("*").eq("user_id", profile.id).single();
  const detailer = data as Detailer | null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hi, {profile.full_name}</h1>
      {detailer?.status === "approved" ? (
        <div className="rounded-xl bg-green-50 p-4 text-green-900">
          <Badge tone="green">Approved</Badge>
          <p className="mt-2 text-sm">You’re live. Profile, services and jobs arrive in the next steps.</p>
        </div>
      ) : detailer?.status === "rejected" ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-900">
          <Badge tone="red">Not approved</Badge>
          <p className="mt-2 text-sm">Your application wasn’t approved. Contact support for details.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 p-4 text-amber-900">
          <Badge tone="amber">Pending approval</Badge>
          <p className="mt-2 text-sm">
            We’re reviewing your application. You can set up your profile while you wait, and you’ll go live once approved.
          </p>
        </div>
      )}
    </div>
  );
}
