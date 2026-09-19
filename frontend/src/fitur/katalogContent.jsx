import { useState, useMemo, useEffect } from "react";
import { FaTag } from "react-icons/fa";
import SearchBar from "../components/searchBar";
import AddButton from "../components/addButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import ProductGrid from "./productGrid";
import Pagination from "../components/pagination";
import CategoryList from "../components/categoryList";
import CheckboxFilter from "../components/checkboxFilter";
import PriceSort from "../components/priceSort";
import { getItems } from "../services/itemService";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 10;
const OVERLAY_BG = "rgba(16, 24, 40, 0.5)";
const HEADING = "#101828";
const LABEL = "#344054";
const BORDER = "#D0D5DD";
const ACCENT = "#EE4D2D";

// ==================================================
// DISKON DI localStorage (murni frontend, per browser)
// Bentuk data: { [idProduk]: persen }
// ==================================================
const DISKON_KEY = "katalog_diskon";

function hitungHargaSetelahDiskon(harga, persen) {
    return Math.round(harga - (harga * persen) / 100);
}

function loadDiskonMap() {
    try {
        return JSON.parse(localStorage.getItem(DISKON_KEY)) || {};
    } catch {
        return {};
    }
}

function saveDiskonMap(map) {
    try {
        localStorage.setItem(DISKON_KEY, JSON.stringify(map));
    } catch {
        // storage penuh / diblokir -> diskon tetap jalan di state, hanya tidak persisten
    }
}

// Tempelkan diskon tersimpan ke daftar produk dari server
function applyStoredDiskon(items) {
    const map = loadDiskonMap();
    return items.map((p) => {
        const persen = map[p._id];
        return persen > 0
            ? {
                ...p,
                diskon: persen,
                hargaSetelahDiskon: hitungHargaSetelahDiskon(p.harga, persen),
            }
            : p;
    });
}

export default function KatalogContent({ onAddToOrder }) {
    const { isAdmin } = useAuth();

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [selectedKendaraan, setSelectedKendaraan] = useState([]);
    const [priceSort, setPriceSort] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);

    // ==================================================
    // MODE ATUR DISKON
    // Murni frontend: disimpan di localStorage, tidak ada request ke backend.
    // ==================================================
    const [diskonMode, setDiskonMode] = useState(false);
    const [diskonPersen, setDiskonPersen] = useState("");
    const [selectedForDiskon, setSelectedForDiskon] = useState([]);
    const [diskonError, setDiskonError] = useState(null);

    // popup konfirmasi { title, message, onConfirm }
    const [confirmModal, setConfirmModal] = useState(null);

    // Ambil produk dari API, lalu tempelkan diskon yang tersimpan di localStorage
    useEffect(() => {
        setIsLoading(true);
        getItems()
            .then((items) => setProducts(applyStoredDiskon(items)))
            .catch((err) => setLoadError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const categories = useMemo(
        () => [...new Set(products.map((p) => p.kategori))],
        [products]
    );

    const kendaraanOptions = useMemo(
        () => [...new Set(products.map((p) => p.kendaraan))].sort(),
        [products]
    );

    const handleAddProduk = () => console.log("Tambah produk diklik");
    const handleExportPdf = () => console.log("Export PDF diklik");
    const handleExportExcel = () => console.log("Export Excel diklik");
    const handleEditClick = (product) => console.log("Edit produk:", product);

    const handleSearch = (value) => {
        setKeyword(value);
        setCurrentPage(1);
    };

    const handleSelectCategory = (category) => {
        setActiveCategory(category);
        setCurrentPage(1);
    };

    const handleKendaraanChange = (selected) => {
        setSelectedKendaraan(selected);
        setCurrentPage(1);
    };

    const handlePriceSortChange = (value) => {
        setPriceSort(value);
        setCurrentPage(1);
    };

    // ==================================================
    // HANDLER MODE DISKON
    // ==================================================
    const handleBukaDiskonMode = () => {
        setDiskonMode(true);
        setSelectedForDiskon([]);
        setDiskonPersen("");
        setDiskonError(null);
    };

    const handleBatalDiskonMode = () => {
        setDiskonMode(false);
        setSelectedForDiskon([]);
        setDiskonPersen("");
        setDiskonError(null);
    };

    const handleToggleSelectDiskon = (product) => {
        setSelectedForDiskon((prev) =>
            prev.includes(product._id)
                ? prev.filter((id) => id !== product._id)
                : [...prev, product._id]
        );
    };

    const handleTerapkanDiskon = () => {
        const persen = Number(diskonPersen);

        if (selectedForDiskon.length === 0) {
            setDiskonError("Pilih minimal 1 barang terlebih dahulu.");
            return;
        }
        if (!persen || persen <= 0 || persen > 100) {
            setDiskonError("Masukkan persen diskon yang valid (1 - 100).");
            return;
        }

        setDiskonError(null);

        const map = loadDiskonMap();
        selectedForDiskon.forEach((id) => {
            map[id] = persen;
        });
        saveDiskonMap(map);

        setProducts((prev) =>
            prev.map((p) =>
                selectedForDiskon.includes(p._id)
                    ? {
                        ...p,
                        diskon: persen,
                        hargaSetelahDiskon: hitungHargaSetelahDiskon(p.harga, persen),
                    }
                    : p
            )
        );
        handleBatalDiskonMode();
    };

    // Kembalikan 1 produk ke harga semula (tombol X di kartu produk)
    const handleHapusDiskon = (product) => {
        if (!product.diskon || product.diskon <= 0) return;

        setConfirmModal({
            title: "Kembalikan Harga",
            message: `Kembalikan harga "${product.nama}" ke harga semula?`,
            onConfirm: () => {
                const map = loadDiskonMap();
                delete map[product._id];
                saveDiskonMap(map);

                setProducts((prev) =>
                    prev.map((p) =>
                        p._id === product._id
                            ? { ...p, diskon: 0, hargaSetelahDiskon: p.harga }
                            : p
                    )
                );
                setConfirmModal(null);
            },
        });
    };

    // Reset semua diskon sekaligus
    const handleResetSemuaDiskon = () => {
        const adaDiskon = products.some((p) => p.diskon > 0);
        if (!adaDiskon) return;

        setConfirmModal({
            title: "Reset Semua Diskon",
            message:
                "Kembalikan SEMUA produk ke harga semula? Ini akan menghapus semua diskon yang sedang aktif.",
            onConfirm: () => {
                saveDiskonMap({});
                setProducts((prev) =>
                    prev.map((p) => ({ ...p, diskon: 0, hargaSetelahDiskon: p.harga }))
                );
                handleBatalDiskonMode();
                setConfirmModal(null);
            },
        });
    };

    const filteredProducts = useMemo(() => {
        let result = products;

        if (activeCategory !== "Semua") {
            result = result.filter((p) => p.kategori === activeCategory);
        }
        if (selectedKendaraan.length > 0) {
            result = result.filter((p) => selectedKendaraan.includes(p.kendaraan));
        }
        if (keyword.trim() !== "") {
            const q = keyword.toLowerCase();
            result = result.filter(
                (p) => p.nama.toLowerCase().includes(q) || p.kode.toLowerCase().includes(q)
            );
        }
        if (priceSort === "asc") {
            result = [...result].sort((a, b) => a.harga - b.harga);
        } else if (priceSort === "desc") {
            result = [...result].sort((a, b) => b.harga - a.harga);
        }
        return result;
    }, [products, keyword, activeCategory, selectedKendaraan, priceSort]);

    // "Pilih Semua" mengacu ke seluruh produk sesuai filter aktif (bukan cuma 1 halaman)
    const isAllFilteredSelected =
        filteredProducts.length > 0 &&
        filteredProducts.every((p) => selectedForDiskon.includes(p._id));

    const handleToggleSelectAllDiskon = () => {
        if (isAllFilteredSelected) {
            setSelectedForDiskon([]);
        } else {
            setSelectedForDiskon(filteredProducts.map((p) => p._id));
        }
    };

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, currentPage]);

    return (
        <main className="dashboard-content">
            <div className="page-header-row">
                <h1>Katalog</h1>
                <div className="page-header-actions">
                    {!diskonMode && (
                        <button
                            type="button"
                            onClick={handleBukaDiskonMode}
                            className="rounded-md border px-4 py-2 text-sm font-medium"
                            style={{ borderColor: BORDER, color: LABEL }}
                        >
                            <FaTag size={12} style={{ display: "inline", marginRight: 6 }} />
                            Atur Diskon
                        </button>
                    )}
                    {isAdmin && <ExportExcelButton onClick={handleExportExcel} />}
                    {isAdmin && <ExportPdfButton onClick={handleExportPdf} />}
                    {isAdmin && <AddButton label="Tambah Produk" onClick={handleAddProduk} />}
                </div>
            </div>

            {diskonMode && (
                <div
                    className="mt-4 flex flex-wrap items-center gap-3 rounded-md border p-3"
                    style={{ borderColor: "#E4E7EC", background: "#FFF9F5" }}
                >
                    <span className="text-sm font-medium" style={{ color: LABEL }}>
                        Pilih barang di grid, lalu masukkan persen diskon:
                    </span>

                    <button
                        type="button"
                        onClick={handleToggleSelectAllDiskon}
                        className="btn-secondary"
                    >
                        {isAllFilteredSelected ? "Batal Pilih Semua" : "Pilih Semua"}
                    </button>

                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={diskonPersen}
                        onChange={(e) => setDiskonPersen(e.target.value)}
                        placeholder="cth. 15"
                        className="w-24 rounded-md border px-2 py-1 text-sm"
                        style={{ borderColor: BORDER }}
                    />
                    <span className="text-sm" style={{ color: "#667085" }}>%</span>
                    <span className="text-sm" style={{ color: "#667085" }}>
                        {selectedForDiskon.length} barang dipilih
                    </span>
                    <button type="button" onClick={handleTerapkanDiskon} className="btn-primary">
                        Terapkan
                    </button>
                    <button
                        type="button"
                        onClick={handleResetSemuaDiskon}
                        className="btn-secondary"
                        style={{ color: ACCENT }}
                    >
                        Reset Semua Diskon
                    </button>
                    <button type="button" onClick={handleBatalDiskonMode} className="btn-secondary">
                        Batal
                    </button>
                    {diskonError && (
                        <span className="w-full text-xs" style={{ color: "#D92D20" }}>
                            {diskonError}
                        </span>
                    )}
                </div>
            )}

            <SearchBar placeholder="Cari nama produk atau kode barang..." onSearch={handleSearch} />

            <div className="mt-6 flex gap-6">
                <aside className="flex w-56 shrink-0 flex-col gap-6">
                    <CategoryList categories={categories} activeCategory={activeCategory} onSelectCategory={handleSelectCategory} />
                    <div className="border-t pt-4" style={{ borderColor: "#E4E7EC" }}>
                        <CheckboxFilter title="Model Kendaraan" options={kendaraanOptions} selected={selectedKendaraan} onChange={handleKendaraanChange} />
                    </div>
                    <div className="border-t pt-4" style={{ borderColor: "#E4E7EC" }}>
                        <PriceSort value={priceSort} onChange={handlePriceSortChange} />
                    </div>
                </aside>

                <div className="flex-1">
                    {isLoading && <p className="py-10 text-center text-sm text-gray-500">Memuat produk...</p>}
                    {loadError && <p className="py-10 text-center text-sm text-red-500">{loadError}</p>}
                    {!isLoading && !loadError && (
                        <>
                            <ProductGrid
                                products={paginatedProducts}
                                onEdit={isAdmin && !diskonMode ? handleEditClick : undefined}
                                onPreview={undefined}
                                onAddToOrder={!isAdmin && !diskonMode ? onAddToOrder : undefined}
                                selectionMode={diskonMode}
                                selectedIds={selectedForDiskon}
                                onToggleSelect={handleToggleSelectDiskon}
                                onRemoveDiskon={handleHapusDiskon}
                            />
                            <div className="mt-8">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Pop up konfirmasi (kembalikan harga / reset semua diskon) */}
            {confirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: OVERLAY_BG }}
                    onClick={() => setConfirmModal(null)}
                >
                    <div
                        className="w-full max-w-sm rounded-lg bg-white p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-2 text-lg font-semibold" style={{ color: HEADING }}>
                            {confirmModal.title || "Konfirmasi"}
                        </h2>
                        <p className="text-sm" style={{ color: LABEL }}>
                            {confirmModal.message}
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button type="button" onClick={() => setConfirmModal(null)} className="btn-secondary">
                                Batal
                            </button>
                            <button type="button" onClick={confirmModal.onConfirm} className="btn-primary">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}