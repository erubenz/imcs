import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button, Stack, TextField, Select, MenuItem } from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { db } from "./firebase";

const ROLES = ["Admin", "Manager", "Account Manager", "Sales Manager", "Viewer"];

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", name: "", lastName: "", role: "Viewer" });

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "users", id));
      if (snap.exists()) {
        const data = snap.data();
        setFormData({
          email: data.email || "",
          name: data.name || "",
          lastName: data.lastName || "",
          role: data.role || "Viewer",
        });
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", id), {
        name: formData.name,
        lastName: formData.lastName,
        role: formData.role,
      });
      navigate("/inventory/users");
    } catch (err) {
      alert("Failed to save user.");
    }
  };

  return (
    <PageWrapper>
      <SectionTitle>Edit User</SectionTitle>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <TextField label="Email" size="small" value={formData.email} InputProps={{ readOnly: true }} />
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
          <Select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            size="small"
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">Save</Button>
            <Button variant="outlined" onClick={() => navigate("/inventory/users")}>Cancel</Button>
          </Stack>
        </Stack>
      </form>
    </PageWrapper>
  );
}
