// layouts/Dashboard.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

// If you need any dashboard-specific layout components (like a header), add them here

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {/* If you want any dashboard-specific content, add it here */}
      <Box sx={{ py: 2 }}>
        <Outlet />
      </Box>
    </Container>
  );
};

export default Dashboard;