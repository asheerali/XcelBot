import React, { useEffect, useState } from "react";

// If you are on Next.js App Router, uncomment the next line
// "use client";

const PRICING_TABLE_ID = "prctbl_1S4QtD0uvF7V2VeBoDT6iyhv";

// Prefer pulling the publishable key from env vars
// Vite example:  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
// Next.js example: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const PUBLISHABLE_KEY =
  import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51S4QHu0uvF7V2VeBIJOMzBjIXPGxySNzasQD3rPFJFX5XCvfuAo3CD3WEIQFmskCXIfYY96jSC2g5QCxblh45Sum009T3Xdf2A";

const Payment: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = "stripe-pricing-table-js";
    if (!document.getElementById(id)) {
      const script = document.createElement("script");
      script.id = id;
      script.async = true;
      script.src = "https://js.stripe.com/v3/pricing-table.js";
      script.onload = () => setReady(true);
      document.head.appendChild(script);
    } else {
      setReady(true);
    }
  }, []);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 1rem" }}>
      {ready && (
        <stripe-pricing-table
          pricing-table-id={PRICING_TABLE_ID}
          publishable-key={PUBLISHABLE_KEY}
        />
      )}
    </div>
  );
};

export default Payment;
