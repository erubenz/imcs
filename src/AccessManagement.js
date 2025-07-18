import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import {
  Box,
  Checkbox,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Button,
} from "@mui/material";
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
        const raw = docSnap.data();
        const entry = {};
        let needsFix = false;
        ROLES.forEach((r) => {
          const roleData = raw?.[r] || {};
          let read = roleData.read ?? false;
          let write = roleData.write ?? false;
          if (r === "Admin" && (!read || !write)) {
            read = true;
            write = true;
            needsFix = true;
          }
          entry[r] = { read, write };
        });
        if (needsFix) {
          setDoc(
            doc(db, "permissions", docSnap.id),
            { Admin: { read: true, write: true } },
            { merge: true }
          );
        }
        data[docSnap.id] = entry;
      });
      setPermissions(data);
    });
    return unsub;
  }, []);

  const togglePermission = async (funcId, role, type) => {
    if (role === "Admin") return;
    const current = permissions[funcId]?.[role]?.[type] || false;
    await setDoc(
      doc(db, "permissions", funcId),
      {
        [role]: { ...permissions[funcId]?.[role], [type]: !current },
        Admin: { read: true, write: true },
      },
      { merge: true }
    );
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
                <React.Fragment key={r}>
                  <TableCell sx={tableCellSx}>{r} R</TableCell>
                  <TableCell sx={tableCellSx}>{r} W</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {FUNCTIONS.map((f) => (
              <TableRow key={f.id}>
                <TableCell sx={tableCellSx}>{f.label}</TableCell>
                {ROLES.map((r) => (
                  <React.Fragment key={r}>
                    <TableCell sx={tableCellSx}>
                      <Checkbox
                        checked={permissions[f.id]?.[r]?.read || false}
                        onChange={() => togglePermission(f.id, r, "read")}
                        size="small"
                        disabled={r === "Admin"}
                      />
                    </TableCell>
                    <TableCell sx={tableCellSx}>
                      <Checkbox
                        checked={permissions[f.id]?.[r]?.write || false}
                        onChange={() => togglePermission(f.id, r, "write")}
                        size="small"
                        disabled={r === "Admin"}
                      />
                    </TableCell>
                  </React.Fragment>
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
