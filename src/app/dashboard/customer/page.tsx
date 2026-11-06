import { requireRole } from "@/lib/auth";

export default async function CustomerDashboard() {
  const profile = await requireRole("customer");
  return (
    <div>
      <h1 className="text-2xl font-bold">Hi, {profile.full_name}</h1>
      <p className="mt-2 text-slate-600">Your bookings will show up here. (Booking arrives in step 5.)</p>
    </div>
  );
}
