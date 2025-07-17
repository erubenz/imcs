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
import { Edit, Delete, AccountTree } from "@mui/icons-material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ name: "", legalEntity: "", taxNumber: "" });
  const navigate = useNavigate();

  useEffect(() => {
    getDocs(collection(db, "clients")).then((snapshot) => {
      setClients(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAdd = async () => {
    if (!newClient.name) return;
    const clientRef = doc(collection(db, "clients"));
    await setDoc(clientRef, {
      name: newClient.name,
      legalEntity: newClient.legalEntity,
      taxNumber: newClient.taxNumber,
    });
    setClients((prev) => [...prev, { id: clientRef.id, ...newClient }]);
    setNewClient({ name: "", legalEntity: "", taxNumber: "" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this client?")) {
      await deleteDoc(doc(db, "clients", id));
      setClients((prev) => prev.filter((c) => c.id !== id));
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
      <SectionTitle>Clients</SectionTitle>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Name"
          size="small"
          value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
        />
        <TextField
          label="Legal Entity"
          size="small"
          value={newClient.legalEntity}
          onChange={(e) => setNewClient({ ...newClient, legalEntity: e.target.value })}
        />
        <TextField
          label="Tax Number"
          size="small"
          value={newClient.taxNumber}
          onChange={(e) => setNewClient({ ...newClient, taxNumber: e.target.value })}
        />
        <Button variant="contained" onClick={handleAdd} disabled={!newClient.name}>
          Add
        </Button>
      </Stack>
      <Box sx={{ width: '100%', overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellSx}>ID</TableCell>
              <TableCell sx={tableCellSx}>Name</TableCell>
              <TableCell sx={tableCellSx}>Legal Entity</TableCell>
              <TableCell sx={tableCellSx}>Tax Number</TableCell>
              <TableCell sx={tableCellSx}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell sx={tableCellSx}>{c.id}</TableCell>
                <TableCell sx={tableCellSx}>{c.name}</TableCell>
                <TableCell sx={tableCellSx}>{c.legalEntity}</TableCell>
                <TableCell sx={tableCellSx}>{c.taxNumber}</TableCell>
                <TableCell sx={tableCellSx}>
                  <Stack direction="row" spacing={0}>
                    <IconButton size="small" onClick={() => navigate(`/clients/${c.id}/edit`)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/campaigns/client/${c.id}`)}>
                      <AccountTree fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(c.id)}>
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
