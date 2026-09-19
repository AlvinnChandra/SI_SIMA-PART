import { apiFetch } from "./apiClient";

export const login = (username, password) =>
  apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

export const createAdmin = (namaLengkap, username, email, password) =>
  apiFetch("/auth/create-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ namaLengkap, username, email, password }),
  });