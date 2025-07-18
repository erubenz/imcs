import React, { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { db, auth } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { Button, Stack, TextField } from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: "", lastName: "", password: "" });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFormData((prev) => ({ ...prev, name: data.name || "", lastName: data.lastName || "" }));
      }
    };
    load();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        lastName: formData.lastName,
      });
      if (formData.password) {
        await updatePassword(auth.currentUser, formData.password);
      }
      alert("Profile updated");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  return (
    <PageWrapper>
      <SectionTitle>Profile</SectionTitle>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <TextField
            label="Name"
            size="small"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Last Name"
            size="small"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <TextField
            label="New Password"
            type="password"
            size="small"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Button variant="contained" type="submit">Save</Button>
        </Stack>
      </form>
    </PageWrapper>
  );
}
