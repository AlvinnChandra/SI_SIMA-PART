import { apiFetch } from "./apiClient";

export const getItems = () => apiFetch("/items");
export const createItem = (formData) => apiFetch("/items", { method: "POST", body: formData });
export const updateItem = (id, formData) => apiFetch(`/items/${id}`, { method: "PUT", body: formData });
export const deleteItem = (id) => apiFetch(`/items/${id}`, { method: "DELETE" });