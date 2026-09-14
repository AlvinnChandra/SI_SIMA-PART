import { apiFetch } from "./apiClient";

export const getToko = () => apiFetch("/toko");

export const createToko = (data) =>
    apiFetch("/toko", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

export const updateToko = (id, data) =>
    apiFetch(`/toko/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

export const deleteToko = (id) => apiFetch(`/toko/${id}`, { method: "DELETE" });