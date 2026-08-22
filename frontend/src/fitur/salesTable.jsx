import { useState } from "react";
import "../css/salesTable.css";

const dummySales = [
    {
        id: 1, namaSales: "Budi Santoso", nik: "3273010101900001", noTelepon: "0812-1111-2222", alamat: "Jl. Melati No. 5, Jakarta Selatan",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        verifikasi: "Berhasil"
    },
    {
        id: 2, namaSales: "Siti Rahayu", nik: "3204020202920002", noTelepon: "0813-2222-3333", alamat: "Jl. Kenanga No. 10, Bandung",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: null, fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        verifikasi: "Belum"
    },
    {
        id: 3, namaSales: "Ahmad Fauzi", nik: "3578030303950003", noTelepon: "0857-3333-4444", alamat: "Jl. Anggrek No. 7, Surabaya",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: null,
        verifikasi: "Berhasil"
    },
    {
        id: 4, namaSales: "Dewi Lestari", nik: "3374040404880004", noTelepon: "0821-4444-5555", alamat: "Jl. Mawar No. 21, Semarang",
        fotoKtp: null, fotoSimA: null, fotoSimC: null,
        verifikasi: "Belum"
    },
    {
        id: 5, namaSales: "Rizky Pratama", nik: "3471050505930005", noTelepon: "0878-5555-6666", alamat: "Jl. Cempaka No. 3, Yogyakarta",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        verifikasi: "Berhasil"
    },
    {
        id: 6, namaSales: "Nur Aini", nik: "3573060606910006", noTelepon: "0812-6666-7777", alamat: "Jl. Flamboyan No. 17, Malang",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: null,
        verifikasi: "Belum"
    },
    {
        id: 7, namaSales: "Hendra Wijaya", nik: "1271070707890007", noTelepon: "0813-7777-8888", alamat: "Jl. Mangga No. 55, Medan",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: null, fotoSimC: null,
        verifikasi: "Berhasil"
    },
    {
        id: 8, namaSales: "Putri Ayu", nik: "7371080808940008", noTelepon: "0857-8888-9999", alamat: "Jl. Jambu No. 9, Makassar",
        fotoKtp: null, fotoSimA: null, fotoSimC: null,
        verifikasi: "Belum"
    },
    {
        id: 9, namaSales: "Fajar Nugroho", nik: "1671090909920009", noTelepon: "0821-9999-0000", alamat: "Jl. Rambutan No. 33, Palembang",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: "https://placehold.co/200x130?text=SIM+A", fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        verifikasi: "Berhasil"
    },
    {
        id: 10, namaSales: "Indah Permata", nik: "5171100000970010", noTelepon: "0878-0000-1111", alamat: "Jl. Duku No. 14, Denpasar",
        fotoKtp: "https://placehold.co/200x130?text=KTP", fotoSimA: null, fotoSimC: "https://placehold.co/200x130?text=SIM+C",
        verifikasi: "Belum"
    },
];

const ITEMS_PER_PAGE = 5;

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

function DocPhoto({ src, alt, onPreview }) {
    if (!src) {
        return (
            <span
                className="sima-sales-table__doc-icon-btn sima-sales-table__doc-icon-btn--empty"
                title="Belum ada foto"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            </span>
        );
    }

    return (
        <button
            type="button"
            className="sima-sales-table__doc-icon-btn sima-sales-table__doc-icon-btn--filled"
            onClick={() => onPreview(src, alt)}
            title={`Lihat ${alt}`}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
            </svg>
        </button>
    );
}

function SalesTable({ data = dummySales }) {
    const [salesData, setSalesData] = useState(data);
    const [currentPage, setCurrentPage] = useState(1);
    const [preview, setPreview] = useState(null); // { src, alt }

    const totalPages = Math.ceil(salesData.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = salesData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleVerifikasiChange = (id, value) => {
        setSalesData((prev) =>
            prev.map((sales) =>
                sales.id === id ? { ...sales, verifikasi: value } : sales
            )
        );

        // nanti di sini logic buat kirim perubahan status verifikasi ke backend
        console.log("Update verifikasi:", id, value);
    };

    const handleEdit = (sales) => {
        // nanti di sini logic buat buka modal edit / isi form dengan data sales
        console.log("Edit sales:", sales);
    };

    const handleDelete = (sales) => {
        const konfirmasi = window.confirm(
            `Yakin ingin menghapus data sales "${sales.namaSales}"?`
        );

        if (!konfirmasi) return;

        setSalesData((prev) => prev.filter((s) => s.id !== sales.id));

        // nanti di sini logic buat kirim permintaan hapus ke backend
        console.log("Hapus sales:", sales.id);
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const openPreview = (src, alt) => setPreview({ src, alt });
    const closePreview = () => setPreview(null);

    return (
        <div className="sima-sales-table-wrap">

            <table className="sima-sales-table">
                <thead>
                    <tr>
                        <th className="sima-sales-table__col-no">No</th>
                        <th>Nama Sales</th>
                        <th>NIK</th>
                        <th>No Telepon</th>
                        <th>Alamat</th>
                        <th className="sima-sales-table__col-center">KTP</th>
                        <th className="sima-sales-table__col-center">SIM A</th>
                        <th className="sima-sales-table__col-center">SIM C</th>
                        <th className="sima-sales-table__col-center">Verifikasi</th>
                        <th className="sima-sales-table__col-center">Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {currentData.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="sima-sales-table__empty">
                                Belum ada data sales.
                            </td>
                        </tr>
                    ) : (
                        currentData.map((sales, index) => (
                            <tr key={sales.id}>
                                <td className="sima-sales-table__col-no">
                                    {startIndex + index + 1}
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
                                        onPreview={openPreview}
                                    />
                                </td>

                                <td className="sima-sales-table__col-center">
                                    <DocPhoto
                                        src={sales.fotoSimA}
                                        alt={`SIM A ${sales.namaSales}`}
                                        onPreview={openPreview}
                                    />
                                </td>

                                <td className="sima-sales-table__col-center">
                                    <DocPhoto
                                        src={sales.fotoSimC}
                                        alt={`SIM C ${sales.namaSales}`}
                                        onPreview={openPreview}
                                    />
                                </td>

                                <td className="sima-sales-table__col-center">
                                    <select
                                        className={`sima-sales-table__verif ${sales.verifikasi === "Berhasil"
                                            ? "sima-sales-table__verif--berhasil"
                                            : "sima-sales-table__verif--belum"
                                            }`}
                                        value={sales.verifikasi}
                                        onChange={(e) =>
                                            handleVerifikasiChange(
                                                sales.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="Berhasil">
                                            Berhasil Verifikasi
                                        </option>
                                        <option value="Belum">
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
                        ))
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
                            salesData.length
                        )}{" "}
                        dari {salesData.length} data
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
                    </div>
                </div>
            )}

        </div>
    );
}

export default SalesTable;