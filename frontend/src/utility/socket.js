// src/socket.js
import { io } from "socket.io-client";

// connect once — backend URL
export const socket = io("http://localhost:5000", {
  autoConnect: false, // manual connect when user logs in
});