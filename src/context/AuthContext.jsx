import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, ensureUserDoc } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, loading, error] = useAuthState(auth);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let unsub;
    if (user) {
      const ref = doc(db, "users", user.uid);
      unsub = onSnapshot(ref, (snap) => setRole(snap.data()?.role || null));
    } else {
      setRole(null);
    }
    return () => unsub && unsub();
  }, [user]);

  const login = async (email, password) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(userCred.user);
    return userCred.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
