// Google Analytics (GA4) helper for tracking key user actions
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
    if (import.meta.env.DEV) {
      console.log(`[GA4 Event] ${eventName}:`, eventParams);
    }
  } else {
    // In development or when GA is blocked, log mock event to console
    if (import.meta.env.DEV) {
      console.log(`[GA4 Track Event (Mock)] ${eventName}:`, eventParams);
    }
  }
};
