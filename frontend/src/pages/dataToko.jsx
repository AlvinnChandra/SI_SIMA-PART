import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import AddButton from "../components/AddButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import AddTokoModal from "../fitur/addTokoModal";
import TokoTable from "../fitur/tokoTable";
import "../css/global.css";

function DataToko() {
    const [keyword, setKeyword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddToko = () => {
        setIsModalOpen(true);
    };

    const handleSaveToko = (data) => {
        console.log("Data toko baru:", data);
        // nanti di sini logic buat kirim data ke backend / update state list toko
    };

    const handleExportPdf = () => {
        console.log("Export PDF diklik");
    };

    const handleExportExcel = () => {
        console.log("Export Excel diklik");
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">

                <div className="page-header-row">
                    <h1>Data Toko</h1>
                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton onClick={handleExportPdf} />
                        <AddButton label="Tambah Toko" onClick={handleAddToko} />
                    </div>
                </div>

                <SearchBar
                    placeholder="Cari nama toko..."
                    onSearch={setKeyword}
                />

                <TokoTable />

            </main>
            <Footer />

            <AddTokoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveToko}
            />
        </div>
    );
}

export default DataToko;