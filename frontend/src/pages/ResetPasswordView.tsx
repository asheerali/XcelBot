import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { TextField, Button, Container, Paper, Typography, Alert, Box } from "@mui/material";
import { API_URL_Local } from "../constants";

export default function ResetPasswordView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = params.get("token") || formData.get("token");

    try {
      const res = await fetch(`${API_URL_Local}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: formData.get("password") }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setMessage(data.message);
      setTimeout(() => navigate("/sign-in"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>Reset Password</Typography>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            name="password"
            type="password"
            fullWidth
            required
            margin="normal"
          />
          {!params.get("token") && (
            <TextField
              label="Reset Token"
              name="token"
              fullWidth
              required
              margin="normal"
            />
          )}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Reset</Button>
        </Box>
      </Paper>
    </Container>
  );
}
