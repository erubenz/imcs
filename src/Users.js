import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import {
  Box,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

const ROLES = ["Admin", "Manager", "Account Manager", "Sales Manager", "Viewer"];

export default function Users() {
  const [users, setUsers] = useState([]);

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

  const tableCellSx = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 120,
    fontSize: 13,
    p: 1,
  };

  return (
    <PageWrapper type="wide">
      <SectionTitle>Users & Roles</SectionTitle>
      <Box sx={{ width: '100%', overflowX: "auto" }}>
        <Table size="small" aria-label="users table" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellSx}>Email</TableCell>
              <TableCell sx={tableCellSx}>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={tableCellSx}>{user.email}</TableCell>
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
