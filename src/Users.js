import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import {
  Box,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { tableCellSx } from "./components/common/tableStyles";

const ROLES = ["Admin", "Manager", "Account Manager", "Sales Manager", "Viewer"];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", name: "", lastName: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      alert("Failed to update role.");
    }
  };

  const handleAdd = async () => {
    if (!newUser.email) return;
    try {
      const userRef = doc(collection(db, "users"));
      await setDoc(userRef, {
        email: newUser.email,
        name: newUser.name,
        lastName: newUser.lastName,
        role: "Viewer",
      });
      setNewUser({ email: "", name: "", lastName: "" });
    } catch (err) {
      alert("Failed to add user.");
    }
  };

  return (
    <PageWrapper type="wide">
      <SectionTitle>Users & Roles</SectionTitle>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Email"
          size="small"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <TextField
          label="Name"
          size="small"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <TextField
          label="Last Name"
          size="small"
          value={newUser.lastName}
          onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
        />
        <Button variant="contained" onClick={handleAdd} disabled={!newUser.email}>
          Add
        </Button>
      </Stack>
      <Box sx={{ width: '100%', overflowX: "auto" }}>
        <Table size="small" aria-label="users table" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellSx}>Email</TableCell>
              <TableCell sx={tableCellSx}>Name</TableCell>
              <TableCell sx={tableCellSx}>Last Name</TableCell>
              <TableCell sx={tableCellSx}>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={tableCellSx}>{user.email}</TableCell>
                <TableCell sx={tableCellSx}>{user.name}</TableCell>
                <TableCell sx={tableCellSx}>{user.lastName}</TableCell>
                <TableCell sx={tableCellSx}>
                  <Select
                    value={user.role || "Viewer"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    size="small"
                    sx={{ minWidth: 110 }}
                  >
                    {ROLES.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </PageWrapper>
  );
}
