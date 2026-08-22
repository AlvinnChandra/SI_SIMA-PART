import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import AddButton from "../components/AddButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import simaWatermark from "../assets/sima.png";
import "../css/global.css";

function Katalog() {
    const [keyword, setKeyword] = useState("");

    const handleAddProduk = () => {
        // logic buat buka modal/pindah halaman tambah produk
        console.log("Tambah produk diklik");
    };

    const handleExportPdf = () => {
        // logic buat generate/export PDF katalog
        console.log("Export PDF diklik");
    };

    const handleExportExcel = () => {
        // logic buat generate/export Excel katalog
        console.log("Export Excel diklik");
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">

                <div className="page-header-row">
                    <h1>Katalog</h1>
                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton onClick={handleExportPdf} />
                        <AddButton label="Tambah Produk" onClick={handleAddProduk} />
                    </div>
                </div>

                <SearchBar
                    placeholder="Cari nama produk atau kode barang..."
                    onSearch={setKeyword}
                />

                <div
                    style={{
                        flex: 1,
                        minHeight: "420px",
                        backgroundImage: `url(${simaWatermark})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "420px",
                        opacity: 0.35,
                    }}
                />

            </main>
            <Footer />
        </div>
    );
}

export default Katalog;