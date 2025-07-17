import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireRole({ role, children }) {
  const { user, loading, role: userRole } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (userRole !== role) return <Navigate to="/" replace />;

  return children;
}
