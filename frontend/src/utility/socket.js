// src/socket.js
import { io } from "socket.io-client";
import { API_BASE_URL } from "./helper";

// connect once — backend URL
export const socket = io(`${API_BASE_URL}`, {
  autoConnect: false, // manual connect when user logs in
});