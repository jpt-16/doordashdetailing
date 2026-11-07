export const PHOTO_BUCKET = "detailer-photos";
export const MAX_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Public URL for a file in the photos bucket (the bucket is public read). */
export function photoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
