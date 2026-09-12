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
// Password TIDAK lagi disimpan/dibandingkan di frontend.
// Yang diminta di sini adalah password akun SIMA milik user
// yang sedang login, dan itu diverifikasi langsung ke backend
// (endpoint POST /api/auth/verify-password) memakai bcrypt.compare
// terhadap password ter-hash di database. Jadi tidak ada password
// apa pun yang tertulis di source code.
// ======================================================

function PasswordGate({ onUnlock }) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!password) {
            setError("Password wajib diisi.");
            return;
        }

        setChecking(true);
        setError("");

        try {
            await apiFetch("/auth/verify-password", {
                method: "POST",
                body: JSON.stringify({ password }),
            });

            onUnlock();
        } catch (err) {
            setError(err.message || "Password salah. Coba lagi.");
            setPassword("");
        } finally {
            setChecking(false);
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
                    Masukkan password akun kamu untuk membuka halaman Data Toko.
                </p>

                <div
                    className="password-gate-input-wrap"
                    style={{ position: "relative", width: "100%" }}
                >
                    <input
                        type={showPassword ? "text" : "password"}
                        autoFocus
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="Password akun"
                        className="password-gate-input"
                        style={{ paddingRight: "40px", width: "100%" }}
                        disabled={checking}
                    />
                    <button
                        type="button"
                        className="password-gate-icon-btn"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                            showPassword ? "Sembunyikan password" : "Tampilkan password"
                        }
                        tabIndex={-1}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <EyeIcon open={showPassword} />
                    </button>
                </div>

                {error && (
                    <div className="password-gate-error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="password-gate-button"
                    disabled={checking}
                >
                    {checking ? "Memeriksa..." : "Buka Halaman"}
                </button>
            </form>
        </div>
    );
}

function EyeIcon({ open }) {
    if (open) {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
        );
    }

    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
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

                // Header tetap tampil di atas, hanya area konten
                // di bawahnya yang diganti dengan form password.
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