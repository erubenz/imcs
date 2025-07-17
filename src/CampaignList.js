import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

export default function CampaignList({ filteredBy }) {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState({});
  const [managers, setManagers] = useState({});
  const [chains, setChains] = useState({});
  const [viewMode, setViewMode] = useState("general");
  const navigate = useNavigate();
  const { clientId, managerId } = useParams();

  useEffect(() => {
    const fetchAll = async () => {
      const [cSnap, mSnap, chSnap] = await Promise.all([
        getDocs(collection(db, "clients")),
        getDocs(collection(db, "managers")),
        getDocs(collection(db, "chains"))
      ]);

      const clientsMap = {};
      cSnap.forEach(doc => clientsMap[doc.id] = doc.data().name);

      const managersMap = {};
      mSnap.forEach(doc => {
        const d = doc.data();
        managersMap[doc.id] = `${d.name} ${d.lastName || ""}`.trim();
      });

      const chainMap = {};
      chSnap.forEach(doc => chainMap[doc.id] = doc.data().chainName);

      setClients(clientsMap);
      setManagers(managersMap);
      setChains(chainMap);

      let q = collection(db, "campaigns");
      if (filteredBy === "client" && clientId) q = query(q, where("clientId", "==", clientId));
      if (filteredBy === "manager" && managerId) q = query(q, where("managerId", "==", managerId));

      const campaignSnap = await getDocs(q);

      const result = [];
      campaignSnap.forEach(doc => {
        const data = doc.data();
        const chainCount = data.chains?.length || 0;
        const startDates = data.chains?.map(c => c.startDate) || [];
        const endDates = data.chains?.map(c => c.endDate) || [];
        const minStart = startDates.sort()[0] || "";
        const maxEnd = endDates.sort().reverse()[0] || "";

        result.push({
          id: doc.id,
          name: data.campaignName || "",
          clientId: data.clientId,
          managerId: data.managerId,
          client: clientsMap[data.clientId] || data.clientId,
          manager: managersMap[data.managerId] || data.managerId,
          start: minStart,
          end: maxEnd,
          chains: data.chains || [],
          chainCount: chainCount,
          budget: data.budget || 0,
          created: typeof data.createdAt === "string" ? data.createdAt.slice(0, 10) : "",
        });
      });

      setCampaigns(result);
    };

    fetchAll();
  }, [filteredBy, clientId, managerId]);

  const deleteCampaign = async (id) => {
    if (window.confirm("Delete this campaign?")) {
      try {
        await deleteDoc(doc(db, "campaigns", id));
        setCampaigns(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete campaign.");
      }
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

const renderGeneral = () => (
  <Box sx={{ width: '100%', overflowX: "auto" }}>
    <Table size="small" sx={{ minWidth: 900, tableLayout: "fixed" }}>
      <TableHead>
        <TableRow>
          <TableCell sx={tableCellSx}>ID</TableCell>
          <TableCell sx={tableCellSx}>Name</TableCell>
          <TableCell sx={tableCellSx}>Client</TableCell>
          <TableCell sx={tableCellSx}>Start</TableCell>
          <TableCell sx={tableCellSx}>End</TableCell>
          <TableCell sx={tableCellSx}>Chains</TableCell>
          <TableCell sx={tableCellSx}>Budget</TableCell>
          <TableCell sx={tableCellSx}>Manager</TableCell>
          <TableCell sx={tableCellSx}>Created</TableCell>
          <TableCell sx={tableCellSx}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {campaigns.map(c => (
          <TableRow key={c.id}>
            <TableCell sx={tableCellSx}><Button variant="text" size="small" onClick={() => navigate(`/campaigns/${c.id}`)} sx={{ minWidth: 0, px: 0.5 }}>
          {c.id}
        </Button></TableCell>
            <TableCell sx={tableCellSx}>{c.name}</TableCell>
            <TableCell sx={tableCellSx}><Button variant="text" size="small" onClick={() => navigate(`/campaigns/client/${c.clientId}`)} sx={{ minWidth: 0, px: 0.5 }}>
          {c.client}
        </Button></TableCell>
            <TableCell sx={tableCellSx}>{c.start}</TableCell>
            <TableCell sx={tableCellSx}>{c.end}</TableCell>
            <TableCell sx={tableCellSx}>{c.chainCount}</TableCell>
            <TableCell sx={tableCellSx}>{c.budget.toLocaleString()} AMD</TableCell>
            <TableCell sx={tableCellSx}><Button variant="text" size="small" onClick={() => navigate(`/campaigns/manager/${c.managerId}`)} sx={{ minWidth: 0, px: 0.5 }}>
          {c.manager}
        </Button></TableCell>
            <TableCell sx={tableCellSx}>{c.created}</TableCell>
            <TableCell sx={tableCellSx}>
              <Stack direction="row" spacing={0}>
                <IconButton size="small" onClick={() => navigate(`/campaigns/${c.id}/edit`)}><Edit fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => deleteCampaign(c.id)}><Delete fontSize="small" /></IconButton>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

const renderByChain = () => {
  const grouped = {};
  campaigns.forEach(c => {
    c.chains.forEach(ch => {
      const chainName = chains[ch.chainId] || ch.chainId;
      if (!grouped[chainName]) grouped[chainName] = [];
      grouped[chainName].push({ ...c, chain: ch });
    });
  });

  return Object.entries(grouped).map(([chainName, records]) => (
    <Box key={chainName} sx={{ mb: 4, width: '100%', overflowX: "auto" }}>
      <Typography variant="h6">{chainName}</Typography>
      <Table size="small" sx={{ minWidth: 900, tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={tableCellSx}>ID</TableCell>
            <TableCell sx={tableCellSx}>Name</TableCell>
            <TableCell sx={tableCellSx}>Client</TableCell>
            <TableCell sx={tableCellSx}>Start</TableCell>
            <TableCell sx={tableCellSx}>End</TableCell>
            <TableCell sx={tableCellSx}>Locations</TableCell>
            <TableCell sx={tableCellSx}>Budget</TableCell>
            <TableCell sx={tableCellSx}>Manager</TableCell>
            <TableCell sx={tableCellSx}>Slot Price</TableCell>
            <TableCell sx={tableCellSx}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((r, i) => {
            const start = r.chain.startDate;
            const end = r.chain.endDate;
            const days = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;
            let totalSlots = 0;
            if (r.chain.slotSchedule?.type === "uniform") {
              totalSlots = r.chain.slotSchedule.slots * days;
            } else if (r.chain.slotSchedule?.type === "weekday") {
              totalSlots = Object.values(r.chain.slotSchedule.slots || {}).reduce((a, b) => a + b, 0) * days / 7;
            }
            const budget = totalSlots * r.chain.slotPrice * r.chain.locationCount;
            return (
              <TableRow key={i}>
  <TableCell sx={tableCellSx}>
    <Button variant="text" size="small" onClick={() => navigate(`/campaigns/${r.id}`)} sx={{ minWidth: 0, px: 0.5 }}>
      {r.id}
    </Button>
  </TableCell>
  <TableCell sx={tableCellSx}>{r.name}</TableCell>
  <TableCell sx={tableCellSx}>
    <Button variant="text" size="small" onClick={() => navigate(`/campaigns/client/${r.clientId}`)} sx={{ minWidth: 0, px: 0.5 }}>
      {r.client}
    </Button>
  </TableCell>
  <TableCell sx={tableCellSx}>{start}</TableCell>
  <TableCell sx={tableCellSx}>{end}</TableCell>
  <TableCell sx={tableCellSx}>{r.chain.locationCount}</TableCell>
  <TableCell sx={tableCellSx}>{Math.round(budget).toLocaleString()} AMD</TableCell>
  <TableCell sx={tableCellSx}>
    <Button variant="text" size="small" onClick={() => navigate(`/campaigns/manager/${r.managerId}`)} sx={{ minWidth: 0, px: 0.5 }}>
      {r.manager}
    </Button>
  </TableCell>
  <TableCell sx={tableCellSx}>{r.chain.slotPrice} AMD</TableCell>
  <TableCell sx={tableCellSx}>
    <Stack direction="row" spacing={0}>
      <IconButton size="small" onClick={() => navigate(`/campaigns/${r.id}/edit`)}><Edit fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => deleteCampaign(r.id)}><Delete fontSize="small" /></IconButton>
    </Stack>
  </TableCell>
</TableRow>

            );
          })}
        </TableBody>
      </Table>
    </Box>
  ));
};


  return (
    <PageWrapper type="wide">
      <SectionTitle>Campaigns</SectionTitle>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button onClick={() => navigate("/campaigns/new")} variant="contained">
          Add Campaign
        </Button>
        <Button onClick={() => setViewMode(viewMode === "general" ? "chain" : "general")}>
          Switch to {viewMode === "general" ? "Chains View" : "General View"}
        </Button>
      </Stack>
      {viewMode === "general" ? renderGeneral() : renderByChain()}
    </PageWrapper>
  );
}
