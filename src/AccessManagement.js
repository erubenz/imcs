import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { Box, Checkbox, Table, TableHead, TableRow, TableCell, TableBody, Stack, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";
import { tableCellSx } from "./components/common/tableStyles";
import { db } from "./firebase";

const ROLES = ["Admin", "Manager", "Account Manager", "Sales Manager", "Viewer"];

const FUNCTIONS = [
  { id: "inventory", label: "Inventory Management" },
  { id: "clients", label: "Clients" },
  { id: "campaigns", label: "Campaigns" },
  { id: "calendar", label: "Calendar" },
  { id: "users", label: "Users & Roles" },
];

export default function AccessManagement() {
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "permissions"), (snapshot) => {
      const data = {};
      snapshot.forEach((docSnap) => {
        data[docSnap.id] = docSnap.data();
      });
      setPermissions(data);
    });
    return unsub;
  }, []);

  const togglePermission = async (funcId, role) => {
    const current = permissions[funcId]?.[role] || false;
    await setDoc(doc(db, "permissions", funcId), { [role]: !current }, { merge: true });
  };

  return (
    <PageWrapper type="wide">
      <SectionTitle>Access Management</SectionTitle>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small" aria-label="access table" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellSx}>Functionality</TableCell>
              {ROLES.map((r) => (
                <TableCell key={r} sx={tableCellSx}>{r}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {FUNCTIONS.map((f) => (
              <TableRow key={f.id}>
                <TableCell sx={tableCellSx}>{f.label}</TableCell>
                {ROLES.map((r) => (
                  <TableCell key={r} sx={tableCellSx}>
                    <Checkbox
                      checked={permissions[f.id]?.[r] || false}
                      onChange={() => togglePermission(f.id, r)}
                      size="small"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Close</Button>
      </Stack>
    </PageWrapper>
  );
}
