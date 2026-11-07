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
  const pending = detailers.filter((d) => d.status === "pending").length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight">Detailers</h1>
      <p className="mt-1 text-base text-muted">
        {pending ? `${pending} waiting for review` : "Nothing waiting for review"} · {detailers.length} total
      </p>

      {/* Sections, not cards: hairline rows between detailers. */}
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {detailers.map((d) => (
          <li key={d.id} className="py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{d.business_name || "(no name)"}</p>
                <p className="text-sm text-muted">
                  /{d.slug}
                  {d.town ? ` · ${d.town}` : ""}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Badge tone={tone[d.status]}>{d.status}</Badge>
                {d.verified && <Badge tone="neutral">Verified</Badge>}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {d.status !== "approved" && <Action id={d.id} name="status" value="approved" label="Approve" primary />}
              {d.status !== "rejected" && <Action id={d.id} name="status" value="rejected" label="Reject" danger />}
              <Action id={d.id} name="verified" value={String(!d.verified)} label={d.verified ? "Remove verified" : "Mark verified"} />
            </div>
          </li>
        ))}
      </ul>
      {detailers.length === 0 && (
        <div className="py-16 text-center">
          <h2 className="text-[22px] font-semibold tracking-tight">No detailers yet</h2>
          <p className="mt-2 text-base text-muted">New applications appear here for review.</p>
        </div>
      )}
    </div>
  );
}

function Action({
  id,
  name,
  value,
  label,
  danger,
  primary,
}: {
  id: string;
  name: string;
  value: string;
  label: string;
  danger?: boolean;
  primary?: boolean;
}) {
  return (
    <form action={updateDetailer}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name={name} value={value} />
      <Button type="submit" variant={danger ? "danger" : primary ? "dark" : "outline"} className="min-h-10">
        {label}
      </Button>
    </form>
  );
}
