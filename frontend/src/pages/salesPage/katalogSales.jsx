import { useNavigate } from "react-router-dom";
import HeaderSales from "../../components/headerSales";
import KatalogContent from "../katalogContent";
import "../../css/global.css";

export default function KatalogSales() {
    const navigate = useNavigate();

    const handleAddToOrder = (product) => {
        navigate("/pesananSales", { state: { pendingBarang: product } });
    };

    return (
        <div className="dashboard-layout">
            <HeaderSales />
            <KatalogContent onAddToOrder={handleAddToOrder} canManageDiskon />
        </div>
    );
}