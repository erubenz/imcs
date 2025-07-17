// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import CampaignList from "./CampaignList";
import CampaignForm from "./CampaignForm";
import Chains from "./Chains";
import Managers from "./Managers";
import Users from "./Users";
import Clients from "./Clients";
import Login from "./Login";
import CampaignDetail from "./CampaignDetail";

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
	  <Route path="campaign/:id" element={<CampaignDetail />} />
    </Route>

    <Route path="inventory/chains" element={<Chains />} />
    <Route path="inventory/managers" element={<Managers />} />
    <Route path="inventory/users" element={<Users />} />
    <Route path="clients" element={<Clients />} />
    <Route path="login" element={<Login />} />
  </Route>
</Routes>

  );
}

export default App;
