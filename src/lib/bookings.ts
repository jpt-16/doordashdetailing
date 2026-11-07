import type { BookingStatus, Win } from "@/types/db";

export const WINDOW_LABEL: Record<Win, string> = {
  morning: "Morning, 8 to 12",
  afternoon: "Afternoon, 12 to 4",
  evening: "Evening, 4 to 7",
};
export const WINDOW_SHORT: Record<Win, string> = { morning: "8 to 12", afternoon: "12 to 4", evening: "4 to 7" };
export const WINS: Win[] = ["morning", "afternoon", "evening"];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Waiting for detailer",
  confirmed: "Confirmed",
  en_route: "On the way",
  in_progress: "In progress",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};
export const STATUS_TONE: Record<BookingStatus, "amber" | "green" | "blue" | "red" | "neutral"> = {
  requested: "amber",
  confirmed: "green",
  en_route: "blue",
  in_progress: "blue",
  completed: "neutral",
  declined: "red",
  cancelled: "red",
};
export const ACTIVE: BookingStatus[] = ["requested", "confirmed", "en_route", "in_progress"];

export const dollars = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

/** Today in the launch timezone as yyyy-mm-dd (the server may run in UTC). */
export function todayNY() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

export function addDaysISO(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = Monday ... 6 = Sunday, matching the database. */
export function weekdayOf(iso: string) {
  return (new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7;
}

export function prettyDay(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(new Date(`${iso}T12:00:00Z`));
}
