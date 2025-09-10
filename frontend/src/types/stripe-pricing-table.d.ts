// TypeScript support for the Stripe custom element

declare namespace JSX {
  interface IntrinsicElements {
    "stripe-pricing-table": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      "publishable-key": string;
      "pricing-table-id": string;
      "client-reference-id"?: string;
      "customer-email"?: string;
      "billing-address-collection"?: "auto" | "required";
      "customer-session-client-secret"?: string;
      "header-logo"?: string;
      theme?: "auto" | "light" | "dark";
      "search-param-keys"?: string;
      "allow-promotion-codes"?: "true" | "false";
    };
  }
}

