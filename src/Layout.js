// src/Layout.js
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
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
  CalendarMonth,
  AccountCircle,
  AdminPanelSettings,
  Security,
  Email,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login, Logout } from "@mui/icons-material";

const drawerWidth = 240;

export default function Layout() {
  const [open, setOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);
  const location = useLocation();
  
  const navigate = useNavigate();
  const { user, logout, role } = useAuth();

  const handleLogout = async () => {
    await logout();
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
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
            IMCS
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
          <ListItemButton onClick={() => setInventoryOpen(!inventoryOpen)}>
            <ListItemIcon><Inventory /></ListItemIcon>
            <ListItemText primary="Inventory Management" />
            {inventoryOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={inventoryOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                component={Link}
                to="/inventory/chains"
                selected={location.pathname === "/inventory/chains"}
                sx={{ pl: 4 }}
              >
                <ListItemIcon><Store /></ListItemIcon>
                <ListItemText primary="Chains" />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to="/inventory/managers"
                selected={location.pathname === "/inventory/managers"}
                sx={{ pl: 4 }}
              >
                <ListItemIcon><ManageAccounts /></ListItemIcon>
                <ListItemText primary="Managers" />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to="/inventory/users"
                selected={location.pathname === "/inventory/users"}
                sx={{ pl: 4 }}
              >
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton
            component={Link}
            to="/clients"
            selected={location.pathname === "/clients"}
          >
            <ListItemIcon><Group /></ListItemIcon>
            <ListItemText primary="Clients" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/campaigns"
            selected={location.pathname.startsWith("/campaigns")}
          >
            <ListItemIcon><AccountTree /></ListItemIcon>
            <ListItemText primary="Campaigns" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/calendar"
            selected={location.pathname === "/calendar"}
          >
            <ListItemIcon><CalendarMonth /></ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItemButton>

          {user && role === "Admin" && (
            <>
              <ListItemButton onClick={() => setControlOpen(!controlOpen)}>
                <ListItemIcon><AdminPanelSettings /></ListItemIcon>
                <ListItemText primary="Control Panel" />
                {controlOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={controlOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/control/access"
                    selected={location.pathname === "/control/access"}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText primary="Access Management" />
                  </ListItemButton>
                  <ListItemButton
                    component={Link}
                    to="/control/mailing"
                    selected={location.pathname === "/control/mailing"}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText primary="Mailing Configuration" />
                  </ListItemButton>
                </List>
              </Collapse>
            </>
          )}

          {!user && (
            <ListItemButton
              component={Link}
              to="/login"
              selected={location.pathname === "/login"}
            >
              <ListItemIcon><Login /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          )}

          {user && (
            <ListItemButton
              component={Link}
              to="/profile"
              selected={location.pathname === "/profile"}
            >
              <ListItemIcon><AccountCircle /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          )}

          {user && (
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          )}
        </List>

      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
