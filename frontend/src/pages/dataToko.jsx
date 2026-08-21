import Header from "../components/header";
import Footer from "../components/footer";
import "../css/global.css";

function dataToko() {
    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">
                <h1>Data Toko</h1>
            </main>
            <Footer />
        </div>
    );
}

export default dataToko;