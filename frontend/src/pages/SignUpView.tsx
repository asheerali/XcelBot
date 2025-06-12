import * as React from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { API_URL_Local } from "../constants";
import { useSession } from "../SessionContext";

const SignUpView: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const { setSession } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      phone_number: formData.get("phone_number"),
      role: "admin", // default role
    };

    try {
      const res = await fetch(`${API_URL_Local}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Sign up failed");
      }

      const { access_token } = await res.json();

      const session = {
        user: {
          name: `${payload.first_name} ${payload.last_name}`,
          email: payload.email,
        },
      };

      localStorage.setItem("token", access_token);
      localStorage.setItem("session", JSON.stringify(session));
      setSession(session);

      navigate("/"); // redirect to main dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign Up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="First Name"
            name="first_name"
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Last Name"
            name="last_name"
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Phone Number"
            name="phone_number"
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
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account? <Link to="/sign-in">Sign In</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default SignUpView;
