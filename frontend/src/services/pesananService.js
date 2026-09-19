import { apiFetch } from "./apiClient";

export const getPesanan = () => apiFetch("/pesanan");

export const getPesananById = (id) => apiFetch(`/pesanan/${id}`);

export const createPesanan = (data) =>
    apiFetch("/pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

export const updateStatusPesanan = (id, status) =>
    apiFetch(`/pesanan/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });