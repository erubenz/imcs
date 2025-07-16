// src/App.js
import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import Campaigns from "./Campaigns"; // Make sure you have this file/component

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(true);
  const [registerMode, setRegisterMode] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setEmail("");
      setPass("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      setEmail("");
      setPass("");
      setRegisterMode(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>IMCS Campaign Manager</h2>
      {!user ? (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: 8, width: "100%" }}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            style={{ marginBottom: 8, width: "100%" }}
          /><br />
          {registerMode ? (
            <>
              <button onClick={handleRegister} style={{ marginRight: 8 }}>
                Register
              </button>
              <button onClick={() => setRegisterMode(false)}>
                Back to Login
              </button>
            </>
          ) : (
            <>
              <button onClick={handleLogin} style={{ marginRight: 8 }}>
                Login
              </button>
              <button onClick={() => setRegisterMode(true)}>
                Register
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 16 }}>
            Welcome, {user.email}{" "}
            <button onClick={handleLogout}>Logout</button>
          </div>
          <Campaigns user={user} />
        </div>
      )}
    </div>
  );
}

export default App;
