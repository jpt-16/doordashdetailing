import { createClient } from "@/lib/supabase/server";
import { addDaysISO, todayNY, weekdayOf, WINS } from "@/lib/bookings";
import type { Detailer, Win } from "@/types/db";

export type Slot = { date: string; wins: Win[] };

/**
 * Days and arrival windows a customer can still book with this detailer, starting tomorrow.
 * A window is open when the detailer works that weekday + window and it is not already full.
 * (The database re-checks all of this when the booking is created.)
 */
export async function getSlots(d: Detailer, days = 14): Promise<Slot[]> {
  try {
    const supabase = await createClient();
    const start = addDaysISO(todayNY(), 1);
    const end = addDaysISO(start, days - 1);
    const [av, booked] = await Promise.all([
      supabase.from("availability").select("weekday, win").eq("detailer_id", d.id),
      supabase.rpc("booked_windows", { p_detailer: d.id, p_from: start, p_to: end }),
    ]);
    const open = new Set(((av.data ?? []) as { weekday: number; win: string }[]).map((r) => `${r.weekday}:${r.win}`));
    const taken = new Map(((booked.data ?? []) as { day: string; win: string; taken: number }[]).map((r) => [`${r.day}:${r.win}`, r.taken]));
    const out: Slot[] = [];
    for (let i = 0; i < days; i++) {
      const date = addDaysISO(start, i);
      const dow = weekdayOf(date);
      const wins = WINS.filter((w) => open.has(`${dow}:${w}`) && (taken.get(`${date}:${w}`) ?? 0) < d.jobs_per_window);
      if (wins.length) out.push({ date, wins });
    }
    return out;
  } catch {
    return [];
  }
}
