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

const FALLBACK_IMG = (id) => `https://picsum.photos/seed/${id}/400/400`;

// Catatan: "id" di sini adalah identitas internal (stabil), BUKAN kode SM-xxx
// yang ditampilkan ke user. Kode SM-xxx dihitung ulang otomatis berdasarkan
// urutan alfabetis nama produk lewat productsWithKode (lihat di bawah).
const DUMMY_PRODUCTS = [
    { id: "SM-001", nama: "Per Shock Breaker RXK", harga: 25000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "RXK" },
    { id: "SM-002", nama: "Per Shock Breaker Legenda", harga: 24000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Legenda" },
    { id: "SM-003", nama: "Per Shock Breaker Satria", harga: 24000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Satria" },
    { id: "SM-004", nama: "Per Shock Breaker GL Pro", harga: 45000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "GL Pro" },
    { id: "SM-005", nama: "Per Shock Breaker TRS", harga: 65000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "TRS" },
    { id: "SM-006", nama: "Per Shock Breaker Tiger", harga: 65000, qty: "1 Set 2 Pcs", kategori: "Per Shock Breaker", kendaraan: "Tiger" },
    { id: "SM-007", nama: "Per Standar Samping Grand", harga: 5000, qty: "1 Pcs", kategori: "Per Standar Samping", kendaraan: "Grand" },
    { id: "SM-008", nama: "Per Standar Samping Yamaha", harga: 5000, qty: "1 Pcs", kategori: "Per Standar Samping", kendaraan: "Yamaha" },
    { id: "SM-009", nama: "Per Standar Tengah GL", harga: 6000, qty: "1 Pcs", kategori: "Per Standar Tengah", kendaraan: "GL" },
    { id: "SM-010", nama: "Per Standar Tengah Supra Fit", harga: 5000, qty: "1 Pcs", kategori: "Per Standar Tengah", kendaraan: "Supra Fit" },
    { id: "SM-011", nama: "Per Stopper GL PRO", harga: 5000, qty: "1 Pcs", kategori: "Per Stopper", kendaraan: "GL Pro" },
    { id: "SM-012", nama: "Per Stopper RXK", harga: 5000, qty: "1 Pcs", kategori: "Per Stopper", kendaraan: "RXK" },
    { id: "SM-013", nama: "Per Versnelleng RXK", harga: 10000, qty: "1 Pcs", kategori: "Per Versnelleng", kendaraan: "RXK" },
    { id: "SM-014", nama: "Switch Rem Depan Terminal Supra", harga: 12500, qty: "1 Pcs", kategori: "Switch", kendaraan: "Supra" },
    { id: "SM-015", nama: "Switch Netral Grand", harga: 17500, qty: "1 Pcs", kategori: "Switch", kendaraan: "Grand" },
    { id: "SM-016", nama: "Switch Netral Tiger", harga: 17500, qty: "1 Pcs", kategori: "Switch", kendaraan: "Tiger" },
    { id: "SM-017", nama: "Tutup Magnit Grand (Hitam)", harga: 7500, qty: "1 Set 2 Pcs", kategori: "Tutup Magnit", kendaraan: "Grand" },
    { id: "SM-018", nama: "Tutup Magnit Supra (Silver)", harga: 7500, qty: "1 Set 2 Pcs", kategori: "Tutup Magnit", kendaraan: "Supra" },
    { id: "SM-019", nama: "Tutup Mesin Legenda (Plastik)", harga: 25000, qty: "1 Pcs", kategori: "Tutup Mesin", kendaraan: "Legenda" },
    { id: "SM-020", nama: "Tutup Mesin Smash/Shogun", harga: 25000, qty: "1 Pcs", kategori: "Tutup Mesin", kendaraan: "Smash/Shogun" },
    { id: "SM-021", nama: "Ring Komstir RC", harga: 5000, qty: "1 Pcs", kategori: "Lainnya", kendaraan: "RC" },
    { id: "SM-022", nama: "Tombol Klakson", harga: 5500, qty: "1 Pcs", kategori: "Lainnya", kendaraan: "Universal" },
];

// warna untuk modal edit, tambah, & preview
const OVERLAY_BG = "rgba(16, 24, 40, 0.5)";
const HEADING = "#101828";
const LABEL = "#344054";
const BORDER = "#D0D5DD";
const ACCENT = "#EE4D2D";

const EMPTY_FORM = {
    id: null,
    nama: "",
    harga: "",
    qty: "",
    kategori: "",
    kendaraan: "",
    gambar: null,
};

// id internal (stabil), dipakai untuk key/edit/gambar — bukan kode SM-xxx yang ditampilkan
function generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Urutkan alfabetis lalu beri nomor SM-001, SM-002, dst.
// Ini yang membuat kode selalu ngurut sesuai alfabet, walau produk baru
// disisipkan di tengah daftar (bukan cuma nambah di akhir).
function sortAlfabetis(list) {
    return [...list].sort((a, b) =>
        a.nama.localeCompare(b.nama, "id", { sensitivity: "base" })
    );
}

function formatKode(index) {
    return `SM-${String(index + 1).padStart(3, "0")}`;
}

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

    // state untuk pop up preview foto
    const [previewProduct, setPreviewProduct] = useState(null);

    // state untuk pop up tambah produk
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addForm, setAddForm] = useState(EMPTY_FORM);

    // Kode SM-xxx dihitung ulang tiap kali daftar produk berubah, berdasarkan
    // urutan alfabetis nama. Semua tempat yang butuh "kode" (grid, search,
    // pagination) pakai hasil dari sini, bukan field tetap di data mentah.
    const productsWithKode = useMemo(() => {
        return sortAlfabetis(products).map((p, idx) => ({
            ...p,
            kode: formatKode(idx),
        }));
    }, [products]);

    const categories = useMemo(
        () => [...new Set(products.map((p) => p.kategori))],
        [products]
    );

    const kendaraanOptions = useMemo(
        () => [...new Set(products.map((p) => p.kendaraan))].sort(),
        [products]
    );

    // Preview kode SM-xxx untuk form Tambah, dihitung live sesuai nama yang lagi diketik
    const previewAddKode = useMemo(() => {
        if (!addForm.nama || !addForm.nama.trim() || !addForm.id) return "—";
        const combined = [...products, { id: addForm.id, nama: addForm.nama }];
        const sorted = sortAlfabetis(combined);
        const idx = sorted.findIndex((p) => p.id === addForm.id);
        return formatKode(idx);
    }, [products, addForm.nama, addForm.id]);

    // Preview kode SM-xxx untuk form Edit, ikut update kalau nama diubah
    const previewEditKode = useMemo(() => {
        if (!editForm) return "";
        const others = products.filter((p) => p.id !== editForm.id);
        const combined = [...others, { id: editForm.id, nama: editForm.nama }];
        const sorted = sortAlfabetis(combined);
        const idx = sorted.findIndex((p) => p.id === editForm.id);
        return formatKode(idx);
    }, [products, editForm]);

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

    // ganti foto produk saat edit (preview via base64, disimpan di memory saja)
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
                p.id === editForm.id ? { ...editForm, harga: Number(editForm.harga) } : p
            )
        );
        setEditingProduct(null);
        setEditForm(null);
    };

    const closeEditModal = () => {
        setEditingProduct(null);
        setEditForm(null);
    };

    // buka pop up tambah produk — id internal dibuat sekali di sini,
    // kode SM-xxx-nya baru "muncul" otomatis setelah disimpan (lihat previewAddKode)
    const handleAddClick = () => {
        setAddForm({ ...EMPTY_FORM, id: generateId() });
        setIsAddOpen(true);
    };

    const handleAddFormChange = (field, value) => {
        setAddForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddPhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setAddForm((prev) => ({ ...prev, gambar: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();

        const newProduct = {
            id: addForm.id,
            nama: addForm.nama,
            harga: Number(addForm.harga) || 0,
            qty: addForm.qty,
            kategori: addForm.kategori,
            kendaraan: addForm.kendaraan,
            gambar: addForm.gambar,
        };

        setProducts((prev) => [...prev, newProduct]);
        setIsAddOpen(false);
        setAddForm(EMPTY_FORM);
    };

    const closeAddModal = () => {
        setIsAddOpen(false);
        setAddForm(EMPTY_FORM);
    };

    const filteredProducts = useMemo(() => {
        let result = productsWithKode;

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
        } else {
            // default: urutkan alfabetis berdasarkan nama produk
            result = [...result].sort((a, b) =>
                a.nama.localeCompare(b.nama, "id", { sensitivity: "base" })
            );
        }
        return result;
    }, [productsWithKode, keyword, activeCategory, selectedKendaraan, priceSort]);

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
                        <AddButton label="Tambah Produk" onClick={handleAddClick} />
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
                        <ProductGrid
                            products={paginatedProducts}
                            onEdit={handleEditClick}
                            onPreview={setPreviewProduct}
                        />

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
                                    src={editForm.gambar || FALLBACK_IMG(editForm.id)}
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
                                    Kode (otomatis, sesuai urutan alfabet)
                                </label>
                                <input
                                    type="text"
                                    value={previewEditKode}
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

            {/* Pop up tambah produk */}
            {isAddOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: OVERLAY_BG }}
                    onClick={closeAddModal}
                >
                    <div
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-lg font-semibold" style={{ color: HEADING }}>
                            Tambah Produk
                        </h2>

                        <form onSubmit={handleAddSubmit} className="flex flex-col gap-3">
                            {/* Foto produk */}
                            <div className="flex flex-col items-center gap-2">
                                <img
                                    src={addForm.gambar || FALLBACK_IMG(addForm.id || "new")}
                                    alt="Preview produk baru"
                                    className="h-28 w-28 rounded-md border object-cover"
                                    style={{ borderColor: BORDER }}
                                />
                                <label
                                    className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium"
                                    style={{ borderColor: BORDER, color: LABEL }}
                                >
                                    Upload Foto
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAddPhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Kode (otomatis, sesuai urutan alfabet)
                                </label>
                                <input
                                    type="text"
                                    value={previewAddKode}
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
                                    required
                                    value={addForm.nama}
                                    onChange={(e) => handleAddFormChange("nama", e.target.value)}
                                    placeholder="Contoh: Per Shock Breaker Grand"
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
                                    required
                                    value={addForm.harga}
                                    onChange={(e) => handleAddFormChange("harga", e.target.value)}
                                    placeholder="Contoh: 25000"
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
                                    required
                                    value={addForm.qty}
                                    onChange={(e) => handleAddFormChange("qty", e.target.value)}
                                    placeholder="Contoh: 1 Set 2 Pcs"
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
                                    required
                                    value={addForm.kategori}
                                    onChange={(e) => handleAddFormChange("kategori", e.target.value)}
                                    placeholder="Contoh: Per Shock Breaker"
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
                                    required
                                    value={addForm.kendaraan}
                                    onChange={(e) => handleAddFormChange("kendaraan", e.target.value)}
                                    placeholder="Contoh: Grand"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeAddModal}
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

            {/* Pop up preview foto (landscape: foto kiri, keterangan kanan) */}
            {previewProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: OVERLAY_BG }}
                    onClick={() => setPreviewProduct(null)}
                >
                    <div
                        className="flex w-full max-w-4xl overflow-hidden rounded-lg bg-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-1/2 shrink-0 bg-gray-100">
                            <img
                                src={previewProduct.gambar || FALLBACK_IMG(previewProduct.id)}
                                alt={previewProduct.nama}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex w-1/2 flex-col gap-2 p-8">
                            <span className="font-mono text-sm" style={{ color: "#B0B0B0" }}>
                                {previewProduct.kode}
                            </span>
                            <h3 className="text-2xl font-semibold" style={{ color: HEADING }}>
                                {previewProduct.nama}
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: ACCENT }}>
                                Rp {previewProduct.harga.toLocaleString("id-ID")}
                            </p>

                            <div className="mt-3 flex flex-col gap-2 text-base" style={{ color: LABEL }}>
                                <p>
                                    <span className="font-medium">Qty:</span> {previewProduct.qty}
                                </p>
                                <p>
                                    <span className="font-medium">Kategori:</span>{" "}
                                    {previewProduct.kategori}
                                </p>
                                <p>
                                    <span className="font-medium">Kendaraan:</span>{" "}
                                    {previewProduct.kendaraan}
                                </p>
                            </div>

                            <div className="mt-auto flex justify-end pt-6">
                                <button
                                    onClick={() => setPreviewProduct(null)}
                                    className="rounded-md border px-5 py-2.5 text-sm font-medium"
                                    style={{ borderColor: BORDER, color: LABEL }}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Katalog;