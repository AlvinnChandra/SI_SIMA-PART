import { useState, useEffect, useMemo } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import AddButton from "../components/AddButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import AddTokoModal from "../fitur/addTokoModal";
import TokoTable from "../fitur/tokoTable";
import "../css/global.css";

const API_BASE_URL = "http://localhost:3000/api";

function getAuthToken() {
    return (
        localStorage.getItem("simaToken") || sessionStorage.getItem("simaToken")
    );
}

async function apiFetch(path, options = {}) {
    const token = getAuthToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan.");
    }

    return data;
}

// Ubah 1 dokumen toko dari backend jadi bentuk yang dipakai tabel ini
function mapTokoFromBackend(toko) {
    return {
        id: toko._id,
        namaToko: toko.namaToko,
        alamat: toko.alamat,
        noTelepon: toko.noTelepon,
        inputBy: toko.inputBy,
        role: toko.role, // "admin" | "sales", dipakai buat styling badge
    };
}

function DataToko() {
    const [keyword, setKeyword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tokoData, setTokoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // ---------- AMBIL DATA TOKO DARI BACKEND ----------
    const loadToko = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const data = await apiFetch("/toko");
            setTokoData(data.map(mapTokoFromBackend));
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadToko();
    }, []);

    const filteredToko = useMemo(() => {
        const k = keyword.trim().toLowerCase();
        if (!k) return tokoData;
        return tokoData.filter(
            (toko) =>
                toko.namaToko.toLowerCase().includes(k) ||
                toko.alamat.toLowerCase().includes(k) ||
                toko.noTelepon.toLowerCase().includes(k)
        );
    }, [tokoData, keyword]);

    const handleAddToko = () => {
        setIsModalOpen(true);
    };

    // ---------- SIMPAN TOKO BARU KE BACKEND ----------
    const handleSaveToko = async (data) => {
        try {
            const result = await apiFetch("/toko", {
                method: "POST",
                body: JSON.stringify({
                    namaToko: data.namaToko,
                    alamat: data.alamat,
                    noTelepon: data.noTelepon,
                }),
            });

            setTokoData((prev) => [mapTokoFromBackend(result.toko), ...prev]);
            setIsModalOpen(false);
        } catch (err) {
            alert(err.message);
        }
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

                {loading ? (
                    <p className="sima-table__empty">Memuat data toko...</p>
                ) : errorMsg ? (
                    <p className="sima-table__empty">Gagal memuat data: {errorMsg}</p>
                ) : (
                    <TokoTable data={filteredToko} setData={setTokoData} />
                )}

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