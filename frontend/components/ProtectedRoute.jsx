// ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../src/contexts/UserContextProvider";
import { useAuth0 } from "@auth0/auth0-react";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useContext(UserContext);
  const { isAuthenticated, isLoading } = useAuth0();

  // While Auth0 is checking the user, show a loader
  if (isLoading) {
    return <LoadingScreen/>;
  }

  // Check for guest user in localStorage
  const guestUser = localStorage.getItem("guestUser");

  // If no Auth0 user, no currentUser, and no guestUser, redirect
  if (!isAuthenticated && !currentUser && !guestUser) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the protected content
  return children;
}
