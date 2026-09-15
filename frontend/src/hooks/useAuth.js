function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function useAuth() {
  const token = localStorage.getItem("simaToken") || sessionStorage.getItem("simaToken");
  const decoded = token ? decodeToken(token) : null;
  return { token, role: decoded?.role, isAdmin: decoded?.role === "admin" };
}