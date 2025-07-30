import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { API_URL_Local } from "../constants";
import { useSession } from "../SessionContext";

export default function SignInView() {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch(`${API_URL_Local}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }

      const { access_token } = await res.json();
      const session = {
        user: {
          name: payload.email.split("@")[0],
          email: payload.email,
        },
      };

      localStorage.setItem("token", access_token);
      localStorage.setItem("session", JSON.stringify(session));
      setSession(session);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign In
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            required
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Sign In
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account? <Link to="/sign-up">Sign Up</Link>
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          Forgot your password? <Link to="/forgot-password">Reset here</Link>
        </Typography>
      </Paper>
    </Container>
  );
}
