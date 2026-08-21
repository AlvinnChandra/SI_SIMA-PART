import Header from "../components/header";
import Footer from "../components/footer";
import "../css/global.css";

function dataSales() {
    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">
                <h1>Data Sales</h1>
            </main>
            <Footer />
        </div>
    );
}

export default dataSales;