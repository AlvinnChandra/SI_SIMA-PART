// utils/auth.js

// Ambil token mentah dari localStorage/sessionStorage.
// Dipakai bareng dengan cara apiClient.js mengambil token,
// supaya konsisten (key "simaToken").
export function getToken() {
    return (
        localStorage.getItem("simaToken") ||
        sessionStorage.getItem("simaToken") ||
        null
    );
}

// Decode payload JWT tanpa perlu library tambahan.
// JWT formatnya: header.payload.signature (base64url per bagian).
// Kita cuma butuh baca payload-nya (berisi { id, role, iat, exp }),
// TIDAK perlu verifikasi signature di frontend (itu tugas backend).
function decodeJwtPayload(token) {
    try {
        const payloadBase64 = token.split(".")[1];
        // base64url -> base64 biasa
        const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = atob(normalized);
        return JSON.parse(decoded);
    } catch (err) {
        return null;
    }
}

// Ambil role user yang sedang login ("admin" / "sales"), atau null kalau
// tidak ada token / token tidak valid / sudah kedaluwarsa.
export function getUserRole() {
    const token = getToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload || !payload.role) return null;

    // Cek token sudah expired atau belum (exp dalam detik, Date.now() dalam ms)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null;
    }

    return payload.role;
}

// Cek apakah ada token yang masih valid (belum expired)
export function isLoggedIn() {
    return getUserRole() !== null;
}