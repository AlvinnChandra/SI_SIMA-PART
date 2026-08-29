import { useEffect, useState } from "react";
import "../css/salesTable.css";

// Status verifikasi yang tersedia
const VERIFIKASI_STATUS = {
    MENUNGGU: "Menunggu",
    BERHASIL: "Berhasil",
    TIDAK_BERHASIL: "TidakBerhasil",
};

const dummySales = [
    {
        id: 1, namaSales: "Budi Santoso", nik: "3273010101900001", noTelepon: "0812-1111-2222", alamat: "Jl. Melati No. 5, Jakarta Selatan",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        cv: "https://placehold.co/pdf/cv-budi-santoso.pdf",
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 2, namaSales: "Siti Rahayu", nik: "3204020202920002", noTelepon: "0813-2222-3333", alamat: "Jl. Kenanga No. 10, Bandung",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: null, fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        cv: null,
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 3, namaSales: "Ahmad Fauzi", nik: "3578030303950003", noTelepon: "0857-3333-4444", alamat: "Jl. Anggrek No. 7, Surabaya",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: null,
        cv: "https://placehold.co/pdf/cv-ahmad-fauzi.pdf",
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 4, namaSales: "Dewi Lestari", nik: "3374040404880004", noTelepon: "0821-4444-5555", alamat: "Jl. Mawar No. 21, Semarang",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: null, fotoSimC: null,
        cv: null,
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 5, namaSales: "Rizky Pratama", nik: "3471050505930005", noTelepon: "0878-5555-6666", alamat: "Jl. Cempaka No. 3, Yogyakarta",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        cv: "https://placehold.co/pdf/cv-rizky-pratama.pdf",
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 6, namaSales: "Nur Aini", nik: "3573060606910006", noTelepon: "0812-6666-7777", alamat: "Jl. Flamboyan No. 17, Malang",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: null,
        cv: null,
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 7, namaSales: "Hendra Wijaya", nik: "1271070707890007", noTelepon: "0813-7777-8888", alamat: "Jl. Mangga No. 55, Medan",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: null, fotoSimC: null,
        cv: null,
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 8, namaSales: "Putri Ayu", nik: "7371080808940008", noTelepon: "0857-8888-9999", alamat: "Jl. Jambu No. 9, Makassar",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: null, fotoSimC: null,
        cv: "https://placehold.co/pdf/cv-putri-ayu.pdf",
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 9, namaSales: "Fajar Nugroho", nik: "1671090909920009", noTelepon: "0821-9999-0000", alamat: "Jl. Rambutan No. 33, Palembang",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        cv: "https://placehold.co/pdf/cv-fajar-nugroho.pdf",
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
    {
        id: 10, namaSales: "Indah Permata", nik: "5171100000970010", noTelepon: "0878-0000-1111", alamat: "Jl. Duku No. 14, Denpasar",
        fotoProfil: "https://placehold.co/120x120?text=Foto",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: null, fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        cv: null,
        verifikasi: VERIFIKASI_STATUS.MENUNGGU
    },
];

const ITEMS_PER_PAGE = 5;

// Field foto/dokumen yang bisa diganti lewat form edit
const UPLOAD_FIELDS = [
    { key: "fotoProfil", label: "Foto Profil", accept: "image/*", type: "image" },
    { key: "fotoKtp", label: "Foto KTP", accept: "image/*", type: "image" },
    { key: "fotoSimA", label: "Foto SIM A", accept: "image/*", type: "image" },
    { key: "fotoSimC", label: "Foto SIM C", accept: "image/*", type: "image" },
    { key: "cv", label: "CV", accept: "application/pdf", type: "file" },
];

function toWaLink(noTelepon) {
    if (!noTelepon) return null;

    // Bersihkan karakter selain angka (hapus strip, spasi, dll)
    const digitsOnly = noTelepon.replace(/\D/g, "");

    // Ganti awalan 0 jadi 62
    const waNumber = digitsOnly.startsWith("0")
        ? "62" + digitsOnly.slice(1)
        : digitsOnly;

    return `https://wa.me/${waNumber}`;
}

// Kelas CSS untuk tiap status verifikasi
function getVerifikasiMeta(status) {
    switch (status) {
        case VERIFIKASI_STATUS.BERHASIL:
            return { className: "sima-sales-table__verif--berhasil" };
        case VERIFIKASI_STATUS.TIDAK_BERHASIL:
            return { className: "sima-sales-table__verif--tidak-berhasil" };
        case VERIFIKASI_STATUS.MENUNGGU:
        default:
            return { className: "sima-sales-table__verif--menunggu" };
    }
}

// Status sudah final (Berhasil / Tidak Berhasil) -> tidak boleh diubah lagi,
// termasuk tidak boleh balik lagi ke "Menunggu". Hanya status "Menunggu"
// yang masih boleh diedit.
function isVerifikasiLocked(status) {
    return status !== VERIFIKASI_STATUS.MENUNGGU;
}

// Bikin nama file yang rapi buat proses download,
// misalnya "Budi_Santoso_KTP.jpg"
function buildDownloadFileName(namaSales, label, src) {
    const cleanName = namaSales.trim().replace(/\s+/g, "_");
    const extMatch = src.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    const ext = extMatch ? extMatch[1] : "jpg";
    return `${cleanName}_${label}.${ext}`;
}

// Baca file yang dipilih user jadi data URL, biar bisa langsung dipreview
// tanpa perlu upload ke server dulu.
// nanti di sini logic buat upload file ini ke backend/storage, lalu
// field-nya diisi dengan URL hasil upload (bukan data URL lagi)
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function IconEye() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
        </svg>
    );
}

function IconDownload() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M4 19h16" />
        </svg>
    );
}

function IconFile() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6" />
        </svg>
    );
}

function IconUser() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
    );
}

function IconAlertTriangle() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}

function IconUpload() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21V9" />
            <path d="M7 14l5-5 5 5" />
            <path d="M4 21h16" />
        </svg>
    );
}

// Foto/dokumen (KTP, SIM A, SIM C) — bisa dilihat & didownload
function DocPhoto({ src, alt, label, namaSales, onPreview }) {
    if (!src) {
        return (
            <span className="sima-sales-table__doc-icon-btn sima-sales-table__doc-icon-btn--empty" title="Belum ada foto">
                <IconEye />
            </span>
        );
    }

    return (
        <div className="sima-sales-table__doc-actions">
            <button
                type="button"
                className="sima-sales-table__doc-icon-btn sima-sales-table__doc-icon-btn--filled"
                onClick={() => onPreview(src, alt, buildDownloadFileName(namaSales, label, src))}
                title={`Lihat ${alt}`}
            >
                <IconEye />
            </button>

            <a
                className="sima-sales-table__download-btn"
                href={src}
                download={buildDownloadFileName(namaSales, label, src)}
                target="_blank"
                rel="noopener noreferrer"
                title={`Download ${alt}`}
                onClick={(e) => e.stopPropagation()}
            >
                <IconDownload />
            </a>
        </div>
    );
}

// Foto profil sales — ditampilkan sebagai avatar bulat
function ProfilePhoto({ src, namaSales, onPreview }) {
    if (!src) {
        return (
            <span className="sima-sales-table__avatar sima-sales-table__avatar--empty" title="Belum ada foto profil">
                <IconUser />
            </span>
        );
    }

    return (
        <button
            type="button"
            className="sima-sales-table__avatar-btn"
            onClick={() => onPreview(src, `Foto Profil ${namaSales}`, buildDownloadFileName(namaSales, "FotoProfil", src))}
            title={`Lihat foto profil ${namaSales}`}
        >
            <img className="sima-sales-table__avatar" src={src} alt={`Foto profil ${namaSales}`} />
        </button>
    );
}

// CV — dokumen (biasanya PDF), langsung dibuka/didownload, tanpa lightbox
function CvFile({ src, namaSales }) {
    if (!src) {
        return (
            <span className="sima-sales-table__doc-icon-btn sima-sales-table__doc-icon-btn--empty" title="Belum ada CV">
                <IconFile />
            </span>
        );
    }

    return (
        <div className="sima-sales-table__doc-actions">
            <a
                className="sima-sales-table__doc-icon-btn sima-sales-table__doc-icon-btn--filled"
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                title={`Lihat CV ${namaSales}`}
            >
                <IconFile />
            </a>

            <a
                className="sima-sales-table__download-btn"
                href={src}
                download={buildDownloadFileName(namaSales, "CV", src)}
                target="_blank"
                rel="noopener noreferrer"
                title={`Download CV ${namaSales}`}
            >
                <IconDownload />
            </a>
        </div>
    );
}

// ---------- MODAL: KONFIRMASI HAPUS ----------
function DeleteConfirmModal({ sales, onCancel, onConfirm }) {
    return (
        <div className="sima-sales-modal-overlay" onClick={onCancel} role="button" tabIndex={-1}>
            <div
                className="sima-sales-confirm"
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="hapus-sales-title"
            >
                <span className="sima-sales-confirm__icon">
                    <IconAlertTriangle />
                </span>

                <h3 id="hapus-sales-title" className="sima-sales-confirm__title">
                    Hapus data sales?
                </h3>

                <p className="sima-sales-confirm__desc">
                    Data <strong>{sales.namaSales}</strong> beserta seluruh dokumen yang
                    terkait akan dihapus permanen dan tidak bisa dikembalikan.
                </p>

                <div className="sima-sales-confirm__actions">
                    <button
                        type="button"
                        className="sima-sales-modal__btn sima-sales-modal__btn--ghost"
                        onClick={onCancel}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        className="sima-sales-modal__btn sima-sales-modal__btn--danger"
                        onClick={onConfirm}
                    >
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------- MODAL: EDIT SALES (form sesuai field data) ----------
function EditSalesModal({ sales, onClose, onSave }) {
    const [form, setForm] = useState({ ...sales });
    const [uploading, setUploading] = useState(null); // key field yg lagi diproses

    const handleTextChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (field, file) => {
        if (!file) return;
        setUploading(field);
        try {
            const dataUrl = await readFileAsDataUrl(file);
            setForm((prev) => ({ ...prev, [field]: dataUrl }));
        } finally {
            setUploading(null);
        }
    };

    const handleRemoveFile = (field) => {
        setForm((prev) => ({ ...prev, [field]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="sima-sales-modal-overlay" onClick={onClose} role="button" tabIndex={-1}>
            <div
                className="sima-sales-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-sales-title"
            >
                <div className="sima-sales-modal__header">
                    <h3 id="edit-sales-title">Edit Data Sales</h3>
                    <button
                        type="button"
                        className="sima-sales-modal__close"
                        onClick={onClose}
                        aria-label="Tutup"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="sima-sales-modal__body">

                        {/* ---- FIELD TEKS ---- */}
                        <div className="sima-sales-modal__field">
                            <label htmlFor="namaSales">Nama Sales</label>
                            <input
                                id="namaSales"
                                type="text"
                                value={form.namaSales}
                                onChange={(e) => handleTextChange("namaSales", e.target.value)}
                                required
                            />
                        </div>

                        <div className="sima-sales-modal__field-row">
                            <div className="sima-sales-modal__field">
                                <label htmlFor="nik">NIK</label>
                                <input
                                    id="nik"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={16}
                                    value={form.nik}
                                    onChange={(e) => handleTextChange("nik", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="sima-sales-modal__field">
                                <label htmlFor="noTelepon">No Telepon</label>
                                <input
                                    id="noTelepon"
                                    type="text"
                                    value={form.noTelepon}
                                    onChange={(e) => handleTextChange("noTelepon", e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="sima-sales-modal__field">
                            <label htmlFor="alamat">Alamat</label>
                            <textarea
                                id="alamat"
                                rows={2}
                                value={form.alamat}
                                onChange={(e) => handleTextChange("alamat", e.target.value)}
                                required
                            />
                        </div>

                        {/* ---- FIELD DOKUMEN ---- */}
                        <div className="sima-sales-modal__uploads">
                            {UPLOAD_FIELDS.map(({ key, label, accept, type }) => (
                                <div className="sima-sales-modal__upload" key={key}>
                                    <span className="sima-sales-modal__upload-label">{label}</span>

                                    <div className="sima-sales-modal__upload-preview">
                                        {form[key] ? (
                                            type === "image" ? (
                                                <img src={form[key]} alt={label} />
                                            ) : (
                                                <span className="sima-sales-modal__upload-file">
                                                    <IconFile />
                                                    File tersimpan
                                                </span>
                                            )
                                        ) : (
                                            <span className="sima-sales-modal__upload-empty">
                                                Belum ada file
                                            </span>
                                        )}
                                    </div>

                                    <div className="sima-sales-modal__upload-actions">
                                        <label className="sima-sales-modal__upload-btn">
                                            <IconUpload />
                                            {uploading === key ? "Memproses..." : "Ganti File"}
                                            <input
                                                type="file"
                                                accept={accept}
                                                hidden
                                                onChange={(e) =>
                                                    handleFileChange(key, e.target.files?.[0])
                                                }
                                            />
                                        </label>

                                        {form[key] && (
                                            <button
                                                type="button"
                                                className="sima-sales-modal__upload-remove"
                                                onClick={() => handleRemoveFile(key)}
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sima-sales-modal__footer">
                        <button
                            type="button"
                            className="sima-sales-modal__btn sima-sales-modal__btn--ghost"
                            onClick={onClose}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="sima-sales-modal__btn sima-sales-modal__btn--primary"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SalesTable({ data = dummySales, keyword = "" }) {
    const [salesData, setSalesData] = useState(data);
    const [currentPage, setCurrentPage] = useState(1);
    const [preview, setPreview] = useState(null); // { src, alt, fileName }
    const [editingSales, setEditingSales] = useState(null); // objek sales yg diedit
    const [deletingSales, setDeletingSales] = useState(null); // objek sales yg mau dihapus

    // Filter data berdasarkan nama sales
    const filteredSales = salesData.filter((sales) =>
        sales.namaSales.toLowerCase().includes(keyword.toLowerCase().trim())
    );

    // Kembali ke halaman 1 setiap kali keyword pencarian berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword]);

    // Pagination berdasarkan hasil pencarian
    const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredSales.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    const handleVerifikasiChange = (id, value) => {
        setSalesData((prev) =>
            prev.map((sales) => {
                // Guard: kalau status sales ini sudah final (bukan Menunggu),
                // jangan biarkan diubah lagi -> tidak bisa balik ke semula.
                if (sales.id !== id) return sales;
                if (isVerifikasiLocked(sales.verifikasi)) return sales;

                return { ...sales, verifikasi: value };
            })
        );

        // nanti di sini logic buat kirim perubahan status verifikasi ke backend
        console.log("Update verifikasi:", id, value);
    };

    const handleEdit = (sales) => {
        setEditingSales(sales);
    };

    const handleSaveEdit = (updatedSales) => {
        setSalesData((prev) =>
            prev.map((sales) => (sales.id === updatedSales.id ? updatedSales : sales))
        );
        setEditingSales(null);

        // nanti di sini logic buat kirim perubahan data sales (termasuk file baru) ke backend
        console.log("Simpan edit sales:", updatedSales);
    };

    const handleDelete = (sales) => {
        setDeletingSales(sales);
    };

    const confirmDelete = () => {
        setSalesData((prev) => prev.filter((s) => s.id !== deletingSales.id));

        // nanti di sini logic buat kirim permintaan hapus ke backend
        console.log("Hapus sales:", deletingSales.id);

        setDeletingSales(null);
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const openPreview = (src, alt, fileName) => setPreview({ src, alt, fileName });
    const closePreview = () => setPreview(null);

    return (
        <div className="sima-sales-table-wrap">

            <table className="sima-sales-table">
                <thead>
                    <tr>
                        <th className="sima-sales-table__col-no">No</th>
                        <th className="sima-sales-table__col-center">Foto Profil</th>
                        <th>Nama Sales</th>
                        <th>NIK</th>
                        <th>No Telepon</th>
                        <th>Alamat</th>
                        <th className="sima-sales-table__col-center">KTP</th>
                        <th className="sima-sales-table__col-center">SIM A</th>
                        <th className="sima-sales-table__col-center">SIM C</th>
                        <th className="sima-sales-table__col-center">CV</th>
                        <th className="sima-sales-table__col-center">Verifikasi</th>
                        <th className="sima-sales-table__col-center">Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {currentData.length === 0 ? (
                        <tr>
                            <td colSpan={12} className="sima-sales-table__empty">
                                {keyword.trim()
                                    ? `Data sales dengan nama "${keyword}" tidak ditemukan.`
                                    : "Belum ada data sales."}
                            </td>
                        </tr>
                    ) : (
                        currentData.map((sales, index) => {
                            const verifMeta = getVerifikasiMeta(sales.verifikasi);
                            const verifLocked = isVerifikasiLocked(sales.verifikasi);

                            return (
                                <tr key={sales.id}>
                                    <td className="sima-sales-table__col-no">
                                        {startIndex + index + 1}
                                    </td>

                                    <td className="sima-sales-table__col-center">
                                        <ProfilePhoto
                                            src={sales.fotoProfil}
                                            namaSales={sales.namaSales}
                                            onPreview={openPreview}
                                        />
                                    </td>

                                    <td className="sima-sales-table__strong">
                                        {sales.namaSales}
                                    </td>

                                    <td>{sales.nik}</td>

                                    {/* LINK WHATSAPP */}
                                    <td>
                                        <a
                                            href={toWaLink(sales.noTelepon)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="sima-sales-table__wa-link"
                                            title={`Chat WhatsApp ${sales.namaSales}`}
                                        >
                                            {sales.noTelepon}
                                        </a>
                                    </td>

                                    <td>{sales.alamat}</td>

                                    <td className="sima-sales-table__col-center">
                                        <DocPhoto
                                            src={sales.fotoKtp}
                                            alt={`KTP ${sales.namaSales}`}
                                            label="KTP"
                                            namaSales={sales.namaSales}
                                            onPreview={openPreview}
                                        />
                                    </td>

                                    <td className="sima-sales-table__col-center">
                                        <DocPhoto
                                            src={sales.fotoSimA}
                                            alt={`SIM A ${sales.namaSales}`}
                                            label="SIMA"
                                            namaSales={sales.namaSales}
                                            onPreview={openPreview}
                                        />
                                    </td>

                                    <td className="sima-sales-table__col-center">
                                        <DocPhoto
                                            src={sales.fotoSimC}
                                            alt={`SIM C ${sales.namaSales}`}
                                            label="SIMC"
                                            namaSales={sales.namaSales}
                                            onPreview={openPreview}
                                        />
                                    </td>

                                    <td className="sima-sales-table__col-center">
                                        <CvFile src={sales.cv} namaSales={sales.namaSales} />
                                    </td>

                                    <td className="sima-sales-table__col-center">
                                        <select
                                            className={`sima-sales-table__verif ${verifMeta.className}`}
                                            value={sales.verifikasi}
                                            disabled={verifLocked}
                                            title={
                                                verifLocked
                                                    ? "Status verifikasi sudah final dan tidak bisa diubah"
                                                    : undefined
                                            }
                                            onChange={(e) =>
                                                handleVerifikasiChange(
                                                    sales.id,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value={VERIFIKASI_STATUS.MENUNGGU}>
                                                Menunggu Verifikasi
                                            </option>
                                            <option value={VERIFIKASI_STATUS.BERHASIL}>
                                                Berhasil Verifikasi
                                            </option>
                                            <option value={VERIFIKASI_STATUS.TIDAK_BERHASIL}>
                                                Tidak Berhasil Verifikasi
                                            </option>
                                        </select>
                                    </td>

                                    <td className="sima-sales-table__col-center">
                                        <div className="sima-sales-table__aksi">

                                            <button
                                                type="button"
                                                className="sima-sales-table__aksi-btn sima-sales-table__aksi-btn--edit"
                                                onClick={() => handleEdit(sales)}
                                                title={`Edit ${sales.namaSales}`}
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                                                </svg>
                                            </button>

                                            <button
                                                type="button"
                                                className="sima-sales-table__aksi-btn sima-sales-table__aksi-btn--delete"
                                                onClick={() => handleDelete(sales)}
                                                title={`Hapus ${sales.namaSales}`}
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                    <path d="M10 11v6" />
                                                    <path d="M14 11v6" />
                                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                </svg>
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* ---------- PAGINATION ---------- */}
            {totalPages > 1 && (
                <div className="sima-sales-pagination">

                    <span className="sima-sales-pagination__info">
                        Menampilkan {startIndex + 1}–
                        {Math.min(
                            startIndex + ITEMS_PER_PAGE,
                            filteredSales.length
                        )}{" "}
                        dari {filteredSales.length} data
                    </span>

                    <div className="sima-sales-pagination__controls">

                        <button
                            type="button"
                            className="sima-sales-pagination__btn"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Halaman sebelumnya"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                type="button"
                                className={`sima-sales-pagination__btn ${page === currentPage
                                    ? "sima-sales-pagination__btn--active"
                                    : ""
                                    }`}
                                onClick={() => goToPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="sima-sales-pagination__btn"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Halaman selanjutnya"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                    </div>
                </div>
            )}

            {/* ---------- LIGHTBOX PREVIEW ---------- */}
            {preview && (
                <div
                    className="sima-sales-table__lightbox"
                    onClick={closePreview}
                    role="button"
                    tabIndex={-1}
                >
                    <div
                        className="sima-sales-table__lightbox-inner"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="sima-sales-table__lightbox-close"
                            onClick={closePreview}
                            aria-label="Tutup"
                        >
                            ×
                        </button>

                        <img src={preview.src} alt={preview.alt} />
                        <p>{preview.alt}</p>

                        <a
                            className="sima-sales-table__lightbox-download"
                            href={preview.src}
                            download={preview.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IconDownload />
                            Download
                        </a>
                    </div>
                </div>
            )}

            {/* ---------- MODAL EDIT ---------- */}
            {editingSales && (
                <EditSalesModal
                    key={editingSales.id}
                    sales={editingSales}
                    onClose={() => setEditingSales(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* ---------- MODAL KONFIRMASI HAPUS ---------- */}
            {deletingSales && (
                <DeleteConfirmModal
                    sales={deletingSales}
                    onCancel={() => setDeletingSales(null)}
                    onConfirm={confirmDelete}
                />
            )}

        </div>
    );
}

export default SalesTable;