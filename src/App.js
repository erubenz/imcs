// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import CampaignList from "./CampaignList";
import CampaignForm from "./CampaignForm";
import Chains from "./Chains";
import Managers from "./Managers";
import ChainEdit from "./ChainEdit";
import ManagerEdit from "./ManagerEdit";
import Users from "./Users";
import UserEdit from "./UserEdit";
import RegisterInvite from "./RegisterInvite";
import Clients from "./Clients";
import ClientEdit from "./ClientEdit";
import Login from "./Login";
import CampaignDetail from "./CampaignDetail";
import PlacementCalendar from "./PlacementCalendar";
import NotFound from "./NotFound";
import RequireRole from "./components/auth/RequireRole";
import RequireAuth from "./components/auth/RequireAuth";
import Profile from "./Profile";
import AccessManagement from "./AccessManagement";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register/:token" element={<RegisterInvite />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="/campaigns" />} />

        <Route path="campaigns">
          <Route index element={<CampaignList />} />
          <Route path="new" element={<CampaignForm />} />
          <Route path=":id/edit" element={<CampaignForm />} />
          <Route path=":id" element={<CampaignDetail />} />
          <Route path="client/:clientId" element={<CampaignList filteredBy="client" />} />
          <Route path="manager/:managerId" element={<CampaignList filteredBy="manager" />} />
        </Route>

        <Route path="calendar" element={<PlacementCalendar />} />

        <Route
          path="inventory/chains"
          element={
            <RequireRole role="Admin">
              <Chains />
            </RequireRole>
          }
        />
        <Route
          path="inventory/chains/:id/edit"
          element={
            <RequireRole role="Admin">
              <ChainEdit />
            </RequireRole>
          }
        />
        <Route
          path="inventory/managers"
          element={
            <RequireRole role="Admin">
              <Managers />
            </RequireRole>
          }
        />
        <Route
          path="inventory/managers/:id/edit"
          element={
            <RequireRole role="Admin">
              <ManagerEdit />
            </RequireRole>
          }
        />
        <Route
          path="inventory/users"
          element={
            <RequireRole role="Admin">
              <Users />
            </RequireRole>
          }
        />
        <Route
          path="inventory/users/:id/edit"
          element={
            <RequireRole role="Admin">
              <UserEdit />
            </RequireRole>
          }
        />
        <Route
          path="control/access"
          element={
            <RequireRole role="Admin">
              <AccessManagement />
            </RequireRole>
          }
        />
        <Route path="profile" element={<Profile />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id/edit" element={<ClientEdit />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>

  );
}

export default App;
