import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { db } from "./firebase";

export default function MailingConfig() {
  const [endpoint, setEndpoint] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "config", "mailing"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.endpoint) setEndpoint(data.endpoint);
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
      await setDoc(doc(db, "config", "mailing"), { endpoint }, { merge: true });
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
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
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
