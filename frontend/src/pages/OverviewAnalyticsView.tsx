import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function OverviewAnalyticsView() {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/manage-reports");
  };

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Welcome to Insight IQ
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Click on the below button to get started.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleUploadClick}>
        Start
      </Button>
    </Box>
  );
}
