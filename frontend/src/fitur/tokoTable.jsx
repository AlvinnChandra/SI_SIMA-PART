import { useState, useEffect, useLayoutEffect } from "react";
import "../css/tokoTable.css";

// ---------- DATA DUMMY ----------
export const dummyToko = [
    { id: 1, namaToko: "Toko Jaya Motor", alamat: "Jl. Sudirman No. 12, Jakarta Pusat", noTelepon: "0812-3456-7890", inputBy: "Admin" },
    { id: 2, namaToko: "Berkah Spare Part", alamat: "Jl. Ahmad Yani No. 45, Bandung", noTelepon: "0813-2233-4455", inputBy: "Sales" },
    { id: 3, namaToko: "Sinar Motor Parts", alamat: "Jl. Diponegoro No. 8, Surabaya", noTelepon: "0857-1122-3344", inputBy: "Sales" },
    { id: 4, namaToko: "Maju Jaya Onderdil", alamat: "Jl. Gatot Subroto No. 21, Semarang", noTelepon: "0821-9988-7766", inputBy: "Admin" },
    { id: 5, namaToko: "Cahaya Motor", alamat: "Jl. Veteran No. 3, Yogyakarta", noTelepon: "0878-5566-2211", inputBy: "Sales" },
    { id: 6, namaToko: "Mitra Bengkel Sejahtera", alamat: "Jl. Pahlawan No. 17, Malang", noTelepon: "0812-7788-9900", inputBy: "Admin" },
    { id: 7, namaToko: "Motor Jaya Abadi", alamat: "Jl. Merdeka No. 55, Medan", noTelepon: "0813-4455-6677", inputBy: "Sales" },
    { id: 8, namaToko: "Sumber Rejeki Parts", alamat: "Jl. Kartini No. 9, Makassar", noTelepon: "0857-3344-5566", inputBy: "Admin" },
    { id: 9, namaToko: "Anugerah Motor", alamat: "Jl. Imam Bonjol No. 33, Palembang", noTelepon: "0821-6677-8899", inputBy: "Sales" },
    { id: 10, namaToko: "Karya Mandiri Onderdil", alamat: "Jl. Cendrawasih No. 14, Denpasar", noTelepon: "0878-1234-5678", inputBy: "Admin" },
    { id: 11, namaToko: "Prima Jaya Motor", alamat: "Jl. Hasanuddin No. 6, Balikpapan", noTelepon: "0812-2211-3344", inputBy: "Sales" },
    { id: 12, namaToko: "Rejeki Baru Parts", alamat: "Jl. Sisingamangaraja No. 27, Pekanbaru", noTelepon: "0813-9900-1122", inputBy: "Admin" },
];

const ITEMS_PER_PAGE = 5;

// ---------- HOOK: KUNCI SCROLL BODY SAAT MODAL TERBUKA ----------
function useLockBodyScroll() {
    useLayoutEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);
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

// ---------- MODAL: KONFIRMASI HAPUS ----------
function DeleteConfirmModal({ toko, onCancel, onConfirm }) {
    useLockBodyScroll();

    return (
        <div className="sima-table-modal-overlay" onClick={onCancel} role="button" tabIndex={-1}>
            <div
                className="sima-table-confirm"
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="hapus-toko-title"
            >
                <span className="sima-table-confirm__icon">
                    <IconAlertTriangle />
                </span>

                <h3 id="hapus-toko-title" className="sima-table-confirm__title">
                    Hapus data toko?
                </h3>

                <p className="sima-table-confirm__desc">
                    Data <strong>{toko.namaToko}</strong> akan dihapus permanen dan tidak
                    bisa dikembalikan.
                </p>

                <div className="sima-table-confirm__actions">
                    <button
                        type="button"
                        className="sima-table-modal__btn sima-table-modal__btn--ghost"
                        onClick={onCancel}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        className="sima-table-modal__btn sima-table-modal__btn--danger"
                        onClick={onConfirm}
                    >
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------- MODAL: EDIT TOKO (form sesuai field data) ----------
function EditTokoModal({ toko, onClose, onSave }) {
    const [form, setForm] = useState({ ...toko });
    useLockBodyScroll();

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="sima-table-modal-overlay" onClick={onClose} role="button" tabIndex={-1}>
            <div
                className="sima-table-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-toko-title"
            >
                <div className="sima-table-modal__header">
                    <h3 id="edit-toko-title">Edit Data Toko</h3>
                    <button
                        type="button"
                        className="sima-table-modal__close"
                        onClick={onClose}
                        aria-label="Tutup"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="sima-table-modal__body">

                        <div className="sima-table-modal__field">
                            <label htmlFor="namaToko">Nama Toko</label>
                            <input
                                id="namaToko"
                                type="text"
                                value={form.namaToko}
                                onChange={(e) => handleChange("namaToko", e.target.value)}
                                required
                            />
                        </div>

                        <div className="sima-table-modal__field">
                            <label htmlFor="alamat">Alamat</label>
                            <textarea
                                id="alamat"
                                rows={2}
                                value={form.alamat}
                                onChange={(e) => handleChange("alamat", e.target.value)}
                                required
                            />
                        </div>

                        <div className="sima-table-modal__field">
                            <label htmlFor="noTelepon">No Telepon</label>
                            <input
                                id="noTelepon"
                                type="text"
                                value={form.noTelepon}
                                onChange={(e) => handleChange("noTelepon", e.target.value)}
                                required
                            />
                        </div>

                        <div className="sima-table-modal__field">
                            <span className="sima-table-modal__readonly-label">Input By</span>
                            <span
                                className={`sima-table__badge ${form.inputBy === "Admin"
                                    ? "sima-table__badge--admin"
                                    : "sima-table__badge--sales"
                                    }`}
                            >
                                {form.inputBy}
                            </span>
                        </div>

                    </div>

                    <div className="sima-table-modal__footer">
                        <button
                            type="button"
                            className="sima-table-modal__btn sima-table-modal__btn--ghost"
                            onClick={onClose}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="sima-table-modal__btn sima-table-modal__btn--primary"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TokoTable({ data, setData }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [editingToko, setEditingToko] = useState(null); // objek toko yg diedit
    const [deletingToko, setDeletingToko] = useState(null); // objek toko yg mau dihapus

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // reset ke halaman 1 setiap kali hasil filter/search (data) berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const handleEdit = (toko) => {
        setEditingToko(toko);
    };

    const handleSaveEdit = (updatedToko) => {
        setData((prev) =>
            prev.map((toko) => (toko.id === updatedToko.id ? updatedToko : toko))
        );
        setEditingToko(null);

        // nanti di sini logic buat kirim perubahan data toko ke backend
        console.log("Simpan edit toko:", updatedToko);
    };

    const handleDelete = (toko) => {
        setDeletingToko(toko);
    };

    const confirmDelete = () => {
        setData((prev) => prev.filter((t) => t.id !== deletingToko.id));

        // nanti di sini logic buat kirim permintaan hapus ke backend
        console.log("Hapus toko:", deletingToko.id);

        setDeletingToko(null);
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="sima-table-wrap">

            <table className="sima-table">
                <thead>
                    <tr>
                        <th className="sima-table__col-no">No</th>
                        <th>Nama Toko</th>
                        <th>Alamat</th>
                        <th>No Telepon</th>
                        <th className="sima-table__col-center">Aksi</th>
                        <th>Input By</th>
                    </tr>
                </thead>

                <tbody>
                    {currentData.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="sima-table__empty">
                                Belum ada data toko.
                            </td>
                        </tr>
                    ) : (
                        currentData.map((toko, index) => (
                            <tr key={toko.id}>
                                <td className="sima-table__col-no">
                                    {startIndex + index + 1}
                                </td>
                                <td className="sima-table__strong">{toko.namaToko}</td>
                                <td>{toko.alamat}</td>
                                <td>{toko.noTelepon}</td>
                                <td>
                                    <div className="sima-table__actions">
                                        <button
                                            type="button"
                                            className="sima-table__btn sima-table__btn--edit"
                                            onClick={() => handleEdit(toko)}
                                            aria-label={`Edit ${toko.namaToko}`}
                                            title="Edit"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="sima-table__btn sima-table__btn--delete"
                                            onClick={() => handleDelete(toko)}
                                            aria-label={`Hapus ${toko.namaToko}`}
                                            title="Hapus"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                <path d="M10 11v6" />
                                                <path d="M14 11v6" />
                                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className={`sima-table__badge ${toko.inputBy === "Admin"
                                            ? "sima-table__badge--admin"
                                            : "sima-table__badge--sales"
                                            }`}
                                    >
                                        {toko.inputBy}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* ---------- PAGINATION ---------- */}
            {totalPages > 1 && (
                <div className="sima-pagination">

                    <span className="sima-pagination__info">
                        Menampilkan {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, data.length)} dari {data.length} data
                    </span>

                    <div className="sima-pagination__controls">
                        <button
                            type="button"
                            className="sima-pagination__btn"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Halaman sebelumnya"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                type="button"
                                className={`sima-pagination__btn ${page === currentPage ? "sima-pagination__btn--active" : ""
                                    }`}
                                onClick={() => goToPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="sima-pagination__btn"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Halaman selanjutnya"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>

                </div>
            )}

            {/* ---------- MODAL EDIT ---------- */}
            {editingToko && (
                <EditTokoModal
                    key={editingToko.id}
                    toko={editingToko}
                    onClose={() => setEditingToko(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* ---------- MODAL KONFIRMASI HAPUS ---------- */}
            {deletingToko && (
                <DeleteConfirmModal
                    toko={deletingToko}
                    onCancel={() => setDeletingToko(null)}
                    onConfirm={confirmDelete}
                />
            )}

        </div>
    );
}

export default TokoTable;