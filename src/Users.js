// src/Users.js
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

const ROLES = ["Admin", "Manager", "Account Manager", "Sales Manager", "Viewer"];

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update role.");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h2>Users & Roles</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border="1" width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role || "Viewer"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
