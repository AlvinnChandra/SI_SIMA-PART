import { useState, useEffect, useMemo } from "react";
import Header from "../components/headerSales";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import AddButton from "../components/AddButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import AddTokoModal from "../fitur/addTokoModal";
import TokoTable from "../fitur/tokoTable2";
import "../css/dataToko2.css";
import "../css/global.css";

const API_BASE_URL = "http://localhost:3000/api";

// ======================================================
// KONFIGURASI PASSWORD
// ======================================================
// [PENTING] Ini HANYA proteksi ringan di sisi frontend.
// Password ini tetap terlihat oleh siapa pun yang membuka
// source code / DevTools browser. Untuk data yang benar-benar
// sensitif, validasi HARUS dilakukan di backend (misal cek
// token/login sebelum data toko di-fetch dari API).
const PASSWORD_DATATOKO = "SIMAPART";

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


// ======================================================
// COMPONENT: GATE PASSWORD
// ======================================================
// [DIUBAH] Sekarang gate ini hanya mengisi AREA KONTEN
// (di bawah Header), bukan overlay full-screen yang
// menutupi seluruh halaman termasuk Header.
// ======================================================

function PasswordGate({ onUnlock }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        if (password === PASSWORD_DATATOKO) {
            setError("");
            onUnlock();
        } else {
            setError("Password salah. Coba lagi.");
            setPassword("");
        }
    }

    return (
        <div className="password-gate-area">
            <form className="password-gate-box" onSubmit={handleSubmit}>
                <div className="password-gate-icon">🔒</div>

                <h2 className="password-gate-title">
                    Halaman Terkunci
                </h2>

                <p className="password-gate-text">
                    Masukkan password untuk membuka halaman Data Toko.
                </p>

                <input
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                    }}
                    placeholder="Password"
                    className="password-gate-input"
                />

                {error && (
                    <div className="password-gate-error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="password-gate-button"
                >
                    Buka Halaman
                </button>
            </form>
        </div>
    );
}


// ======================================================
// COMPONENT: DATA TOKO
// ======================================================

function DataToko() {
    // Selalu mulai dari "terkunci" setiap kali komponen ini
    // dimuat/dibuka (misal buka tab baru, refresh, atau navigasi
    // balik ke halaman ini). Tidak disimpan di sessionStorage,
    // jadi password akan selalu diminta ulang setiap kali.
    const [isUnlocked, setIsUnlocked] = useState(false);

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

    // Baru fetch data setelah password terbuka, biar tidak
    // ambil data ke backend sia-sia sebelum halaman di-unlock
    useEffect(() => {
        if (isUnlocked) {
            loadToko();
        }
    }, [isUnlocked]);

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

            {!isUnlocked ? (

                // [DIUBAH] Header tetap tampil di atas, hanya
                // area konten di bawahnya yang diganti dengan
                // form password.
                <PasswordGate onUnlock={() => setIsUnlocked(true)} />

            ) : (

                <>
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

                    <AddTokoModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveToko}
                    />
                </>

            )}

            <Footer />

        </div>
    );
}

export default DataToko;