import React from "react";
import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

const Financials: React.FC = () => {
  const location = useLocation();
  const message =
    (location.state as any)?.message || "Welcome to the Financial Dashboard";

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        {message}
      </Typography>
    </Box>
  );
};

export default Financials;