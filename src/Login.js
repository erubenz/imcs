// Refactored Login.js
import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to="/campaigns" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/campaigns");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <PageWrapper>
      <Paper elevation={2} sx={{ maxWidth: 400, mx: "auto", p: 4 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            size="small"
            margin="normal"
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            size="small"
            margin="normal"
            required
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </Box>
      </Paper>
    </PageWrapper>
  );
}
