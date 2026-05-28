import { siteConfig } from "../site.config";

export type JerikoConversionEvent =
  | "form_submit"
  | "call_click"
  | "booking_click"
  | "email_click";

type EventPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: EventPayload }) => void;
    posthog?: { capture?: (event: string, properties?: EventPayload) => void };
  }
}

export function trackEvent(event: JerikoConversionEvent, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;
  const provider = siteConfig.analyticsProvider.toLowerCase();
  if (provider === "ga4" && typeof window.gtag === "function") {
    window.gtag("event", event, payload);
    return;
  }
  if (provider === "plausible" && typeof window.plausible === "function") {
    window.plausible(event, { props: payload });
    return;
  }
  if (provider === "posthog" && typeof window.posthog?.capture === "function") {
    window.posthog.capture(event, payload);
  }
}

export function trackFormSubmit(form: string, payload: EventPayload = {}) {
  trackEvent("form_submit", { form, ...payload });
}

export function trackPhoneClick(location: string, payload: EventPayload = {}) {
  trackEvent("call_click", { location, ...payload });
}

export function trackBookingClick(location: string, payload: EventPayload = {}) {
  trackEvent("booking_click", { location, ...payload });
}

export function trackEmailClick(location: string, payload: EventPayload = {}) {
  trackEvent("email_click", { location, ...payload });
}
