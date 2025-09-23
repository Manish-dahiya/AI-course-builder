// ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../src/contexts/UserContextProvider";
import { useAuth0 } from "@auth0/auth0-react";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useContext(UserContext);
  const { isAuthenticated, isLoading } = useAuth0();

  // While Auth0 is checking the user, you can show a loader
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated and no currentUser, redirect to login
  if (!isAuthenticated && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Else render the protected content
  return children;
}