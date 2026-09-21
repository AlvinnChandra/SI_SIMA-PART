import Header from "../components/header";
import Footer from "../components/footer";
import KatalogContent from "./katalogContent";
import "../css/global.css";

// Halaman katalog tinggal membungkus badan katalog dengan Header & Footer.
// Dari 1481 baris jadi belasan baris. Seluruh logikanya pindah ke
// KatalogContent + hooks, jadi halaman ini dan dashboard memakai kode yang sama.
export default function Katalog() {
    return (
        <div className="dashboard-layout">
            <Header />
            <KatalogContent />
            <Footer />
        </div>
    );
}