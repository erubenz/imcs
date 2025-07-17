import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button, Stack, TextField } from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

export default function ClientEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", legalEntity: "", taxNumber: "" });

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "clients", id));
      if (snap.exists()) {
        const data = snap.data();
        setFormData({
          name: data.name || "",
          legalEntity: data.legalEntity || "",
          taxNumber: data.taxNumber || "",
        });
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "clients", id), {
        name: formData.name,
        legalEntity: formData.legalEntity,
        taxNumber: formData.taxNumber,
      });
      navigate("/clients");
    } catch (err) {
      alert("Failed to save client.");
    }
  };

  return (
    <PageWrapper>
      <SectionTitle>Edit Client</SectionTitle>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <TextField
            label="Name"
            size="small"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            label="Legal Entity"
            size="small"
            value={formData.legalEntity}
            onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
          />
          <TextField
            label="Tax Number"
            size="small"
            value={formData.taxNumber}
            onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">Save</Button>
            <Button variant="outlined" onClick={() => navigate("/clients")}>Cancel</Button>
          </Stack>
        </Stack>
      </form>
    </PageWrapper>
  );
}
