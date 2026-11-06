// Single place to rename the product and tune global settings.
export const brand = {
  name: "DetailDash",
  tagline: "Vetted mobile car detailers, at your door.",
  supportEmail: "support@example.com",
  launchArea: "Framingham & MetroWest, MA",
  defaultZip: "01701",
  timezone: "America/New_York",
  depositPercent: 25, // % of total charged at booking
  platformFeePercent: 15, // % kept by the platform on payout
} as const;
