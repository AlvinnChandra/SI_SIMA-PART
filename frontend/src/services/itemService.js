import { apiFetch } from "./apiClient";

export const getItems = () => apiFetch("/items");

export const createItem = (formData) =>
    apiFetch("/items", { method: "POST", body: formData });

export const updateItem = (id, formData) =>
    apiFetch(`/items/${id}`, { method: "PUT", body: formData });

export const deleteItem = (id) =>
    apiFetch(`/items/${id}`, { method: "DELETE" });

// ---------------- DISKON ----------------

// Terapkan satu nilai diskon (persen) ke banyak barang sekaligus.
// ids: array of _id, persen: 1 - 100
export const applyDiskonItems = (ids, persen) =>
    apiFetch("/items/diskon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, diskon: Number(persen) }),
    });

// Hapus diskon satu barang (set kembali ke 0)
export const removeDiskonItem = (id) =>
    apiFetch(`/items/${id}/diskon`, { method: "DELETE" });