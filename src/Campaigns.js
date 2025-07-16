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
  const [newCampaign, setNewCampaign] = useState({ name: "", client: "" });
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
    await addDoc(collection(db, "campaigns"), {
      ...newCampaign,
      createdBy: user.email,
      createdAt: new Date(),
    });
    setNewCampaign({ name: "", client: "" });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "campaigns", id));
  };

  const startEdit = (campaign) => setEditing(campaign);

  const handleUpdate = async () => {
    if (!editing) return;
    await updateDoc(doc(db, "campaigns", editing.id), {
      name: editing.name,
      client: editing.client,
      updatedAt: new Date(),
    });
    setEditing(null);
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
            <b>{c.name}</b> (Client: {c.client})
            <button onClick={() => startEdit(c)}>Edit</button>
            <button onClick={() => handleDelete(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Campaigns;
