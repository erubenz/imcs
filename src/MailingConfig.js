import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { db } from "./firebase";

export default function MailingConfig() {
  const [formData, setFormData] = useState({
    endpoint: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    smtpFrom: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "config", "mailing"));
        if (snap.exists()) {
          setFormData((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error("Failed to load mailing config", err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "config", "mailing"), formData, { merge: true });
      alert("Configuration saved");
    } catch (err) {
      alert("Failed to save configuration");
    }
  };

  return (
    <PageWrapper>
      <SectionTitle>Mailing Configuration</SectionTitle>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <TextField
            label="Email Endpoint"
            size="small"
            value={formData.endpoint}
            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
          />
          <TextField
            label="SMTP Host"
            size="small"
            value={formData.smtpHost}
            onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
          />
          <TextField
            label="SMTP Port"
            size="small"
            value={formData.smtpPort}
            onChange={(e) => setFormData({ ...formData, smtpPort: e.target.value })}
          />
          <TextField
            label="SMTP User"
            size="small"
            value={formData.smtpUser}
            onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
          />
          <TextField
            label="SMTP Password"
            size="small"
            type="password"
            value={formData.smtpPass}
            onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
          />
          <TextField
            label="From Email"
            size="small"
            value={formData.smtpFrom}
            onChange={(e) => setFormData({ ...formData, smtpFrom: e.target.value })}
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">Save</Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>Close</Button>
          </Stack>
        </Stack>
      </form>
    </PageWrapper>
  );
}
