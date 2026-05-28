export const siteConfig = {
  name: "Exterior Envelope Pros",
  url: import.meta.env.VITE_SITE_URL || "",
  seoProfile: "local-service",
  analyticsProvider: import.meta.env.VITE_ANALYTICS_PROVIDER || "none",
  ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || "",
  plausibleDomain: import.meta.env.VITE_PLAUSIBLE_DOMAIN || "",
  posthogKey: import.meta.env.VITE_POSTHOG_KEY || "",
  googleSiteVerification: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || "",
  bingSiteVerification: import.meta.env.VITE_BING_SITE_VERIFICATION || "",
  imagePrompts: {
    hero: "Generate a realistic hero photo for Exterior Envelope Pros: a trustworthy business team at work, natural light, no text overlay, website-safe composition.",
    service: "Generate a realistic service photo for Exterior Envelope Pros: close-up of professional work, clean background, no logos, no text.",
    og: "Generate a branded open graph image for Exterior Envelope Pros: professional website preview, bold negative space, no readable text.",
  },
};

export type SiteConfig = typeof siteConfig;
