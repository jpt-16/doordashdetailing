// PLACEHOLDER DATA. The database only has `profiles` and `detailers` so far (README steps 3-9 add services,
// photos, bookings and reviews). Until those tables exist, the UI reads these shapes from here, so swapping
// in real queries later only means replacing the functions in this file and `src/lib/detailers.ts`.
import type { Detailer } from "@/types/db";

export type VehicleSize = "sedan" | "suv" | "truck";

export interface Service {
  id: string;
  name: string;
  blurb: string;
  mins: number;
  base: number; // sedan price in dollars
  cat: "exterior" | "interior" | "full" | "ceramic" | "fleet";
}

export const SERVICES: Service[] = [
  { id: "express", name: "Express exterior wash", blurb: "Hand wash, wheels and tires, windows.", mins: 45, base: 50, cat: "exterior" },
  { id: "premium", name: "Premium exterior", blurb: "Wash, clay bar and a spray sealant.", mins: 90, base: 85, cat: "exterior" },
  { id: "interior", name: "Interior deep clean", blurb: "Vacuum, steam, leather and plastics.", mins: 120, base: 140, cat: "interior" },
  { id: "pet", name: "Pet hair removal", blurb: "Extra pass for fur on seats and carpet.", mins: 45, base: 60, cat: "interior" },
  { id: "full", name: "Full detail", blurb: "Inside and out, with paint sealant.", mins: 240, base: 245, cat: "full" },
  { id: "ceramic", name: "Ceramic spray sealant", blurb: "Six months of gloss and water beading.", mins: 60, base: 120, cat: "ceramic" },
];

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "full", label: "Full detail" },
  { id: "interior", label: "Interior" },
  { id: "exterior", label: "Exterior" },
  { id: "ceramic", label: "Ceramic" },
  { id: "fleet", label: "Fleet" },
] as const;

export const SIZE_FACTOR: Record<VehicleSize, number> = { sedan: 1, suv: 1.15, truck: 1.3 };

export function servicePrice(base: number, size: VehicleSize, factor = 1) {
  return Math.round(base * SIZE_FACTOR[size] * factor);
}

export interface Review {
  name: string;
  when: string;
  rating: number;
  text: string;
  ts: number; // for sorting, higher = newer
}

const REVIEWS: Review[] = [
  { name: "Dana R.", when: "2 weeks ago", rating: 5, ts: 8, text: "Showed up on time and did the Outback in the driveway. It looks new." },
  { name: "Chris M.", when: "1 month ago", rating: 5, ts: 7, text: "Easy to rebook. The same detailer came back two weeks later." },
  { name: "Priya S.", when: "1 month ago", rating: 5, ts: 6, text: "I saw the full price and the deposit before I paid anything. Careful with the paint." },
  { name: "Tom L.", when: "2 months ago", rating: 4, ts: 5, text: "Great interior clean. Ran about 20 minutes over, but they messaged ahead." },
  { name: "Jess K.", when: "2 months ago", rating: 5, ts: 4, text: "Dog hair everywhere and it all came out. Would book again." },
  { name: "Mo A.", when: "3 months ago", rating: 5, ts: 3, text: "Booked at 8 in the morning, car was spotless by noon." },
  { name: "Ellen W.", when: "4 months ago", rating: 4, ts: 2, text: "Good value for the full detail. Wheels were the best part." },
  { name: "Sam B.", when: "5 months ago", rating: 5, ts: 1, text: "Friendly, quick and clear about what each service covers." },
];

export interface Listing {
  rating: number;
  reviews: Review[];
  years: number;
  jobs: number;
  factor: number; // price multiplier vs the base menu
  instant: boolean;
  photos: number;
  services: Service[];
  replyHours: number;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function hueFor(slug: string) {
  return hash(slug) % 360;
}

export function listingFor(slug: string): Listing {
  const h = hash(slug);
  const reviews = REVIEWS.slice(0, 3 + (h % 6));
  const rating = Math.round((reviews.reduce((t, r) => t + r.rating, 0) / reviews.length) * 10) / 10;
  const services = SERVICES.filter((_, i) => (h >> i) % 5 !== 0 || i < 3);
  return {
    rating,
    reviews,
    years: 1 + (h % 7),
    jobs: 20 + (h % 180),
    factor: [0.9, 1, 1.1, 1.2][h % 4],
    instant: h % 2 === 0,
    photos: 4 + (h % 3),
    services,
    replyHours: 1 + (h % 3),
  };
}

export function fromPrice(slug: string, size: VehicleSize = "sedan") {
  const l = listingFor(slug);
  return Math.min(...l.services.map((s) => servicePrice(s.base, size, l.factor)));
}

const base = { user_id: "sample", bio: "", zip: "01701", status: "approved" as const, created_at: "2026-01-01" };
export const SAMPLE_DETAILERS: Detailer[] = [
  { ...base, id: "s1", slug: "bay-state-mobile-detail", business_name: "Bay State Mobile Detail", town: "Framingham", verified: true,
    bio: "Bay State is built for busy drivers. We bring water, power and everything else, so you never have to move your car. Every job is photographed and you get a receipt in the app. We work on sedans, SUVs and light trucks across Framingham, Natick and Ashland." },
  { ...base, id: "s2", slug: "sudbury-shine-co", business_name: "Sudbury Shine Co.", town: "Sudbury", verified: true,
    bio: "A careful, paint-first approach. The owner reviews each request personally and confirms a time within a couple of hours." },
  { ...base, id: "s3", slug: "marcus-auto-spa", business_name: "Marcus Auto Spa", town: "Framingham", verified: false,
    bio: "New on the platform and priced to try. Quick washes and interior cleans, often bookable the same day." },
  { ...base, id: "s4", slug: "natick-nano-detail", business_name: "Natick Nano Detail", town: "Natick", verified: true,
    bio: "Specialists in ceramic coatings and full details for cars you plan to keep for years." },
];

export const DEFAULT_BIO =
  "This detailer comes to your driveway with water and power, so you do not need to move your car. Ask a question after you book and they will reply in the app.";
