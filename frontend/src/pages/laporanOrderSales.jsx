import Header from "../components/header";
import Footer from "../components/footer";
import "../css/global.css";

function laporanOrder() {
    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">
                <h1>Laporan Order Per Sales</h1>
            </main>
            <Footer />
        </div>
    );
}

export default laporanOrder;