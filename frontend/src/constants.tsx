export const API_URL_Local = "http://localhost:8000";
// export const API_URL_Local = "http://3.149.94.190:8000";
// export const API_URL = 'http://localhost:8000/api/excel/upload';

// import { API_URL_Local } from 'src/constants';

export const bars_color = "#8ffcff";
// export const trendline_color = "#8ffcff"
export const trendline_color = "#ff0000";

// Central Stripe config and a one-time script loader

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ??
  "pk_test_51S4QHu0uvF7V2VeBIJOMzBjIXPGxySNzasQD3rPFJFX5XCvfuAo3CD3WEIQFmskCXIfYY96jSC2g5QCxblh45Sum009T3Xdf2A";

// Replace with your real Pricing Table ID from Stripe dashboard
export const STRIPE_PRICING_TABLE_ID = "prctbl_1S4QtD0uvF7V2VeBoDT6iyhv";

const STRIPE_PRICING_TABLE_SCRIPT_URL =
  "https://js.stripe.com/v3/pricing-table.js";

let pricingTableScriptPromise: Promise<void> | null = null;

export function loadStripePricingTableScript(): Promise<void> {
  if (pricingTableScriptPromise) return pricingTableScriptPromise;

  pricingTableScriptPromise = new Promise((resolve, reject) => {
    const id = "stripe-pricing-table-js";
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.src = STRIPE_PRICING_TABLE_SCRIPT_URL;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Stripe pricing table script"));
    document.head.appendChild(s);
  });

  return pricingTableScriptPromise;
}
