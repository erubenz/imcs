import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button, Stack, TextField } from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

export default function ChainEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ chainName: "", share: "" });

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "chains", id));
      if (snap.exists()) {
        const data = snap.data();
        setFormData({ chainName: data.chainName || "", share: data.share || "" });
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const shareNum = parseFloat(formData.share);
    if (isNaN(shareNum) || shareNum < 0) {
      alert("Share cannot be negative");
      return;
    }
    try {
      await updateDoc(doc(db, "chains", id), {
        chainName: formData.chainName,
        share: shareNum,
      });
      navigate("/inventory/chains");
    } catch (err) {
      alert("Failed to save chain.");
    }
  };

  return (
    <PageWrapper>
      <SectionTitle>Edit Chain</SectionTitle>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <TextField
            label="Chain Name"
            size="small"
            value={formData.chainName}
            onChange={(e) => setFormData({ ...formData, chainName: e.target.value })}
            required
          />
          <TextField
            label="Share (%)"
            size="small"
            type="number"
            inputProps={{ min: 0 }}
            value={formData.share}
            onChange={(e) => setFormData({ ...formData, share: e.target.value })}
            required
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">Save</Button>
            <Button variant="outlined" onClick={() => navigate("/inventory/chains")}>Cancel</Button>
          </Stack>
        </Stack>
      </form>
    </PageWrapper>
  );
}
