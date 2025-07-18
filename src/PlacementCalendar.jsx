import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { Link } from "react-router-dom";

export default function PlacementCalendar() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    client: "",
    campaign: "",
    manager: "",
    chain: "",
    status: "",
  });
  const [maps, setMaps] = useState({
    clients: {},
    campaigns: {},
    managers: {},
    chains: {},
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("dayGridMonth");
  const calendarRef = useRef(null);

  useEffect(() => {
    if (
      calendarRef.current &&
      typeof calendarRef.current.getApi === 'function' &&
      calendarRef.current.getApi() &&
      typeof calendarRef.current.getApi().changeView === 'function'
    ) {
      calendarRef.current.getApi().changeView(view);
    }
  }, [view]);

  useEffect(() => {
    const load = async () => {
      const [clientSnap, campaignSnap, managerSnap, chainSnap] = await Promise.all([
        getDocs(collection(db, "clients")),
        getDocs(collection(db, "campaigns")),
        getDocs(collection(db, "managers")),
        getDocs(collection(db, "chains")),
      ]);
      const clients = {};
      clientSnap.forEach((d) => (clients[d.id] = d.data().name));
      const managers = {};
      managerSnap.forEach((d) => {
        const m = d.data();
        managers[d.id] = `${m.name} ${m.lastName || ""}`.trim();
      });
      const chains = {};
      chainSnap.forEach((d) => {
        const ch = d.data();
        chains[d.id] = { name: ch.chainName, color: ch.color || "#1976d2" };
      });
      const campaigns = {};
      const evts = [];
      campaignSnap.forEach((doc) => {
        const data = doc.data();
        campaigns[doc.id] = data.campaignName;
        (data.chains || []).forEach((ch, i) => {
          evts.push({
            id: `${doc.id}-${i}`,
            title: data.campaignName,
            start: ch.startDate,
            end: new Date(new Date(ch.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            backgroundColor: chains[ch.chainId]?.color || "#1976d2",
            extendedProps: {
              campaignId: doc.id,
              chainId: ch.chainId,
              locationCount: ch.locationCount,
              clientId: data.clientId,
              managerId: data.managerId,
              status: data.status,
              start: ch.startDate,
              end: ch.endDate,
            },
          });
        });
      });
      setMaps({ clients, campaigns, managers, chains });
      setEvents(evts);
    };
    load();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filtered = events.filter((ev) => {
    if (filters.client && ev.extendedProps.clientId !== filters.client) return false;
    if (filters.campaign && ev.extendedProps.campaignId !== filters.campaign) return false;
    if (filters.manager && ev.extendedProps.managerId !== filters.manager) return false;
    if (filters.chain && ev.extendedProps.chainId !== filters.chain) return false;
    if (filters.status && ev.extendedProps.status !== filters.status) return false;
    return true;
  });

  return (
    <PageWrapper type="wide">
      <SectionTitle>Placement Calendar</SectionTitle>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(e, v) => v && setView(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="timeGridDay">Day</ToggleButton>
        <ToggleButton value="timeGridWeek">Week</ToggleButton>
        <ToggleButton value="dayGridMonth">Month</ToggleButton>
      </ToggleButtonGroup>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Client</InputLabel>
          <Select
            label="Client"
            name="client"
            value={filters.client}
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            {Object.entries(maps.clients).map(([id, name]) => (
              <MenuItem key={id} value={id}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Campaign</InputLabel>
          <Select label="Campaign" name="campaign" value={filters.campaign} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(maps.campaigns).map(([id, name]) => (
              <MenuItem key={id} value={id}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Manager</InputLabel>
          <Select label="Manager" name="manager" value={filters.manager} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(maps.managers).map(([id, name]) => (
              <MenuItem key={id} value={id}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Chain</InputLabel>
          <Select label="Chain" name="chain" value={filters.chain} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(maps.chains).map(([id, data]) => (
              <MenuItem key={id} value={id}>{data.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select labelId="status-label" label="Status" name="status" value={filters.status} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">active</MenuItem>
            <MenuItem value="paused">paused</MenuItem>
            <MenuItem value="completed">completed</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        height="auto"
        events={filtered}
        eventClick={(info) => setSelectedEvent(info.event)}
      />
      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        <DialogTitle>Placement Details</DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box>
              <Typography><b>Campaign:</b> {maps.campaigns[selectedEvent.extendedProps.campaignId]}</Typography>
              <Typography><b>Chain:</b> {maps.chains[selectedEvent.extendedProps.chainId]?.name}</Typography>
              <Typography><b>Locations:</b> {selectedEvent.extendedProps.locationCount}</Typography>
              <Typography><b>Status:</b> {selectedEvent.extendedProps.status}</Typography>
              <Typography><b>Start:</b> {selectedEvent.extendedProps.start}</Typography>
              <Typography><b>End:</b> {selectedEvent.extendedProps.end}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <Button component={Link} to={`/campaigns/${selectedEvent.extendedProps.campaignId}/edit`}>
              Edit Campaign
            </Button>
          )}
          <Button onClick={() => setSelectedEvent(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}
