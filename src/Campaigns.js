// src/Campaigns.js
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

function Campaigns({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    client: "",
    status: "Planned",
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    // Real-time listener for campaigns collection
    const unsub = onSnapshot(collection(db, "campaigns"), (snap) => {
      setCampaigns(
        snap.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      );
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!newCampaign.name || !newCampaign.client) return;
    try {
      await addDoc(collection(db, "campaigns"), {
        ...newCampaign,
        createdBy: user.email,
        createdAt: new Date(),
      });
      setNewCampaign({ name: "", client: "", status: "Planned" });
    } catch (err) {
      console.error(err);
      alert("Failed to add campaign.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "campaigns", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete campaign.");
    }
  };

  const startEdit = (campaign) =>
    setEditing({ ...campaign, status: campaign.status || "Planned" });

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(db, "campaigns", editing.id), {
        name: editing.name,
        client: editing.client,
        status: editing.status,
        updatedAt: new Date(),
      });
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update campaign.");
    }
  };

  return (
    <div>
      <h3>Campaigns</h3>
      <div>
        <input
          placeholder="Campaign Name"
          value={editing ? editing.name : newCampaign.name}
          onChange={e =>
            editing
              ? setEditing({ ...editing, name: e.target.value })
              : setNewCampaign({ ...newCampaign, name: e.target.value })
          }
        />
        <input
          placeholder="Client"
          value={editing ? editing.client : newCampaign.client}
          onChange={e =>
            editing
              ? setEditing({ ...editing, client: e.target.value })
              : setNewCampaign({ ...newCampaign, client: e.target.value })
          }
        />
        <select
          value={editing ? editing.status : newCampaign.status}
          onChange={e =>
            editing
              ? setEditing({ ...editing, status: e.target.value })
              : setNewCampaign({ ...newCampaign, status: e.target.value })
          }
        >
          <option value="Planned">Planned</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
        {editing ? (
          <>
            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => setEditing(null)}>Cancel</button>
          </>
        ) : (
          <button onClick={handleAdd}>Add Campaign</button>
        )}
      </div>
      <ul>
        {campaigns.map(c => (
          <li key={c.id}>
            <b>{c.name}</b> (Client: {c.client}) - Status: {c.status || "Planned"}
            <button onClick={() => startEdit(c)}>Edit</button>
            <button onClick={() => handleDelete(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Campaigns;
