import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import SalesTable from "../fitur/salesTable";
import "../css/global.css";

function DataSales() {
    const [keyword, setKeyword] = useState("");

    const handleExportPdf = () => {
        // logic buat generate/export PDF data sales
        console.log("Export PDF diklik");
    };

    const handleExportExcel = () => {
        // logic buat generate/export Excel data sales
        console.log("Export Excel diklik");
    };

    return (
        <div className="dashboard-layout">
            <Header />

            <main className="dashboard-content">

                <div className="page-header-row">
                    <h1>Data Sales</h1>

                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton onClick={handleExportPdf} />
                    </div>
                </div>

                <SearchBar
                    placeholder="Cari nama sales..."
                    onSearch={setKeyword}
                />

                <SalesTable keyword={keyword} />

            </main>

            <Footer />
        </div>
    );
}

export default DataSales;