// src/CampaignList.js
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "campaigns"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(data);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this campaign?")) {
      await deleteDoc(doc(db, "campaigns", id));
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>Campaigns</h2>
      <Link to="/campaigns/new">
        <button style={{ marginBottom: 16 }}>➕ Add New Campaign</button>
      </Link>
      {campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Client</th>
              <th>Campaign</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>{c.clientName}</td>
                <td>{c.campaignName}</td>
                <td>{c.manager}</td>
                <td>{c.status}</td>
                <td>
                  <button onClick={() => navigate(`/campaigns/${c.id}/edit`)}>✏️ Edit</button>{" "}
                  <button onClick={() => handleDelete(c.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CampaignList;
