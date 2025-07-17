import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button, Stack, TextField } from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

export default function ManagerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", lastName: "" });

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "managers", id));
      if (snap.exists()) {
        const data = snap.data();
        setFormData({ name: data.name || "", lastName: data.lastName || "" });
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "managers", id), {
        name: formData.name,
        lastName: formData.lastName,
      });
      navigate("/inventory/managers");
    } catch (err) {
      console.error(err);
      alert("Failed to update manager.");
    }
  };

  return (
    <PageWrapper>
      <SectionTitle>Edit Manager</SectionTitle>
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
            label="Last Name"
            size="small"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">Save</Button>
            <Button variant="outlined" onClick={() => navigate("/inventory/managers")}>Cancel</Button>
          </Stack>
        </Stack>
      </form>
    </PageWrapper>
  );
}
