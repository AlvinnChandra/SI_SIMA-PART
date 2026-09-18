// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

// Bungkus route yang butuh login + role tertentu.
// Contoh pemakaian:
//   <Route
//     path="/order"
//     element={
//       <ProtectedRoute allowedRoles={["admin"]}>
//         <Order />
//       </ProtectedRoute>
//     }
//   />
//
// - Belum login / token expired -> lempar ke halaman login ("/")
// - Sudah login tapi role tidak sesuai -> lempar ke halaman awal
//   role tersebut (admin -> "/katalog", sales -> "/katalogSales")
function ProtectedRoute({ allowedRoles, children }) {
    const role = getUserRole();

    // Belum login sama sekali (tidak ada token / token invalid/expired)
    if (!role) {
        return <Navigate to="/" replace />;
    }

    // Sudah login, tapi role-nya tidak diizinkan akses halaman ini
    if (!allowedRoles.includes(role)) {
        const fallbackPath = role === "admin" ? "/katalog" : "/katalogSales";
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
}

export default ProtectedRoute;