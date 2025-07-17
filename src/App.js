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
import Clients from "./Clients";
import ClientEdit from "./ClientEdit";
import Login from "./Login";
import CampaignDetail from "./CampaignDetail";
import NotFound from "./NotFound";

function App() {
  return (
    <Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Navigate to="/campaigns" />} />

    <Route path="campaigns">
      <Route index element={<CampaignList />} />
      <Route path="new" element={<CampaignForm />} />
      <Route path=":id/edit" element={<CampaignForm />} />
      <Route path=":id" element={<CampaignDetail />} />
      <Route path="client/:clientId" element={<CampaignList filteredBy="client" />} />
      <Route path="manager/:managerId" element={<CampaignList filteredBy="manager" />} />
    </Route>

    <Route path="inventory/chains" element={<Chains />} />
    <Route path="inventory/chains/:id/edit" element={<ChainEdit />} />
    <Route path="inventory/managers" element={<Managers />} />
    <Route path="inventory/managers/:id/edit" element={<ManagerEdit />} />
    <Route path="inventory/users" element={<Users />} />
    <Route path="clients" element={<Clients />} />
    <Route path="clients/:id/edit" element={<ClientEdit />} />
    <Route path="login" element={<Login />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>

  );
}

export default App;
