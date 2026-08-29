import { useState, useMemo } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import AddButton from "../components/AddButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import ProductGrid from "../fitur/productGrid";
import Pagination from "../components/pagination";
import CategoryList from "../components/categoryList";
import CheckboxFilter from "../components/checkboxFilter";
import PriceSort from "../components/priceSort";
import "../css/global.css";

const PAGE_SIZE = 10;

const FALLBACK_IMG = (kode) => `https://picsum.photos/seed/${kode}/400/400`;

const DUMMY_PRODUCTS = [
    { kode: "SM-417", nama: "Per Shock Breaker RXK", harga: 25000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "RXK" },
    { kode: "SM-418", nama: "Per Shock Breaker Legenda", harga: 24000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Legenda" },
    { kode: "SM-419", nama: "Per Shock Breaker Satria", harga: 24000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Satria" },
    { kode: "SM-420", nama: "Per Shock Breaker GL Pro", harga: 45000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "GL Pro" },
    { kode: "SM-421", nama: "Per Shock Breaker TRS", harga: 65000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "TRS" },
    { kode: "SM-424", nama: "Per Shock Breaker Tiger", harga: 65000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Tiger" },
    { kode: "SM-425", nama: "Per Standar Samping Grand", harga: 5000, qty: "1 Pcs", kategori: "Per Standar Samping", kendaraan: "Grand" },
    { kode: "SM-429", nama: "Per Standar Samping Yamaha", harga: 5000, qty: "1 Pcs", kategori: "Per Standar Samping", kendaraan: "Yamaha" },
    { kode: "SM-430", nama: "Per Standar Tengah GL", harga: 6000, qty: "1 Pcs", kategori: "Per Standar Tengah", kendaraan: "GL" },
    { kode: "SM-433", nama: "Per Standar Tengah Supra Fit", harga: 5000, qty: "1 Pcs", kategori: "Per Standar Tengah", kendaraan: "Supra Fit" },
    { kode: "SM-436", nama: "Per Stopper GL PRO", harga: 5000, qty: "1 Pcs", kategori: "Per Stopper", kendaraan: "GL Pro" },
    { kode: "SM-439", nama: "Per Stopper RXK", harga: 5000, qty: "1 Pcs", kategori: "Per Stopper", kendaraan: "RXK" },
    { kode: "SM-440", nama: "Per Versnelleng RXK", harga: 10000, qty: "1 Pcs", kategori: "Per Versnelleng", kendaraan: "RXK" },
    { kode: "SM-445", nama: "Switch Rem Depan Terminal Supra", harga: 12500, qty: "1 Pcs", kategori: "Switch", kendaraan: "Supra" },
    { kode: "SM-446", nama: "Switch Netral Grand", harga: 17500, qty: "1 Pcs", kategori: "Switch", kendaraan: "Grand" },
    { kode: "SM-448", nama: "Switch Netral Tiger", harga: 17500, qty: "1 Pcs", kategori: "Switch", kendaraan: "Tiger" },
    { kode: "SM-450", nama: "Tutup Magnit Grand (Hitam)", harga: 7500, qty: "1 Set 2 Pcs", kategori: "Tutup Magnit", kendaraan: "Grand" },
    { kode: "SM-451", nama: "Tutup Magnit Supra (Silver)", harga: 7500, qty: "1 Set 2 Pcs", kategori: "Tutup Magnit", kendaraan: "Supra" },
    { kode: "SM-453", nama: "Tutup Mesin Legenda (Plastik)", harga: 25000, qty: "1 Pcs", kategori: "Tutup Mesin", kendaraan: "Legenda" },
    { kode: "SM-454", nama: "Tutup Mesin Smash/Shogun", harga: 25000, qty: "1 Pcs", kategori: "Tutup Mesin", kendaraan: "Smash/Shogun" },
    { kode: "SM-444", nama: "Ring Komstir RC", harga: 5000, qty: "1 Pcs", kategori: "Lainnya", kendaraan: "RC" },
    { kode: "SM-449", nama: "Tombol Klakson", harga: 5500, qty: "1 Pcs", kategori: "Lainnya", kendaraan: "Universal" },
];

// warna untuk modal edit
const OVERLAY_BG = "rgba(16, 24, 40, 0.5)";
const HEADING = "#101828";
const LABEL = "#344054";
const BORDER = "#D0D5DD";
const ACCENT = "#EE4D2D";

function Katalog() {
    const [products, setProducts] = useState(DUMMY_PRODUCTS);
    const [keyword, setKeyword] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [selectedKendaraan, setSelectedKendaraan] = useState([]);
    const [priceSort, setPriceSort] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);

    // state untuk pop up edit
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState(null);

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

    // buka pop up edit
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setEditForm(product);
    };

    const handleEditFormChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    // ganti foto produk (preview via base64, disimpan di memory saja)
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setEditForm((prev) => ({ ...prev, gambar: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setProducts((prev) =>
            prev.map((p) =>
                p.kode === editForm.kode ? { ...editForm, harga: Number(editForm.harga) } : p
            )
        );
        setEditingProduct(null);
        setEditForm(null);
    };

    const closeEditModal = () => {
        setEditingProduct(null);
        setEditForm(null);
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

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, currentPage]);

    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">
                <div className="page-header-row">
                    <h1>Katalog</h1>
                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton onClick={handleExportPdf} />
                        <AddButton label="Tambah Produk" onClick={handleAddProduk} />
                    </div>
                </div>

                <SearchBar
                    placeholder="Cari nama produk atau kode barang..."
                    onSearch={handleSearch}
                />

                <div className="mt-6 flex gap-6">
                    <aside className="flex w-56 shrink-0 flex-col gap-6">
                        <CategoryList
                            categories={categories}
                            activeCategory={activeCategory}
                            onSelectCategory={handleSelectCategory}
                        />

                        <div className="border-t pt-4" style={{ borderColor: "#E4E7EC" }}>
                            <CheckboxFilter
                                title="Model Kendaraan"
                                options={kendaraanOptions}
                                selected={selectedKendaraan}
                                onChange={handleKendaraanChange}
                            />
                        </div>

                        <div className="border-t pt-4" style={{ borderColor: "#E4E7EC" }}>
                            <PriceSort value={priceSort} onChange={handlePriceSortChange} />
                        </div>
                    </aside>

                    <div className="flex-1">
                        <ProductGrid products={paginatedProducts} onEdit={handleEditClick} />

                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Pop up edit produk */}
            {editingProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: OVERLAY_BG }}
                    onClick={closeEditModal}
                >
                    <div
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-lg font-semibold" style={{ color: HEADING }}>
                            Edit Produk
                        </h2>

                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                            {/* Foto produk */}
                            <div className="flex flex-col items-center gap-2">
                                <img
                                    src={editForm.gambar || FALLBACK_IMG(editForm.kode)}
                                    alt={editForm.nama}
                                    className="h-28 w-28 rounded-md border object-cover"
                                    style={{ borderColor: BORDER }}
                                />
                                <label
                                    className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium"
                                    style={{ borderColor: BORDER, color: LABEL }}
                                >
                                    Ganti Foto
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Kode
                                </label>
                                <input
                                    type="text"
                                    value={editForm.kode}
                                    disabled
                                    className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Nama Produk
                                </label>
                                <input
                                    type="text"
                                    value={editForm.nama}
                                    onChange={(e) => handleEditFormChange("nama", e.target.value)}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Harga
                                </label>
                                <input
                                    type="number"
                                    value={editForm.harga}
                                    onChange={(e) => handleEditFormChange("harga", e.target.value)}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Qty
                                </label>
                                <input
                                    type="text"
                                    value={editForm.qty}
                                    onChange={(e) => handleEditFormChange("qty", e.target.value)}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Kategori
                                </label>
                                <input
                                    type="text"
                                    value={editForm.kategori}
                                    onChange={(e) => handleEditFormChange("kategori", e.target.value)}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Kendaraan
                                </label>
                                <input
                                    type="text"
                                    value={editForm.kendaraan}
                                    onChange={(e) => handleEditFormChange("kendaraan", e.target.value)}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="rounded-md border px-4 py-2 text-sm font-medium"
                                    style={{ borderColor: BORDER, color: LABEL }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                                    style={{ background: ACCENT }}
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Katalog;