import { useState } from "react";
import "../css/tokoTable.css";

// ---------- DATA DUMMY ----------
const dummyToko = [
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

function TokoTable() {
    const [data] = useState(dummyToko);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleEdit = (toko) => {
        console.log("Edit toko:", toko);
        // nanti buka modal edit di sini
    };

    const handleDelete = (toko) => {
        console.log("Hapus toko:", toko);
        // nanti tampilkan konfirmasi hapus di sini
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

        </div>
    );
}

export default TokoTable;