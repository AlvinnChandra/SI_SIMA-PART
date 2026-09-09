import { useState, useMemo } from "react";
import Header from "../components/headerSales";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import AddButton from "../components/AddButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import AddTokoModal from "../fitur/addTokoModal";
import TokoTable, { dummyToko } from "../fitur/tokoTable";
import "../css/dataToko2.css";
import "../css/global.css";

// ======================================================
// KONFIGURASI PASSWORD
// ======================================================
// [PENTING] Ini HANYA proteksi ringan di sisi frontend.
// Password ini tetap terlihat oleh siapa pun yang membuka
// source code / DevTools browser. Untuk data yang benar-benar
// sensitif, validasi HARUS dilakukan di backend (misal cek
// token/login sebelum data toko di-fetch dari API).
const PASSWORD_DATATOKO = "SIMAPART";


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
    const [tokoData, setTokoData] = useState(dummyToko);

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

    const handleSaveToko = (data) => {
        setTokoData((prev) => [
            ...prev,
            { ...data, id: Date.now(), inputBy: "Admin" },
        ]);
        setIsModalOpen(false);

        // nanti di sini logic buat kirim data ke backend
        console.log("Data toko baru:", data);
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

                        <TokoTable data={filteredToko} setData={setTokoData} />

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