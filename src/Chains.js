// src/Chains.js
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

export default function Chains() {
  const [chains, setChains] = useState([]);
  const [newChain, setNewChain] = useState({ chainName: "", sharePercent: "" });
  const [editingId, setEditingId] = useState(null);
  const [editChain, setEditChain] = useState({ chainName: "", sharePercent: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chains"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChains(list);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e) => {
  e.preventDefault();

  const { chainName, sharePercent } = newChain;
  const share = parseFloat(sharePercent);

  if (!chainName || isNaN(share)) {
    alert("Please enter valid chain name and share percent.");
    return;
  }

  if (chains.some(c => c.chainName.toLowerCase() === chainName.toLowerCase())) {
    alert("This chain already exists.");
    return;
  }

  try {
    await addDoc(collection(db, "chains"), {
      chainName,
      sharePercent: share
    });
    setNewChain({ chainName: "", sharePercent: "" });
  } catch (err) {
    console.error("Add failed", err);
  }
};


  const handleDelete = async (id) => {
    if (window.confirm("Delete this chain?")) {
      await deleteDoc(doc(db, "chains", id));
    }
  };

  const handleEdit = async (id) => {
    const share = parseFloat(editChain.sharePercent);
    if (!editChain.chainName || isNaN(share)) {
      alert("Please enter valid name and percent.");
      return;
    }
    await updateDoc(doc(db, "chains", id), {
      chainName: editChain.chainName,
      sharePercent: share
    });
    setEditingId(null);
    setEditChain({ chainName: "", sharePercent: "" });
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h2>Chains</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
        <input
          placeholder="Chain Name"
          value={newChain.chainName}
          onChange={(e) =>
            setNewChain({ ...newChain, chainName: e.target.value })
          }
        />
        <input
          placeholder="Share % (e.g. 0.35)"
          value={newChain.sharePercent}
          onChange={(e) =>
            setNewChain({ ...newChain, sharePercent: e.target.value })
          }
          type="number"
          step="0.01"
          min="0"
          max="1"
        />
        <button type="submit">Add Chain</button>
      </form>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Chain Name</th>
            <th>Share %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {chains.map((c) => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <input
                    value={editChain.chainName}
                    onChange={(e) =>
                      setEditChain((prev) => ({ ...prev, chainName: e.target.value }))
                    }
                  />
                ) : (
                  c.chainName
                )}
              </td>
              <td>
                {editingId === c.id ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editChain.sharePercent}
                    onChange={(e) =>
                      setEditChain((prev) => ({ ...prev, sharePercent: e.target.value }))
                    }
                  />
                ) : (
                  `${(c.sharePercent * 100).toFixed(1)}%`
                )}
              </td>
              <td>
                {editingId === c.id ? (
                  <>
                    <button onClick={() => handleEdit(c.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(c.id);
                        setEditChain({
                          chainName: c.chainName,
                          sharePercent: c.sharePercent
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
