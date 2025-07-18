import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  Button,
  TextField,
  Typography,
  Alert,
  Stack
} from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import { db, auth } from "./firebase";

export default function RegisterInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "invites", token));
      if (!snap.exists()) {
        setError("Invalid invite.");
        setLoading(false);
        return;
      }
      const data = snap.data();
      const created = data.createdAt?.toDate();
      const expired =
        !created || Date.now() - created.getTime() > 2 * 24 * 60 * 60 * 1000;
      if (data.used || expired) {
        setError("Invite expired.");
        setLoading(false);
        return;
      }
      setInvite(data);
      setName(data.name || "");
      setLastName(data.lastName || "");
      setLoading(false);
    };
    load();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invite) return;
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        invite.email,
        password
      );
      await updateDoc(doc(db, "users", cred.user.uid), {
        email: invite.email,
        name,
        lastName,
        role: invite.role || "Viewer",
      });
      await updateDoc(doc(db, "invites", token), { used: true });
      navigate("/login");
    } catch (err) {
      setError("Registration failed.");
    }
  };

  if (loading) return null;

  if (error) {
    return (
      <PageWrapper maxWidth={400} elevation={2} sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper maxWidth={400} elevation={2} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Complete Registration
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Last Name"
            size="small"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Email"
            size="small"
            value={invite.email}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Password"
            type="password"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained">
            Register
          </Button>
        </Stack>
      </form>
    </PageWrapper>
  );
}
