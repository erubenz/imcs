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
  Typography,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { tableCellSx } from "./components/common/tableStyles";

export default function Chains() {
  const [chains, setChains] = useState([]);
  const [newChain, setNewChain] = useState({ chainName: "", share: "", color: "#1976d2" });
  const [shareError, setShareError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  
  const handleAdd = async () => {
    if (!newChain.chainName || newChain.share === "") return;
    const shareNum = parseFloat(newChain.share);
    if (isNaN(shareNum) || shareNum < 0) {
      setShareError("Share cannot be negative");
      return;
    }
    setShareError("");
    setSubmitError("");
    try {
      const chainRef = doc(collection(db, "chains"));
      await setDoc(chainRef, {
        chainName: newChain.chainName,
        share: shareNum,
        color: newChain.color,
      });
      setChains(prev => [...prev, { id: chainRef.id, chainName: newChain.chainName, share: shareNum, color: newChain.color }]);
      setNewChain({ chainName: "", share: "", color: "#1976d2" });
    } catch (err) {
      setSubmitError("Failed to add chain.");
    }
  };

  useEffect(() => {
    getDocs(collection(db, "chains")).then(snapshot => {
      setChains(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this chain?")) {
      try {
        await deleteDoc(doc(db, "chains", id));
        setChains(chains.filter((c) => c.id !== id));
      } catch (err) {
        setSubmitError("Failed to delete chain.");
      }
    }
  };

  return (
    <PageWrapper type="wide">
      <SectionTitle>Supermarket Chains</SectionTitle>
	  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Chain Name"
          size="small"
          value={newChain.chainName}
          onChange={e => setNewChain({ ...newChain, chainName: e.target.value })}
        />
        <TextField
          label="Share (%)"
          size="small"
          type="number"
          inputProps={{ min: 0 }}
          value={newChain.share}
          onChange={e => setNewChain({ ...newChain, share: e.target.value })}
          error={!!shareError}
          helperText={shareError}
        />
        <TextField
          label="Color"
          type="color"
          size="small"
          value={newChain.color}
          onChange={e => setNewChain({ ...newChain, color: e.target.value })}
          sx={{ width: 70 }}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!newChain.chainName || !newChain.share}
        >
          Add
        </Button>
        {submitError && (
          <Typography color="error" sx={{ ml: 2 }}>
            {submitError}
          </Typography>
        )}
      </Stack>
      <Box sx={{ width: '100%', overflowX: "auto" }}>
        <Table size="small" aria-label="chains table" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellSx}>ID</TableCell>
              <TableCell sx={tableCellSx}>Name</TableCell>
              <TableCell sx={tableCellSx}>Share (%)</TableCell>
              <TableCell sx={tableCellSx}>Color</TableCell>
              <TableCell sx={tableCellSx}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {chains.map((chain) => (
              <TableRow key={chain.id}>
                <TableCell sx={tableCellSx}>{chain.id}</TableCell>
                <TableCell sx={tableCellSx}>{chain.chainName}</TableCell>
                <TableCell sx={tableCellSx}>{chain.share}</TableCell>
                <TableCell sx={tableCellSx}>
                  <Box sx={{ width: 20, height: 20, bgcolor: chain.color || "#1976d2", borderRadius: 0.5, border: '1px solid #ccc' }} />
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <Stack direction="row" spacing={0}>
                    <IconButton size="small" onClick={() => navigate(`/inventory/chains/${chain.id}/edit`)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(chain.id)}><Delete fontSize="small" /></IconButton>
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
