import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { tableCellSx } from "./components/common/tableStyles";

export default function Managers() {
  const [managers, setManagers] = useState([]);
  const [newManager, setNewManager] = useState({ name: "", lastName: "" });
  const navigate = useNavigate();

  useEffect(() => {
    getDocs(collection(db, "managers")).then(snapshot => {
      setManagers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAdd = async () => {
    if (!newManager.name || !newManager.lastName) return;
    try {
      const managerRef = doc(collection(db, "managers"));
      await setDoc(managerRef, {
        name: newManager.name,
        lastName: newManager.lastName,
      });
      setManagers(prev => [...prev, { id: managerRef.id, ...newManager }]);
      setNewManager({ name: "", lastName: "" });
    } catch (err) {
      alert("Failed to add manager.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this manager?")) {
      try {
        await deleteDoc(doc(db, "managers", id));
        setManagers(managers.filter((m) => m.id !== id));
      } catch (err) {
        alert("Failed to delete manager.");
      }
    }
  };

  return (
    <PageWrapper type="wide">
      <SectionTitle>Managers</SectionTitle>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Name"
          size="small"
          value={newManager.name}
          onChange={e => setNewManager({ ...newManager, name: e.target.value })}
        />
        <TextField
          label="Last Name"
          size="small"
          value={newManager.lastName}
          onChange={e => setNewManager({ ...newManager, lastName: e.target.value })}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!newManager.name || !newManager.lastName}
        >
          Add
        </Button>
      </Stack>

      <Box sx={{ width: '100%', overflowX: "auto" }}>
        <Table size="small" aria-label="managers table" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellSx}>ID</TableCell>
              <TableCell sx={tableCellSx}>Name</TableCell>
              <TableCell sx={tableCellSx}>Last Name</TableCell>
              <TableCell sx={tableCellSx}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {managers.map((m) => (
              <TableRow key={m.id}>
                <TableCell sx={tableCellSx}>{m.id}</TableCell>
                <TableCell sx={tableCellSx}>{m.name}</TableCell>
                <TableCell sx={tableCellSx}>{m.lastName}</TableCell>
                <TableCell sx={tableCellSx}>
                  <Stack direction="row" spacing={0}>
                    <IconButton size="small" onClick={() => navigate(`/inventory/managers/${m.id}/edit`)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(m.id)}><Delete fontSize="small" /></IconButton>
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
