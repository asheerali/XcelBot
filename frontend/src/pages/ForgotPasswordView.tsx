import React from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Paper, Alert, Box } from "@mui/material";
import { API_URL_Local } from "../constants";

export default function ForgotPasswordView() {
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = { email: formData.get("email") };

    try {
      const res = await fetch(`${API_URL_Local}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>Forgot Password</Typography>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Email" name="email" type="email" fullWidth required margin="normal" />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Send Reset Link</Button>
        </Box>
      </Paper>
    </Container>
  );
}
