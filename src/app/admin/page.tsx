import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateDetailer } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Detailer } from "@/types/db";

export const metadata: Metadata = { title: "Admin" };

const tone = { pending: "amber", approved: "green", rejected: "red" } as const;

export default async function AdminPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase.from("detailers").select("*").order("created_at", { ascending: false });
  const detailers = (data ?? []) as Detailer[];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Detailers</h1>
      <ul className="space-y-3">
        {detailers.map((d) => (
          <li key={d.id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{d.business_name || "(no name)"}</p>
                <p className="text-sm text-slate-500">/{d.slug}</p>
              </div>
              <div className="flex gap-2">
                <Badge tone={tone[d.status]}>{d.status}</Badge>
                {d.verified && <Badge>Verified</Badge>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.status !== "approved" && <Action id={d.id} name="status" value="approved" label="Approve" />}
              {d.status !== "rejected" && <Action id={d.id} name="status" value="rejected" label="Reject" danger />}
              <Action id={d.id} name="verified" value={String(!d.verified)} label={d.verified ? "Remove verified" : "Mark verified"} />
            </div>
          </li>
        ))}
        {detailers.length === 0 && <p className="text-slate-500">No detailers yet.</p>}
      </ul>
    </div>
  );
}

function Action({ id, name, value, label, danger }: { id: string; name: string; value: string; label: string; danger?: boolean }) {
  return (
    <form action={updateDetailer}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name={name} value={value} />
      <Button type="submit" variant={danger ? "danger" : "secondary"} className="min-h-9">
        {label}
      </Button>
    </form>
  );
}
