import React, { createContext, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, ensureUserDoc } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, loading, error] = useAuthState(auth);

  const login = async (email, password) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(userCred.user);
    return userCred.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
