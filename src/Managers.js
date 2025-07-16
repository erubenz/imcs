// src/Managers.js
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

export default function Managers() {
  const [managers, setManagers] = useState([]);
  const [newManager, setNewManager] = useState({ name: "", lastName: "" });
  const [editingId, setEditingId] = useState(null);
  const [editManager, setEditManager] = useState({ name: "", lastName: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "managers"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setManagers(list);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newManager.name || !newManager.lastName) {
      alert("Please enter both name and last name.");
      return;
    }

    try {
      await addDoc(collection(db, "managers"), {
        name: newManager.name.trim(),
        lastName: newManager.lastName.trim(),
      });
      setNewManager({ name: "", lastName: "" });
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this manager?")) {
      await deleteDoc(doc(db, "managers", id));
    }
  };

  const handleEdit = async (id) => {
    if (!editManager.name || !editManager.lastName) {
      alert("Please enter valid name and last name.");
      return;
    }
    await updateDoc(doc(db, "managers", id), {
      name: editManager.name.trim(),
      lastName: editManager.lastName.trim(),
    });
    setEditingId(null);
    setEditManager({ name: "", lastName: "" });
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h2>Managers</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
        <input
          placeholder="Name"
          value={newManager.name}
          onChange={(e) =>
            setNewManager({ ...newManager, name: e.target.value })
          }
        />
        <input
          placeholder="Last Name"
          value={newManager.lastName}
          onChange={(e) =>
            setNewManager({ ...newManager, lastName: e.target.value })
          }
        />
        <button type="submit">Add Manager</button>
      </form>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {managers.map((m) => (
            <tr key={m.id}>
              <td>
                {editingId === m.id ? (
                  <input
                    value={editManager.name}
                    onChange={(e) =>
                      setEditManager((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                ) : (
                  m.name
                )}
              </td>
              <td>
                {editingId === m.id ? (
                  <input
                    value={editManager.lastName}
                    onChange={(e) =>
                      setEditManager((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                  />
                ) : (
                  m.lastName
                )}
              </td>
              <td>
                {editingId === m.id ? (
                  <>
                    <button onClick={() => handleEdit(m.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(m.id);
                        setEditManager({
                          name: m.name,
                          lastName: m.lastName
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(m.id)}>Delete</button>
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
