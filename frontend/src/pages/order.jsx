// pages/order.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import OrderStatusTabs from "../fitur/orderStatusTabs";
import "../css/global.css";
import "../css/order.css";

const ITEMS_PER_PAGE = 5;

// Daftar status yang tersedia untuk diganti lewat dropdown
const STATUS_OPTIONS = [
    { value: "masuk", label: "Orderan Masuk" },
    { value: "disiapkan", label: "Pesanan Disiapkan" },
    { value: "selesai", label: "Pesanan Selesai" },
];

// ============ KATALOG PRODUK (sumber untuk generate item pesanan di modal detail) ============
// "kemasan" = deskripsi asli dari katalog (mis. "1 Set 2 Pcs" / "1 Pcs"), dipakai
// cuma buat nentuin satuan-nya SET atau PCS. Qty pesanan (angka) di-random terpisah.
const DUMMY_PRODUCTS = [
    { nama: "Per Shock Breaker RXK", harga: 25000, kemasan: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "RXK" },
    { nama: "Per Shock Breaker Legenda", harga: 24000, kemasan: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Legenda" },
    { nama: "Per Shock Breaker Satria", harga: 24000, kemasan: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Satria" },
    { nama: "Per Shock Breaker GL Pro", harga: 45000, kemasan: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "GL Pro" },
    { nama: "Per Shock Breaker TRS", harga: 65000, kemasan: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "TRS" },
    { nama: "Per Shock Breaker Tiger", harga: 65000, kemasan: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Tiger" },
    { nama: "Per Standar Samping Grand", harga: 5000, kemasan: "1 Pcs", kategori: "Per Standar Samping", kendaraan: "Grand" },
    { nama: "Per Standar Samping Yamaha", harga: 5000, kemasan: "1 Pcs", kategori: "Per Standar Samping", kendaraan: "Yamaha" },
    { nama: "Per Standar Tengah GL", harga: 6000, kemasan: "1 Pcs", kategori: "Per Standar Tengah", kendaraan: "GL" },
    { nama: "Per Standar Tengah Supra Fit", harga: 5000, kemasan: "1 Pcs", kategori: "Per Standar Tengah", kendaraan: "Supra Fit" },
    { nama: "Per Stopper GL PRO", harga: 5000, kemasan: "1 Pcs", kategori: "Per Stopper", kendaraan: "GL Pro" },
    { nama: "Per Stopper RXK", harga: 5000, kemasan: "1 Pcs", kategori: "Per Stopper", kendaraan: "RXK" },
    { nama: "Per Versnelleng RXK", harga: 10000, kemasan: "1 Pcs", kategori: "Per Versnelleng", kendaraan: "RXK" },
    { nama: "Switch Rem Depan Supra", harga: 12500, kemasan: "1 Pcs", kategori: "Switch Rem Depan", kendaraan: "Supra" },
    { nama: "Switch Netral Grand", harga: 17500, kemasan: "1 Pcs", kategori: "Switch Netral", kendaraan: "Grand" },
    { nama: "Switch Netral Tiger", harga: 17500, kemasan: "1 Pcs", kategori: "Switch Netral", kendaraan: "Tiger" },
    { nama: "Tutup Magnit Grand (Hitam)", harga: 7500, kemasan: "1 Set 2 Pcs", kategori: "Tutup Magnit", kendaraan: "Grand" },
    { nama: "Tutup Magnit Supra (Silver)", harga: 7500, kemasan: "1 Set 2 Pcs", kategori: "Tutup Magnit", kendaraan: "Supra" },
    { nama: "Tutup Mesin Legenda (Plastik)", harga: 25000, kemasan: "1 Pcs", kategori: "Tutup Mesin", kendaraan: "Legenda" },
    { nama: "Tutup Mesin Smash/Shogun", harga: 25000, kemasan: "1 Pcs", kategori: "Tutup Mesin", kendaraan: "Smash/Shogun" },
    { nama: "Ring Komstir RC", harga: 5000, kemasan: "1 Pcs", kategori: "Lainnya", kendaraan: "RC" },
    { nama: "Tombol Klakson", harga: 5500, kemasan: "1 Pcs", kategori: "Lainnya", kendaraan: "Universal" },
];

// Kalau deskripsi kemasannya mengandung kata "Set" (mis. "1 Set 2 Pcs") -> satuannya SET, selain itu PCS
function getSatuan(kemasan) {
    return kemasan.toLowerCase().includes("set") ? "SET" : "PCS";
}

// PRNG sederhana biar hasil random konsisten tiap render (seeded by order id)
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Generate 30-40 baris item pesanan random dari katalog, per order (seeded biar stabil)
// Qty pesanan berupa angka random (mis. 5, 10, 15), satuannya ikut jenis kemasan produknya (SET/PCS)
function buildOrderItems(seed) {
    const rng = mulberry32(seed * 9973);
    const itemCount = Math.floor(rng() * (40 - 30 + 1)) + 30; // 30-40 baris

    const items = [];
    for (let i = 0; i < itemCount; i++) {
        const product = DUMMY_PRODUCTS[Math.floor(rng() * DUMMY_PRODUCTS.length)];
        const qty = Math.floor(rng() * (20 - 5 + 1)) + 5; // angka qty pesanan, 5-20
        items.push({
            nama: product.nama,
            qty,
            satuan: getSatuan(product.kemasan),
        });
    }
    return items;
}

// Dummy data pesanan awal, nanti diganti hasil fetch dari API
// Semua order awalnya berstatus "Orderan Masuk"
const INITIAL_ORDERS = [
    { id: 1, orderNumber: "ORD-0001", storeName: "Toko Sumber Rejeki", salesName: "Budi Santoso", orderDate: "2025-08-20" },
    { id: 2, orderNumber: "ORD-0002", storeName: "Toko Barokah", salesName: "Siti Aminah", orderDate: "2025-08-21" },
    { id: 3, orderNumber: "ORD-0003", storeName: "Toko Maju Jaya", salesName: "Budi Santoso", orderDate: "2025-08-22" },
    { id: 4, orderNumber: "ORD-0004", storeName: "Toko Berkah Abadi", salesName: "Dedi Kurniawan", orderDate: "2025-08-22" },
    { id: 5, orderNumber: "ORD-0005", storeName: "Toko Mekar Sari", salesName: "Siti Aminah", orderDate: "2025-08-23" },
    { id: 6, orderNumber: "ORD-0006", storeName: "Toko Anugerah", salesName: "Rahmat Hidayat", orderDate: "2025-08-23" },
    { id: 7, orderNumber: "ORD-0007", storeName: "Toko Sejahtera", salesName: "Budi Santoso", orderDate: "2025-08-24" },
    { id: 8, orderNumber: "ORD-0008", storeName: "Toko Cahaya Baru", salesName: "Dedi Kurniawan", orderDate: "2025-08-24" },
    { id: 9, orderNumber: "ORD-0009", storeName: "Toko Rejeki Lancar", salesName: "Rahmat Hidayat", orderDate: "2025-08-25" },
    { id: 10, orderNumber: "ORD-0010", storeName: "Toko Harapan Jaya", salesName: "Siti Aminah", orderDate: "2025-08-25" },
    { id: 11, orderNumber: "ORD-0011", storeName: "Toko Amanah", salesName: "Budi Santoso", orderDate: "2025-08-26" },
    { id: 12, orderNumber: "ORD-0012", storeName: "Toko Bintang Terang", salesName: "Dedi Kurniawan", orderDate: "2025-08-26" },
    { id: 13, orderNumber: "ORD-0013", storeName: "Toko Sinar Jaya", salesName: "Rahmat Hidayat", orderDate: "2025-08-27" },
    { id: 14, orderNumber: "ORD-0014", storeName: "Toko Makmur Sentosa", salesName: "Siti Aminah", orderDate: "2025-08-27" },
    { id: 15, orderNumber: "ORD-0015", storeName: "Toko Karya Mandiri", salesName: "Budi Santoso", orderDate: "2025-08-27" },
    { id: 16, orderNumber: "ORD-0016", storeName: "Toko Indah Permai", salesName: "Dedi Kurniawan", orderDate: "2025-08-28" },
    { id: 17, orderNumber: "ORD-0017", storeName: "Toko Sumber Makmur", salesName: "Rahmat Hidayat", orderDate: "2025-08-28" },
    { id: 18, orderNumber: "ORD-0018", storeName: "Toko Jaya Abadi", salesName: "Siti Aminah", orderDate: "2025-08-29" },
].map((order) => ({
    ...order,
    status: "masuk",
    statusLabel: "Orderan Masuk",
    items: buildOrderItems(order.id), // tempel list item pesanan (30-40 baris) ke tiap order
}));

// Ambil bagian angka dari orderNumber, misal "ORD-0003" -> 3
function getOrderNumberValue(orderNumber) {
    const match = orderNumber.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

// ============ ICON ============
function EyeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

// ============ STATUS DROPDOWN (badge yang bisa diklik buat ganti status) ============
// Alur status selalu maju: sekali pindah ke status berikutnya, tidak bisa mundur lagi.
// Menu dropdown dirender lewat portal ke document.body dengan posisi fixed,
// supaya tidak kepotong oleh overflow wrapper tabel (sima-table-wrap) waktu barisnya sedikit.
function StatusDropdown({ order, onStatusChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const currentIndex = STATUS_OPTIONS.findIndex((o) => o.value === order.status);
    const isFinalStatus = currentIndex === STATUS_OPTIONS.length - 1; // "selesai" = status terakhir

    // Hanya status yang sama atau lebih maju yang boleh dipilih, status sebelumnya disembunyikan
    const availableOptions = STATUS_OPTIONS.filter((_, idx) => idx >= currentIndex);

    // Hitung posisi tombol tiap kali dropdown dibuka, biar menu portal nempel pas di bawahnya
    const updateMenuPosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setMenuPos({
            top: rect.bottom,
            left: rect.left,
            width: rect.width,
        });
    };

    // Tutup dropdown kalau klik di luar area (baik tombolnya maupun menu portal-nya)
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Tutup dropdown kalau halaman di-scroll atau ukuran window berubah,
    // supaya posisinya tidak "ngambang" salah tempat
    useEffect(() => {
        if (!isOpen) return;
        function handleReposition() {
            setIsOpen(false);
        }
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);
        return () => {
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [isOpen]);

    const handleSelect = (option) => {
        onStatusChange(order.id, option);
        setIsOpen(false);
    };

    const handleTriggerClick = () => {
        if (isFinalStatus) return; // status terakhir, tidak ada lagi yang bisa dipilih
        if (!isOpen) updateMenuPosition();
        setIsOpen((prev) => !prev);
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className={`sima-table__badge status-badge--${order.status} status-dropdown__trigger ${isOpen ? "status-dropdown__trigger--open" : ""
                    } ${isFinalStatus ? "status-dropdown__trigger--locked" : ""}`}
                onClick={handleTriggerClick}
                disabled={isFinalStatus}
            >
                {order.statusLabel}
            </button>

            {isOpen && !isFinalStatus &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="status-dropdown__menu status-dropdown__menu--portal"
                        style={{
                            position: "fixed",
                            top: menuPos.top,
                            left: menuPos.left,
                            minWidth: menuPos.width,
                        }}
                    >
                        {availableOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`status-dropdown__option status-dropdown__option--${option.value} ${option.value === order.status ? "status-dropdown__option--active" : ""
                                    }`}
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
}

// ============ MODAL DETAIL PESANAN (info toko + list item pesanan, scrollable) ============
function OrderDetailModal({ order, isOpen, onClose, onExportPdf }) {
    // Kunci scroll halaman di belakang selama modal terbuka,
    // jadi yang bisa di-scroll cuma isi popup-nya saja
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen || !order) return null;

    return (
        <div className="sima-table-modal-overlay" onClick={onClose}>
            <div
                className="sima-table-modal sima-table-modal--wide sima-table-modal--tall"
                style={{ maxWidth: "900px", width: "94vw" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sima-table-modal__header">
                    <h3>
                        Detail Pesanan {order.orderNumber}
                        <span className="sima-table-modal__item-count">
                            {order.items.length} item
                        </span>
                    </h3>
                    <div className="sima-table-modal__header-actions">
                        <ExportPdfButton onClick={() => onExportPdf(order)} />
                        <button className="sima-table-modal__close" onClick={onClose}>
                            &times;
                        </button>
                    </div>
                </div>

                <div className="sima-table-modal__body">
                    <div className="sima-table-modal__info-grid">
                        <div>
                            <span className="sima-table-modal__readonly-label">Nama Toko</span>
                            <p>{order.storeName}</p>
                        </div>
                        <div>
                            <span className="sima-table-modal__readonly-label">Sales</span>
                            <p>{order.salesName}</p>
                        </div>
                        <div>
                            <span className="sima-table-modal__readonly-label">Tanggal</span>
                            <p>{order.orderDate}</p>
                        </div>
                        <div>
                            <span className="sima-table-modal__readonly-label">Status</span>
                            <p>
                                <span className={`sima-table__badge status-badge--${order.status}`}>
                                    {order.statusLabel}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="sima-table-wrap sima-table-wrap--scroll">
                        <table className="sima-table sima-table--sticky-head">
                            <thead>
                                <tr>
                                    <th className="sima-table__col-no">No</th>
                                    <th>Nama Barang</th>
                                    <th className="sima-table__col-center">Qty</th>
                                    <th className="sima-table__col-center">Satuan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={`${item.nama}-${index}`}>
                                        <td className="sima-table__col-no">{index + 1}</td>
                                        <td className="sima-table__strong">{item.nama}</td>
                                        <td className="sima-table__col-center">{item.qty}</td>
                                        <td className="sima-table__col-center">{item.satuan}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="sima-table-modal__footer sima-table-modal__footer--between">
                    <span className="sima-table-modal__total">
                        Total: <strong>{order.items.length} item</strong>
                    </span>
                    <button className="sima-table-modal__btn sima-table-modal__btn--ghost" onClick={onClose}>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============ MODAL KONFIRMASI DELETE ============
function DeleteConfirmModal({ order, isOpen, onCancel, onConfirm }) {
    if (!isOpen || !order) return null;

    return (
        <div className="sima-table-modal-overlay" onClick={onCancel}>
            <div
                className="sima-table-modal sima-table-modal--confirm"
                style={{ maxWidth: "440px", width: "90vw" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sima-table-modal__header">
                    <h3>Hapus Pesanan</h3>
                    <button className="sima-table-modal__close" onClick={onCancel}>
                        &times;
                    </button>
                </div>

                <div className="sima-table-modal__body">
                    <p>
                        Apakah Anda yakin ingin menghapus pesanan{" "}
                        <strong>{order.orderNumber}</strong> dari{" "}
                        <strong>{order.storeName}</strong>?
                    </p>
                    <p className="sima-table-modal__warning-text">
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>

                <div className="sima-table-modal__footer sima-table-modal__footer--between">
                    <button className="sima-table-modal__btn sima-table-modal__btn--ghost" onClick={onCancel}>
                        Batal
                    </button>
                    <button className="sima-table-modal__btn sima-table-modal__btn--danger" onClick={onConfirm}>
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============ ORDER TABLE (style sima-table) ============
function OrderTable({ orders, startIndex, onViewDetail, onDelete, onStatusChange }) {
    if (orders.length === 0) {
        return (
            <div className="sima-table-wrap">
                <p className="sima-table__empty">Tidak ada pesanan yang cocok.</p>
            </div>
        );
    }

    return (
        <table className="sima-table">
            <thead>
                <tr>
                    <th className="sima-table__col-no">No</th>
                    <th>No. Pesanan</th>
                    <th>Nama Toko</th>
                    <th className="sima-table__col-center">Sales</th>
                    <th className="sima-table__col-center">Tanggal</th>
                    <th className="sima-table__col-center">Status</th>
                    <th className="sima-table__col-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order, index) => (
                    <tr key={order.id}>
                        <td className="sima-table__col-no">{startIndex + index + 1}</td>
                        <td className="sima-table__strong">{order.orderNumber}</td>
                        <td>{order.storeName}</td>
                        <td className="sima-table__col-center">{order.salesName}</td>
                        <td className="sima-table__col-center">{order.orderDate}</td>
                        <td className="sima-table__col-center">
                            <StatusDropdown order={order} onStatusChange={onStatusChange} />
                        </td>
                        <td className="sima-table__col-center">
                            <div className="sima-table__actions">
                                <button
                                    className="sima-table__btn sima-table__btn--edit"
                                    onClick={() => onViewDetail(order)}
                                    aria-label="Lihat detail pesanan"
                                >
                                    <EyeIcon />
                                </button>
                                <button
                                    className="sima-table__btn sima-table__btn--delete"
                                    onClick={() => onDelete(order)}
                                    aria-label="Hapus pesanan"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ============ PAGINATION (style sima-pagination) ============
function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
    if (totalPages <= 1) return null;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const showingFrom = totalItems === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(startIndex + itemsPerPage, totalItems);

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="sima-pagination">
            <span className="sima-pagination__info">
                Menampilkan {showingFrom}-{showingTo} dari {totalItems} data
            </span>

            <div className="sima-pagination__controls">
                <button
                    className="sima-pagination__btn"
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    aria-label="Halaman sebelumnya"
                >
                    &lsaquo;
                </button>

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        className={`sima-pagination__btn ${currentPage === page ? "sima-pagination__btn--active" : ""
                            }`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="sima-pagination__btn"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    aria-label="Halaman berikutnya"
                >
                    &rsaquo;
                </button>
            </div>
        </div>
    );
}

// ============ ORDER PAGE ============
function Order() {
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [keyword, setKeyword] = useState("");
    const [activeStatus, setActiveStatus] = useState("semua");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleExportPdf = () => {
        console.log("Export PDF diklik");
    };

    const handleExportDetailPdf = (order) => {
        console.log("Export PDF detail pesanan diklik:", order.orderNumber);
    };

    const handleExportExcel = () => {
        console.log("Export Excel diklik");
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedOrder(null);
    };

    const handleDeleteClick = (order) => {
        setOrderToDelete(order);
        setIsDeleteOpen(true);
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setOrderToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (!orderToDelete) return;
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        setIsDeleteOpen(false);
        setOrderToDelete(null);
    };

    // Ganti status pesanan dari dropdown
    const handleStatusChange = (orderId, option) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId
                    ? { ...o, status: option.value, statusLabel: option.label }
                    : o
            )
        );
    };

    const filteredOrders = useMemo(() => {
        const filtered = orders.filter((order) => {
            const matchKeyword =
                order.orderNumber.toLowerCase().includes(keyword.toLowerCase()) ||
                order.storeName.toLowerCase().includes(keyword.toLowerCase());

            const matchStatus =
                activeStatus === "semua" || order.status === activeStatus;

            return matchKeyword && matchStatus;
        });

        // Urutkan nomor order terbesar di paling atas
        return filtered.sort(
            (a, b) => getOrderNumberValue(b.orderNumber) - getOrderNumberValue(a.orderNumber)
        );
    }, [orders, keyword, activeStatus]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const paginatedOrders = useMemo(() => {
        return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredOrders, startIndex]);

    // Reset ke halaman 1 setiap kali filter/keyword berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, activeStatus]);

    // Kalau halaman sekarang jadi kosong setelah delete, mundur 1 halaman
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">
                <div className="page-header-row">
                    <h1>Orderan Masuk</h1>
                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton onClick={handleExportPdf} />
                    </div>
                </div>

                <SearchBar
                    placeholder="Cari nomor pesanan atau nama toko..."
                    onSearch={setKeyword}
                />

                <OrderStatusTabs activeStatus={activeStatus} onChange={setActiveStatus} />

                <div className="sima-table-wrap">
                    <OrderTable
                        orders={paginatedOrders}
                        startIndex={startIndex}
                        onViewDetail={handleViewDetail}
                        onDelete={handleDeleteClick}
                        onStatusChange={handleStatusChange}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredOrders.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </main>
            <Footer />

            <OrderDetailModal
                order={selectedOrder}
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
                onExportPdf={handleExportDetailPdf}
            />

            <DeleteConfirmModal
                order={orderToDelete}
                isOpen={isDeleteOpen}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

export default Order;