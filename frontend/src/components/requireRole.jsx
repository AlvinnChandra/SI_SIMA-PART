import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RequireRole({ role, children }) {
    const { role: userRole, token } = useAuth(); 
    if (!token) return <Navigate to="/" replace />;
    if (userRole !== role) {
        return <Navigate to={userRole === "admin" ? "/katalog" : "/katalogSales"} replace />;
    }    
    return children;
}
    