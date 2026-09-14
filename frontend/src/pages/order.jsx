// pages/order.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import OrderStatusTabs from "../fitur/orderStatusTabs";
import { apiFetch } from "../services/apiClient";
import "../css/global.css";
import "../css/order.css";

const ITEMS_PER_PAGE = 5;

// Daftar status yang tersedia untuk diganti lewat dropdown
const STATUS_OPTIONS = [
    { value: "masuk", label: "Orderan Masuk" },
    { value: "disiapkan", label: "Pesanan Disiapkan" },
    { value: "selesai", label: "Pesanan Selesai" },
];

// Mapping status di database (backend) <-> key yang dipakai di UI ini
const STATUS_DB_TO_KEY = {
    "Orderan Masuk": "masuk",
    "Diproses": "disiapkan",
    "Selesai": "selesai",
    "Dibatalkan": "dibatalkan",
};

const STATUS_KEY_TO_DB = {
    masuk: "Orderan Masuk",
    disiapkan: "Diproses",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
};

// Ubah 1 dokumen pesanan dari backend -> bentuk order yang dipakai komponen di halaman ini
function transformPesanan(p) {
    const statusKey = STATUS_DB_TO_KEY[p.status] || "masuk";
    const statusOption = STATUS_OPTIONS.find((o) => o.value === statusKey);

    const salesName = p.inputBy?.startsWith("Sales - ")
        ? p.inputBy.replace("Sales - ", "")
        : p.createdBy?.namaLengkap || p.inputBy || "-";

    return {
        id: p._id,
        orderNumber: p.noPesanan || "-",
        storeName: p.namaToko,
        salesName,
        orderDate: new Date(p.tanggalPesanan).toISOString().slice(0, 10),
        status: statusKey,
        statusLabel: statusOption ? statusOption.label : p.status,
        items: (p.items || []).map((item) => ({
            nama: item.nama,
            qty: item.qty,
            satuan: item.satuan,
        })),
    };
}

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
function StatusDropdown({ order, onStatusChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const currentIndex = STATUS_OPTIONS.findIndex((o) => o.value === order.status);
    const isFinalStatus = currentIndex === STATUS_OPTIONS.length - 1;

    const availableOptions = STATUS_OPTIONS.filter((_, idx) => idx >= currentIndex);

    const updateMenuPosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setMenuPos({
            top: rect.bottom,
            left: rect.left,
            width: rect.width,
        });
    };

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
        if (isFinalStatus) return;
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

// ============ MODAL DETAIL PESANAN ============
function OrderDetailModal({ order, isOpen, onClose, onExportPdf }) {
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

// ============ ORDER TABLE ============
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

// ============ PAGINATION (tetap di file yang sama, tidak dipisah) ============
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
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [activeStatus, setActiveStatus] = useState("semua");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Ambil semua pesanan dari backend saat halaman dibuka
    // Pakai apiFetch (services/apiClient.js) supaya token diambil otomatis
    // dari key "simaToken" di localStorage/sessionStorage yang benar
    // (sebelumnya di sini pakai fetch() manual dengan key "token" yang salah,
    // itu penyebab error "Forbidden: Invalid token")
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                // limit besar supaya semua data ketarik, filter & paging tetap di client
                const body = await apiFetch("/pesanan?limit=9999");
                setOrders(body.data.map(transformPesanan));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

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

    // Hapus pesanan lewat API (pakai apiFetch)
    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;

        try {
            await apiFetch(`/pesanan/${orderToDelete.id}`, { method: "DELETE" });
            setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        } catch (err) {
            alert(err.message);
        } finally {
            setIsDeleteOpen(false);
            setOrderToDelete(null);
        }
    };

    // Ganti status pesanan lewat API (pakai apiFetch)
    const handleStatusChange = async (orderId, option) => {
        const statusDb = STATUS_KEY_TO_DB[option.value];

        try {
            await apiFetch(`/pesanan/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: statusDb }),
            });

            setOrders((prev) =>
                prev.map((o) =>
                    o.id === orderId
                        ? { ...o, status: option.value, statusLabel: option.label }
                        : o
                )
            );
        } catch (err) {
            alert(err.message);
        }
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

        return filtered.sort(
            (a, b) => getOrderNumberValue(b.orderNumber) - getOrderNumberValue(a.orderNumber)
        );
    }, [orders, keyword, activeStatus]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const paginatedOrders = useMemo(() => {
        return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredOrders, startIndex]);

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, activeStatus]);

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

                {loading && <p className="sima-table__empty">Memuat data pesanan...</p>}
                {error && <p className="sima-table__empty">{error}</p>}

                {!loading && !error && (
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
                )}
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