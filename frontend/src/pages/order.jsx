import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import DateRangeFilter from "../components/dateRangeFilter";
import "../css/global.css";

function Order() {
    const [keyword, setKeyword] = useState("");

    const handleExportPdf = () => {
        // logic buat generate/export PDF orderan
        console.log("Export PDF diklik");
    };

    const handleExportExcel = () => {
        // logic buat generate/export Excel orderan
        console.log("Export Excel diklik");
    };

    const handleDateFilter = ({ startDate, endDate }) => {
        console.log("Filter tanggal:", startDate, "-", endDate);
        // nanti dipakai buat filter data order / query ke API
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">

                <div className="page-header-row">
                    <h1>Orderan Masuk</h1>
                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton onClick={handleExportPdf} />
                    </div>
                </div>

                <SearchBar
                    placeholder="Cari nomor pesanan atau nama toko..."
                    onSearch={setKeyword}
                />

                <DateRangeFilter onFilter={handleDateFilter} />

            </main>
            <Footer />
        </div>
    );
}

export default Order;