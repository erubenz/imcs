// src/Login.js
import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ensureUserDoc } from "./firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(userCred.user); // ✅ ensure user doc in Firestore
    navigate("/");
  } catch (err) {
    setError("Login failed. Please check your credentials.");
  }
};

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>
          Login
        </button>
      </form>
    </div>
  );
}
