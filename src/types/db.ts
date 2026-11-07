// Hand-written for now; replace with `supabase gen types typescript` output later if desired.
export type UserRole = "customer" | "detailer" | "admin";
export type DetailerStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  saved_address: string | null;
  saved_vehicle_size: "sedan" | "suv" | "truck" | null;
}

export interface Detailer {
  id: string;
  user_id: string;
  slug: string;
  business_name: string;
  bio: string;
  town: string;
  zip: string;
  status: DetailerStatus;
  verified: boolean;
  instant_book: boolean;
  jobs_per_window: number;
  created_at: string;
}

export interface DetailerPhoto {
  id: string;
  detailer_id: string;
  path: string; // storage path inside the detailer-photos bucket
  position: number;
  created_at: string;
}

export type Win = "morning" | "afternoon" | "evening";
export type BookingStatus = "requested" | "confirmed" | "en_route" | "in_progress" | "completed" | "declined" | "cancelled";

export interface ServiceRow {
  id: string;
  detailer_id: string;
  name: string;
  description: string;
  minutes: number;
  category: "exterior" | "interior" | "full" | "ceramic" | "fleet";
  price_sedan_cents: number;
  price_suv_cents: number;
  price_truck_cents: number;
  active: boolean;
}

export interface Booking {
  id: string;
  code: string;
  customer_id: string;
  detailer_id: string;
  service_id: string | null;
  service_name: string;
  vehicle: "sedan" | "suv" | "truck";
  address: string;
  day: string; // yyyy-mm-dd
  win: Win;
  note: string;
  price_cents: number;
  deposit_cents: number;
  deposit_paid: boolean;
  status: BookingStatus;
  created_at: string;
}
