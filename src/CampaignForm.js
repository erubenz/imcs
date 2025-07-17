// src/CampaignForm.js
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

export default function CampaignForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [chains, setChains] = useState([]);
  const [useNewClient, setUseNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", legalEntity: "", taxNumber: "" });

  const [formData, setFormData] = useState({
    campaignName: "",
    clientId: "",
    managerId: "",
    status: "Planned",
    chains: [],
  });

  const [newChain, setNewChain] = useState({
    chainId: "",
    startDate: "",
    endDate: "",
    locationCount: 0,
    slotPrice: 0,
    scheduleType: "uniform",
    uniformSlots: 0,
    weekdaySlots: {},
    disabled: false,
  });
  const [editingChainIndex, setEditingChainIndex] = useState(null);
  const [campaignBudget, setCampaignBudget] = useState(0);

  useEffect(() => {
    const fetchRefs = async () => {
      const cSnap = await getDocs(collection(db, "clients"));
      setClients(cSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      const mSnap = await getDocs(collection(db, "managers"));
      setManagers(mSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      const chSnap = await getDocs(collection(db, "chains"));
      setChains(chSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRefs();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        const ref = doc(db, "campaigns", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            campaignName: data.campaignName || "",
            clientId: data.clientId || "",
            managerId: data.managerId || "",
            status: data.status || "Planned",
            chains: data.chains || [],
          });
        }
      };
      load();
    }
  }, [id, isEdit]);

  // Budget Calculation (Live)
  useEffect(() => {
    let total = 0;
    for (let chain of formData.chains) {
      if (chain.disabled) continue;
      const start = new Date(chain.startDate);
      const end = new Date(chain.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      let slots = 0;
      if (chain.slotSchedule?.type === "uniform") {
        slots = chain.slotSchedule.slots * days;
      } else if (chain.slotSchedule?.type === "weekday") {
        const weekdayCounts = Array(7).fill(0);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          weekdayCounts[d.getDay()]++;
        }
        slots = Object.entries(chain.slotSchedule.slots || {}).reduce((sum, [day, count]) => {
          const idx = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
          return sum + (count || 0) * weekdayCounts[idx];
        }, 0);
      }
      total += slots * chain.slotPrice * chain.locationCount;
    }
    setCampaignBudget(total);
  }, [formData.chains]);

  // --- FORM HANDLERS ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let clientId = formData.clientId;

      // Handle New Client
      if (useNewClient) {
        if (!newClient.name || clients.find((c) => c.name === newClient.name)) {
          alert("Duplicate or missing client name");
          return;
        }
        const clientRef = doc(collection(db, "clients"));
        await setDoc(clientRef, { ...newClient, createdAt: Timestamp.now() });
        clientId = clientRef.id;
      }

      // Get existing campaign (edit mode) to preserve createdAt
      let createdAt = Timestamp.now();
      if (isEdit) {
        const existing = await getDoc(doc(db, "campaigns", id));
        if (existing.exists() && existing.data().createdAt) {
          createdAt = existing.data().createdAt;
        }
      }

      const payload = {
        ...formData,
        clientId,
        createdAt,
        budget: campaignBudget,
        updatedAt: Timestamp.now(), // Always set on save, but not shown outside details!
      };

      const campaignId = isEdit ? id : `C_${Date.now()}`;
      await setDoc(doc(db, "campaigns", campaignId), payload);
      navigate("/campaigns");
    } catch (err) {
      console.error(err);
      alert("Failed to save campaign.");
    }
  };

  const handleChainAddOrUpdate = () => {
    const schedule = newChain.scheduleType === "uniform"
      ? { type: "uniform", slots: newChain.uniformSlots }
      : { type: "weekday", slots: newChain.weekdaySlots };
    const entry = { ...newChain, slotSchedule: schedule };
    const updated = [...formData.chains];
    if (editingChainIndex !== null) {
      updated[editingChainIndex] = entry;
      setEditingChainIndex(null);
    } else {
      updated.push(entry);
    }
    setFormData((prev) => ({ ...prev, chains: updated }));
    setNewChain({
      chainId: "",
      startDate: "",
      endDate: "",
      locationCount: 0,
      slotPrice: 0,
      scheduleType: "uniform",
      uniformSlots: 0,
      weekdaySlots: {},
      disabled: false,
    });
  };

  const editChain = (i) => {
    setNewChain({ ...formData.chains[i] });
    setEditingChainIndex(i);
  };
  const removeChain = (i) => {
    const updated = [...formData.chains];
    updated.splice(i, 1);
    setFormData((prev) => ({ ...prev, chains: updated }));
    if (editingChainIndex === i) setEditingChainIndex(null);
  };
  const toggleDisable = (i) => {
    const updated = [...formData.chains];
    updated[i].disabled = !updated[i].disabled;
    setFormData((prev) => ({ ...prev, chains: updated }));
  };

  // --- RENDER ---

  return (
    <PageWrapper type="wide">
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1000, ml: 0 }}>
        <SectionTitle sx={{ mb: 3 }}>
          {isEdit ? "Edit Campaign" : "New Campaign"}
        </SectionTitle>

        <Typography variant="h6" sx={{ mb: 2 }}>Campaign Info</Typography>
        <Stack spacing={2} alignItems="flex-start" sx={{ maxWidth: 520 }}>
          <TextField
            label="Campaign Name"
            fullWidth
            margin="dense"
            size="medium"
            variant="outlined"
            value={formData.campaignName}
            onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
            required
          />

          <FormControlLabel
            control={<Checkbox checked={useNewClient} onChange={(e) => setUseNewClient(e.target.checked)} />}
            label="Add New Client"
            sx={{ mt: 1 }}
          />

          {useNewClient ? (
            <Stack spacing={1} direction="column" sx={{ width: "100%" }}>
              <TextField
                label="Client Name"
                size="medium"
                fullWidth
                variant="outlined"
                margin="dense"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                required
              />
              <TextField
                label="Legal Entity"
                size="medium"
                fullWidth
                variant="outlined"
                margin="dense"
                value={newClient.legalEntity}
                onChange={(e) => setNewClient({ ...newClient, legalEntity: e.target.value })}
              />
              <TextField
                label="Tax Number"
                size="medium"
                fullWidth
                variant="outlined"
                margin="dense"
                value={newClient.taxNumber}
                onChange={(e) => setNewClient({ ...newClient, taxNumber: e.target.value })}
              />
            </Stack>
          ) : (
            <Select
              fullWidth
              size="medium"
              variant="outlined"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              displayEmpty
              sx={{ mt: 1 }}
              required
            >
              <MenuItem disabled value="">Select Client</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          )}

          <Select
            fullWidth
            size="medium"
            variant="outlined"
            value={formData.managerId}
            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
            displayEmpty
            sx={{ mt: 1 }}
            required
          >
            <MenuItem disabled value="">Select Manager</MenuItem>
            {managers.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name} {m.lastName}
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            size="medium"
            variant="outlined"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            sx={{ mt: 1 }}
          >
            {["Planned", "Recorded", "Active", "Completed"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </Stack>

        {/* Chain Allocation */}
        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Chain Allocation</Typography>
        <Paper sx={{ background: "#f9f9f9", p: 2, borderRadius: 2, mb: 3, maxWidth: 980 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" rowGap={2} columnGap={2}>
            <Select
              size="small"
              variant="outlined"
              value={newChain.chainId}
              onChange={(e) => setNewChain({ ...newChain, chainId: e.target.value })}
              displayEmpty
              sx={{ minWidth: 160 }}
            >
              <MenuItem disabled value="">Select Chain</MenuItem>
              {chains.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.chainName}</MenuItem>
              ))}
            </Select>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={newChain.startDate}
              onChange={(e) => setNewChain({ ...newChain, startDate: e.target.value })}
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={newChain.endDate}
              onChange={(e) => setNewChain({ ...newChain, endDate: e.target.value })}
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="Locations"
              type="number"
              size="small"
              variant="outlined"
              value={newChain.locationCount}
              onChange={(e) => setNewChain({ ...newChain, locationCount: parseInt(e.target.value) || 0 })}
              sx={{ maxWidth: 90 }}
            />
            <TextField
              label="Slot Price"
              type="number"
              size="small"
              variant="outlined"
              value={newChain.slotPrice}
              onChange={(e) => setNewChain({ ...newChain, slotPrice: parseInt(e.target.value) || 0 })}
              sx={{ maxWidth: 100 }}
            />
            <Select
              size="small"
              variant="outlined"
              value={newChain.scheduleType}
              onChange={(e) => setNewChain({ ...newChain, scheduleType: e.target.value })}
              sx={{ minWidth: 110 }}
            >
              <MenuItem value="uniform">Uniform</MenuItem>
              <MenuItem value="weekday">Weekday</MenuItem>
            </Select>
            {newChain.scheduleType === "uniform" ? (
              <TextField
                label="Slots/Day"
                type="number"
                size="small"
                variant="outlined"
                value={newChain.uniformSlots}
                onChange={(e) => setNewChain({ ...newChain, uniformSlots: parseInt(e.target.value) || 0 })}
                sx={{ maxWidth: 100 }}
              />
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <TextField
                    key={day}
                    label={day.slice(0, 3)}
                    type="number"
                    size="small"
                    variant="outlined"
                    value={newChain.weekdaySlots[day] || ""}
                    onChange={(e) =>
                      setNewChain((prev) => ({
                        ...prev,
                        weekdaySlots: { ...prev.weekdaySlots, [day]: parseInt(e.target.value) || 0 },
                      }))
                    }
                    sx={{ width: 80 }}
                  />
                ))}
              </Box>
            )}
            <Button
              onClick={handleChainAddOrUpdate}
              variant="contained"
              size="small"
              sx={{ ml: 2, minWidth: 120, alignSelf: "flex-end" }}
            >
              {editingChainIndex !== null ? "Update Chain" : "Add Chain"}
            </Button>
          </Stack>
        </Paper>

        {/* ADDED CHAINS TABLE */}
        {formData.chains.length > 0 && (
          <Box sx={{ mb: 3 }}>
  <Typography variant="subtitle1" sx={{ mb: 1 }}>
    Added Chains
  </Typography>
  <Table size="small" sx={{ minWidth: 1100, width: "100%", tableLayout: "fixed" }}>
    <TableHead>
      <TableRow>
        <TableCell sx={{ width: 160 }}>Chain</TableCell>
        <TableCell sx={{ width: 120 }}>Start</TableCell>
        <TableCell sx={{ width: 120 }}>End</TableCell>
        <TableCell sx={{ width: 90 }}>Locations</TableCell>
        <TableCell sx={{ width: 100 }}>Slot Price</TableCell>
        <TableCell sx={{ width: 100 }}>Schedule</TableCell>
        <TableCell sx={{ width: 110 }}>Slots Total</TableCell>
        <TableCell sx={{ width: 140 }}>Budget</TableCell>
        <TableCell sx={{ width: 210 }}>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {formData.chains.map((ch, i) => {
        // ...slots/budget calculation (unchanged)
        const start = new Date(ch.startDate);
        const end = new Date(ch.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        let slots = 0;
        if (ch.slotSchedule?.type === "uniform") {
          slots = ch.slotSchedule.slots * days;
        } else if (ch.slotSchedule?.type === "weekday") {
          const weekdayCounts = Array(7).fill(0);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            weekdayCounts[d.getDay()]++;
          }
          slots = Object.entries(ch.slotSchedule.slots || {}).reduce((sum, [day, count]) => {
            const idx = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
            return sum + (count || 0) * weekdayCounts[idx];
          }, 0);
        }
        const budget = slots * ch.slotPrice * ch.locationCount;

        return (
          <TableRow key={i} sx={ch.disabled ? { opacity: 0.5 } : {}}>
            <TableCell>{chains.find(c => c.id === ch.chainId)?.chainName || ch.chainId}</TableCell>
            <TableCell>{ch.startDate}</TableCell>
            <TableCell>{ch.endDate}</TableCell>
            <TableCell>{ch.locationCount}</TableCell>
            <TableCell>{ch.slotPrice}</TableCell>
            <TableCell>
              {ch.scheduleType === "uniform"
                ? `Uniform: ${ch.uniformSlots} slots/day`
                : "Weekday-based"}
            </TableCell>
            <TableCell>{slots}</TableCell>
            <TableCell>{budget.toLocaleString()} AMD</TableCell>
            <TableCell>
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: "100%" }}>
                <Button size="small" variant="text" onClick={() => editChain(i)}>Edit</Button>
                <Button size="small" variant="text" onClick={() => toggleDisable(i)} sx={{ mx: 0.5 }}>
                  {ch.disabled ? "Enable" : "Disable"}
                </Button>
                <Button size="small" variant="text" color="error" onClick={() => removeChain(i)}>
                  Remove
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</Box>

        )}

        <Typography variant="h6" sx={{ mt: 3, mb: 3 }}>
          Total Budget: {campaignBudget.toLocaleString()} AMD
        </Typography>

        <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">Save</Button>
            <Button variant="outlined" onClick={() => navigate("/inventory/chains")}>Cancel</Button>
          </Stack>
      </Box>
    </PageWrapper>
  );
}
