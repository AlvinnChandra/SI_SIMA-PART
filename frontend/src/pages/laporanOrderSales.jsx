import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import DateRangeFilter from "../components/dateRangeFilter";
import "../css/global.css";

function LaporanOrder() {
    const [keyword, setKeyword] = useState("");

    const handleExportPdf = () => {
        // logic buat generate/export PDF laporan order per sales
        console.log("Export PDF diklik");
    };

    const handleExportExcel = () => {
        // logic buat generate/export Excel laporan order per sales
        console.log("Export Excel diklik");
    };

    const handleDateFilter = ({ startDate, endDate }) => {
        console.log("Filter tanggal:", startDate, "-", endDate);
        // nanti dipakai buat filter data laporan / query ke API
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">

                <div className="page-header-row">
                    <h1>Laporan Order Per Sales</h1>
                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton onClick={handleExportPdf} />
                    </div>
                </div>

                <SearchBar
                    placeholder="Cari nama sales..."
                    onSearch={setKeyword}
                />

                <DateRangeFilter onFilter={handleDateFilter} />

            </main>
            <Footer />
        </div>
    );
}

export default LaporanOrder;