import * as React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_PRICING_TABLE_ID,
  loadStripePricingTableScript,
} from "../constants";

export default function PaymentPage() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    loadStripePricingTableScript()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) setReady(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Plans
      </Typography>

      {!ready && <CircularProgress />}

      {ready && (
        <stripe-pricing-table
          pricing-table-id={STRIPE_PRICING_TABLE_ID}
          publishable-key={STRIPE_PUBLISHABLE_KEY}

        />
        //  <stripe-pricing-table
        //   pricing-table-id={STRIPE_PRICING_TABLE_ID}
        //   publishable-key={STRIPE_PUBLISHABLE_KEY}
        //   customer-email={session?.user?.email}
        //   client-reference-id={session?.user?.id}
        // />
      )}
    </Box>
  );
}
