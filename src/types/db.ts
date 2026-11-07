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
  created_at: string;
}

export interface DetailerPhoto {
  id: string;
  detailer_id: string;
  path: string; // storage path inside the detailer-photos bucket
  position: number;
  created_at: string;
}
