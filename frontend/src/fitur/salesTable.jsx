import { useEffect, useState, useLayoutEffect } from "react";
import "../css/salesTable.css";

const API_BASE_URL = "http://localhost:3000/api";
const FILE_BASE_URL = "http://localhost:3000/uploads";

// Status verifikasi yang tersedia (label di UI)
const VERIFIKASI_STATUS = {
    MENUNGGU: "Menunggu",
    BERHASIL: "Berhasil",
    TIDAK_BERHASIL: "TidakBerhasil",
};

// Mapping status backend ("pending" | "active" | "rejected")
// ke label verifikasi yang dipakai di UI
function statusToVerifikasi(status) {
    if (status === "active") return VERIFIKASI_STATUS.BERHASIL;
    if (status === "rejected") return VERIFIKASI_STATUS.TIDAK_BERHASIL;
    return VERIFIKASI_STATUS.MENUNGGU;
}

// Mapping sebaliknya, dari pilihan UI ke status yang dikirim ke backend
function verifikasiToStatus(verifikasi) {
    if (verifikasi === VERIFIKASI_STATUS.BERHASIL) return "active";
    if (verifikasi === VERIFIKASI_STATUS.TIDAK_BERHASIL) return "rejected";
    return "pending";
}

// Ubah nama file (yang tersimpan di DB) jadi URL lengkap ke folder uploads
function toFileUrl(filename) {
    if (!filename) return null;
    return `${FILE_BASE_URL}/${filename}`;
}

// Ubah 1 dokumen user dari backend jadi bentuk yang dipakai tabel ini
function mapUserToSales(user) {
    return {
        id: user._id,
        namaSales: user.namaLengkap,
        nik: user.nik,
        noTelepon: user.noTelepon,
        alamat: user.alamat,
        fotoProfil: toFileUrl(user.fotoProfile),
        fotoKtp: toFileUrl(user.fotoKtp),
        fotoSimA: toFileUrl(user.fotoSimA),
        fotoSimC: toFileUrl(user.fotoSimC),
        cv: toFileUrl(user.cv),
        verifikasi: statusToVerifikasi(user.status),
    };
}

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
            ...(options.body instanceof FormData
                ? {}
                : { "Content-Type": "application/json" }),
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

const ITEMS_PER_PAGE = 5;

// Field foto/dokumen yang bisa diganti lewat form edit
const UPLOAD_FIELDS = [
    { key: "fotoProfil", label: "Foto Profil", accept: "image/*", type: "image" },
    { key: "fotoKtp", label: "Foto KTP", accept: "image/*", type: "image" },
    { key: "fotoSimA", label: "Foto SIM A", accept: "image/*", type: "image" },
    { key: "fotoSimC", label: "Foto SIM C", accept: "image/*", type: "image" },
    { key: "cv", label: "CV", accept: "application/pdf", type: "file" },
];

// Field foto/dokumen -> nama field yang dipakai backend saat upload ulang
const UPLOAD_FIELD_TO_BACKEND_KEY = {
    fotoProfil: "fotoProfile",
    fotoKtp: "fotoKtp",
    fotoSimA: "fotoSimA",
    fotoSimC: "fotoSimC",
    cv: "cv",
};

// ---------- HOOK: KUNCI SCROLL BODY SAAT MODAL/LIGHTBOX TERBUKA ----------
function useLockBodyScroll() {
    useLayoutEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);
}

function toWaLink(noTelepon) {
    if (!noTelepon) return null;

    const digitsOnly = noTelepon.replace(/\D/g, "");

    const waNumber = digitsOnly.startsWith("0")
        ? "62" + digitsOnly.slice(1)
        : digitsOnly;

    return `https://wa.me/${waNumber}`;
}

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

function isVerifikasiLocked(status) {
    return status !== VERIFIKASI_STATUS.MENUNGGU;
}

function buildDownloadFileName(namaSales, label, src) {
    const cleanName = namaSales.trim().replace(/\s+/g, "_");
    const extMatch = src.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    const ext = extMatch ? extMatch[1] : "jpg";
    return `${cleanName}_${label}.${ext}`;
}

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

function DeleteConfirmModal({ sales, onCancel, onConfirm }) {
    useLockBodyScroll();

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

function EditSalesModal({ sales, onClose, onSave }) {
    const [form, setForm] = useState({ ...sales });
    const [newFiles, setNewFiles] = useState({}); // key -> File asli, untuk dikirim ke backend
    const [uploading, setUploading] = useState(null);
    useLockBodyScroll();

    const handleTextChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (field, file) => {
        if (!file) return;
        setUploading(field);
        try {
            const dataUrl = await readFileAsDataUrl(file);
            setForm((prev) => ({ ...prev, [field]: dataUrl }));
            setNewFiles((prev) => ({ ...prev, [field]: file }));
        } finally {
            setUploading(null);
        }
    };

    const handleRemoveFile = (field) => {
        setForm((prev) => ({ ...prev, [field]: null }));
        setNewFiles((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form, newFiles);
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

function LightboxPreview({ preview, onClose }) {
    useLockBodyScroll();

    return (
        <div
            className="sima-sales-table__lightbox"
            onClick={onClose}
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
                    onClick={onClose}
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
    );
}

function SalesTable({ keyword = "" }) {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [preview, setPreview] = useState(null);
    const [editingSales, setEditingSales] = useState(null);
    const [deletingSales, setDeletingSales] = useState(null);

    // ---------- AMBIL DATA SALES DARI BACKEND ----------
    const loadSales = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const data = await apiFetch("/users/sales");
            setSalesData(data.map(mapUserToSales));
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, []);

    const filteredSales = salesData.filter((sales) =>
        sales.namaSales.toLowerCase().includes(keyword.toLowerCase().trim())
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword]);

    const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredSales.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // ---------- UPDATE STATUS VERIFIKASI ----------
    const handleVerifikasiChange = async (id, value) => {
        const targetSales = salesData.find((s) => s.id === id);
        if (!targetSales || isVerifikasiLocked(targetSales.verifikasi)) return;

        // update tampilan dulu (optimistic), nanti dikoreksi kalau gagal
        setSalesData((prev) =>
            prev.map((sales) =>
                sales.id === id ? { ...sales, verifikasi: value } : sales
            )
        );

        try {
            await apiFetch(`/users/sales/${id}/verifikasi`, {
                method: "PATCH",
                body: JSON.stringify({ status: verifikasiToStatus(value) }),
            });
        } catch (err) {
            alert(err.message);
            // gagal -> balikin ke status semula
            setSalesData((prev) =>
                prev.map((sales) =>
                    sales.id === id ? { ...sales, verifikasi: targetSales.verifikasi } : sales
                )
            );
        }
    };

    const handleEdit = (sales) => {
        setEditingSales(sales);
    };

    // ---------- SIMPAN EDIT KE BACKEND ----------
    const handleSaveEdit = async (updatedForm, newFiles) => {
        try {
            const formData = new FormData();
            formData.append("namaLengkap", updatedForm.namaSales);
            formData.append("nik", updatedForm.nik);
            formData.append("noTelepon", updatedForm.noTelepon);
            formData.append("alamat", updatedForm.alamat);

            Object.entries(newFiles).forEach(([uiKey, file]) => {
                const backendKey = UPLOAD_FIELD_TO_BACKEND_KEY[uiKey];
                if (backendKey && file) formData.append(backendKey, file);
            });

            const result = await apiFetch(`/users/sales/${updatedForm.id}`, {
                method: "PUT",
                body: formData,
            });

            setSalesData((prev) =>
                prev.map((sales) =>
                    sales.id === updatedForm.id ? mapUserToSales(result.user) : sales
                )
            );
            setEditingSales(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = (sales) => {
        setDeletingSales(sales);
    };

    const confirmDelete = async () => {
        try {
            await apiFetch(`/users/sales/${deletingSales.id}`, { method: "DELETE" });
            setSalesData((prev) => prev.filter((s) => s.id !== deletingSales.id));
        } catch (err) {
            alert(err.message);
        } finally {
            setDeletingSales(null);
        }
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const openPreview = (src, alt, fileName) => setPreview({ src, alt, fileName });
    const closePreview = () => setPreview(null);

    if (loading) {
        return <p className="sima-sales-table__empty">Memuat data sales...</p>;
    }

    if (errorMsg) {
        return <p className="sima-sales-table__empty">Gagal memuat data: {errorMsg}</p>;
    }

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

            {preview && (
                <LightboxPreview preview={preview} onClose={closePreview} />
            )}

            {editingSales && (
                <EditSalesModal
                    key={editingSales.id}
                    sales={editingSales}
                    onClose={() => setEditingSales(null)}
                    onSave={handleSaveEdit}
                />
            )}

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