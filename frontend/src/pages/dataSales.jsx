import { useState, useEffect, useMemo } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import SalesTable from "../fitur/salesTable";
import { exportListExcel } from "../utils/excelExport"; // sesuaikan path sesuai lokasi file exceljs kamu
import "../css/global.css";

const API_BASE_URL = "http://localhost:7001/api";

// Mapping status verifikasi backend -> label yang ditampilkan di laporan
function statusToLabel(status) {
    if (status === "active") return "Berhasil Verifikasi";
    if (status === "rejected") return "Tidak Berhasil Verifikasi";
    return "Menunggu Verifikasi";
}

function getAuthToken() {
    return (
        localStorage.getItem("simaToken") ||
        sessionStorage.getItem("simaToken")
    );
}

function DataSales() {
    const [keyword, setKeyword] = useState("");
    const [salesData, setSalesData] = useState([]);
    const [loadingSales, setLoadingSales] = useState(true);

    // Ambil data sales sekali di awal, dipakai bareng
    // oleh SalesTable (lewat prop keyword) dan ExportPdfButton
    useEffect(() => {
        const loadSales = async () => {
            setLoadingSales(true);
            try {
                const token = getAuthToken();
                const res = await fetch(`${API_BASE_URL}/users/sales`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.message || "Gagal mengambil data sales.");
                }

                const users = Array.isArray(data)
                    ? data
                    : Array.isArray(data.users)
                        ? data.users
                        : [];

                setSalesData(users);
            } catch (err) {
                console.error(err.message || "Gagal mengambil data sales.");
                setSalesData([]);
            } finally {
                setLoadingSales(false);
            }
        };

        loadSales();
    }, []);

    // Filter sesuai keyword pencarian, dipakai buat PDF & Excel
    // supaya hasil export sesuai hasil pencarian juga
    const filteredSales = useMemo(() => {
        const k = keyword.trim().toLowerCase();
        if (!k) return salesData;
        return salesData.filter((u) =>
            String(u.namaLengkap || "").toLowerCase().includes(k)
        );
    }, [salesData, keyword]);

    const handleExportExcel = () => {
        exportListExcel({
            title: "Data Sales",
            fileName: "data-sales.xlsx",
            data: filteredSales,
            fields: [
                { key: "namaLengkap", label: "Nama Sales" },
                { key: "nik", label: "NIK" },
                { key: "noTelepon", label: "No Telepon" },
                { key: "alamat", label: "Alamat" },
            ],
        });
    };

    return (
        <div className="dashboard-layout">
            <Header />

            <main className="dashboard-content">

                <div className="page-header-row">
                    <h1>Data Sales</h1>

                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton
                            title="Data Sales"
                            fileName="data-sales.pdf"
                            data={filteredSales}
                            fields={[
                                { key: "namaLengkap", label: "Nama Sales" },
                                { key: "nik", label: "NIK" },
                                { key: "noTelepon", label: "No Telepon" },
                                { key: "alamat", label: "Alamat" },
                            ]}
                        />
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