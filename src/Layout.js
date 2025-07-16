// src/Layout.js
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  Box
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Inventory,
  Group,
  Store,
  ManageAccounts,
  Person,
  AccountTree,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Login, Logout } from "@mui/icons-material";

const drawerWidth = 240;

export default function Layout() {
  const [open, setOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const location = useLocation();
  
  const navigate = useNavigate();
const [user] = useAuthState(auth);

const handleLogout = async () => {
  await signOut(auth);
  navigate("/login");
};

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            IMCS Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => setInventoryOpen(!inventoryOpen)}>
            <ListItemIcon><Inventory /></ListItemIcon>
            <ListItemText primary="Inventory Management" />
            {inventoryOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={inventoryOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                component={Link}
                to="/inventory/chains"
                selected={location.pathname === "/inventory/chains"}
                sx={{ pl: 4 }}
              >
                <ListItemIcon><Store /></ListItemIcon>
                <ListItemText primary="Chains" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/inventory/managers"
                selected={location.pathname === "/inventory/managers"}
                sx={{ pl: 4 }}
              >
                <ListItemIcon><ManageAccounts /></ListItemIcon>
                <ListItemText primary="Managers" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/inventory/users"
                selected={location.pathname === "/inventory/users"}
                sx={{ pl: 4 }}
              >
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Users" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem
            button
            component={Link}
            to="/clients"
            selected={location.pathname === "/clients"}
          >
            <ListItemIcon><Group /></ListItemIcon>
            <ListItemText primary="Clients" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/campaigns"
            selected={location.pathname.startsWith("/campaigns")}
          >
            <ListItemIcon><AccountTree /></ListItemIcon>
            <ListItemText primary="Campaigns" />
          </ListItem>
        </List>
		{!user && (
  <ListItem
    button
    component={Link}
    to="/login"
    selected={location.pathname === "/login"}
  >
    <ListItemIcon><Login /></ListItemIcon>
    <ListItemText primary="Login" />
  </ListItem>
)}

{user && (
  <ListItem button onClick={handleLogout}>
    <ListItemIcon><Logout /></ListItemIcon>
    <ListItemText primary="Logout" />
  </ListItem>
)}

      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
