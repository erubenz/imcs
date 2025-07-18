import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
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
  IconButton,
  Typography,
} from "@mui/material";
import { Edit, Delete, Send } from "@mui/icons-material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { tableCellSx } from "./components/common/tableStyles";
import { useNavigate } from "react-router-dom";

const ROLES = ["Admin", "Manager", "Account Manager", "Sales Manager", "Viewer"];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", name: "", lastName: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubInv = onSnapshot(collection(db, "invites"), (snapshot) => {
      const now = Date.now();
      setInvites(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((i) => {
            const created = i.createdAt?.toDate();
            return (
              !i.used &&
              created &&
              now - created.getTime() <= 2 * 24 * 60 * 60 * 1000
            );
          })
      );
    });
    return () => {
      unsubUsers();
      unsubInv();
    };
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      alert("Failed to update role.");
    }
  };

  const sendInviteEmail = async (email, token) => {
    const link = `${window.location.origin}/register/${token}`;
    console.log("Invite link for", email, link);
    const endpoint = process.env.REACT_APP_EMAIL_ENDPOINT;
    if (!endpoint) {
      alert("Email service not configured");
      return;
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, link, subject: "IMCS Invite" }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      console.error("Email send failed", e);
      alert("Failed to send email");
    }
  };

  const handleAdd = async () => {
    if (!newUser.email) return;
    try {
      const token = crypto.randomUUID();
      await setDoc(doc(db, "invites", token), {
        email: newUser.email,
        name: newUser.name,
        lastName: newUser.lastName,
        role: "Viewer",
        used: false,
        createdAt: serverTimestamp(),
      });
      await sendInviteEmail(newUser.email, token);
      setNewUser({ email: "", name: "", lastName: "" });
    } catch (err) {
      alert("Failed to send invite.");
    }
  };

  const handleResend = async (invite) => {
    await sendInviteEmail(invite.email, invite.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (err) {
        alert("Failed to delete user.");
      }
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
      {invites.length > 0 && (
        <Box sx={{ mb: 4, width: '100%', overflowX: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Pending Invites</Typography>
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={tableCellSx}>Email</TableCell>
                <TableCell sx={tableCellSx}>Name</TableCell>
                <TableCell sx={tableCellSx}>Last Name</TableCell>
                <TableCell sx={tableCellSx}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invites.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell sx={tableCellSx}>{inv.email}</TableCell>
                  <TableCell sx={tableCellSx}>{inv.name}</TableCell>
                  <TableCell sx={tableCellSx}>{inv.lastName}</TableCell>
                  <TableCell sx={tableCellSx}>
                    <IconButton size="small" onClick={() => handleResend(inv)}>
                      <Send fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      <Box sx={{ width: '100%', overflowX: "auto" }}>
        <Table size="small" aria-label="users table" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellSx}>Email</TableCell>
              <TableCell sx={tableCellSx}>Name</TableCell>
              <TableCell sx={tableCellSx}>Last Name</TableCell>
              <TableCell sx={tableCellSx}>Role</TableCell>
              <TableCell sx={tableCellSx}>Actions</TableCell>
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
                <TableCell sx={tableCellSx}>
                  <Stack direction="row" spacing={0}>
                    <IconButton size="small" onClick={() => navigate(`/inventory/users/${user.id}/edit`)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(user.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </PageWrapper>
  );
}
