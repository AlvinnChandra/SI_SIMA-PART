import { useState, useMemo, useEffect } from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import AddButton from "../components/AddButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import Pagination from "../components/pagination";
import CategoryList from "../components/categoryList";
import CheckboxFilter from "../components/checkboxFilter";
import PriceSort from "../components/priceSort";
import { getItems, createItem, updateItem, deleteItem } from "../services/itemService";
import {
    getLogo,
    drawPdfHeader,
    exportTablePdf,
    drawFooterAllPages,
    FOOTER_HEIGHT,
} from "../utils/pdfExport";
import { exportListExcel } from "../utils/excelExport";
import "../css/global.css";

const PAGE_SIZE = 10;

// Ubah nama produk jadi "seed" yang aman dipakai di URL.
function toSeed(nama) {
    return (nama || "produk")
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}

const FALLBACK_IMG = (nama) =>
    `https://picsum.photos/seed/${toSeed(nama)}/400/400`;

function formatRupiah(value) {
    if (value === "" || value === null || value === undefined) return "";
    const number = Number(value);
    if (Number.isNaN(number)) return "";
    return `Rp ${number.toLocaleString("id-ID")}`;
}

// Tentukan satuan dari teks keterangan.
// Kalau ada "1 Pcs" -> satuannya PCS, selain itu -> SET
function getSatuan(keterangan = "") {
    return /1\s*pcs/i.test(keterangan) ? "PCS" : "SET";
}

// Ubah gambar (URL/cross-origin) jadi base64 supaya bisa ditempel ke PDF
async function imageUrlToBase64(url) {
    try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) throw new Error("Gagal ambil gambar");
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch {
        return null; // gambar gagal diambil -> nanti digambar kotak kosong
    }
}

// warna untuk modal edit, tambah, & preview
const OVERLAY_BG = "rgba(16, 24, 40, 0.5)";
const HEADING = "#101828";
const LABEL = "#344054";
const BORDER = "#D0D5DD";
const ACCENT = "#EE4D2D";

const EMPTY_FORM = {
    nama: "",
    harga: "",
    keterangan: "",
    kategori: "",
    kendaraan: "",
    gambarFile: null,   // File asli yang dikirim ke server
    gambarPreview: null, // base64 hanya untuk preview di UI
};

function Katalog() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [selectedKendaraan, setSelectedKendaraan] = useState([]);
    const [priceSort, setPriceSort] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);

    // Ambil data produk dari API.
    useEffect(() => {
        getItems()
            .then(setProducts)
            .catch((err) => setLoadError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    // state untuk pop up edit — editingProduct menyimpan data asli dari server
    // (termasuk _id) yang dipakai sebagai kunci saat update/hapus
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState("");

    // state untuk pop up preview foto
    const [previewProduct, setPreviewProduct] = useState(null);

    // state untuk pop up tambah produk
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addForm, setAddForm] = useState(EMPTY_FORM);
    const [addSubmitting, setAddSubmitting] = useState(false);
    const [addError, setAddError] = useState("");

    // state untuk pop up konfirmasi hapus
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    // state untuk proses export PDF katalog (bisa lama karena banyak gambar)
    const [exportingKatalog, setExportingKatalog] = useState(false);

    // state untuk proses export Excel
    const [exportingExcel, setExportingExcel] = useState(false);

    // Produk diurutkan alfabetis hanya untuk tampilan (kode asli tetap
    // dari server / MongoDB, tidak dihitung ulang di sini)
    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) =>
            a.nama.localeCompare(b.nama, "id", { sensitivity: "base" })
        );
    }, [products]);

    const categories = useMemo(
        () => [...new Set(products.map((p) => p.kategori))],
        [products]
    );

    const kendaraanOptions = useMemo(
        () => [...new Set(products.map((p) => p.kendaraan))].sort(),
        [products]
    );

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

    // buka pop up edit — pakai data asli produk (dari server, punya _id)
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setEditForm({
            nama: product.nama,
            harga: String(product.harga),
            keterangan: product.keterangan || "",
            kategori: product.kategori,
            kendaraan: product.kendaraan,
            gambarFile: null,
            gambarPreview: product.gambar || null,
        });
        setEditError("");
    };

    const handleEditFormChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditHargaChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setEditForm((prev) => ({ ...prev, harga: raw }));
    };

    // ganti foto produk saat edit: simpan File asli + preview base64
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setEditForm((prev) => ({
                ...prev,
                gambarFile: file,
                gambarPreview: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditSubmitting(true);
        setEditError("");

        try {
            const fd = new FormData();
            fd.append("nama", editForm.nama);
            fd.append("harga", editForm.harga);
            fd.append("keterangan", editForm.keterangan);
            fd.append("kategori", editForm.kategori);
            fd.append("kendaraan", editForm.kendaraan);
            if (editForm.gambarFile) {
                fd.append("gambar", editForm.gambarFile);
            }

            const updated = await updateItem(editingProduct._id, fd);

            setProducts((prev) =>
                prev.map((p) => (p._id === editingProduct._id ? updated : p))
            );
            setEditingProduct(null);
            setEditForm(null);
        } catch (err) {
            setEditError(err.message || "Gagal menyimpan perubahan.");
        } finally {
            setEditSubmitting(false);
        }
    };

    const closeEditModal = () => {
        if (editSubmitting) return;
        setEditingProduct(null);
        setEditForm(null);
        setEditError("");
    };

    const handleDeleteClick = (product) => {
        setDeleteTarget(product);
    };

    const closeDeleteModal = () => {
        if (deleteSubmitting) return;
        setDeleteTarget(null);
    };

    const confirmDelete = async () => {
        setDeleteSubmitting(true);

        try {
            await deleteItem(deleteTarget._id);
            setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            alert(err.message || "Gagal menghapus produk.");
        } finally {
            setDeleteSubmitting(false);
        }
    };

    const handleAddClick = () => {
        setAddForm(EMPTY_FORM);
        setAddError("");
        setIsAddOpen(true);
    };

    const handleAddFormChange = (field, value) => {
        setAddForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddHargaChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setAddForm((prev) => ({ ...prev, harga: raw }));
    };

    // upload foto produk baru: simpan File asli + preview base64
    const handleAddPhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setAddForm((prev) => ({
                ...prev,
                gambarFile: file,
                gambarPreview: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setAddSubmitting(true);
        setAddError("");

        try {
            const fd = new FormData();
            fd.append("nama", addForm.nama);
            fd.append("harga", addForm.harga);
            fd.append("keterangan", addForm.keterangan);
            fd.append("kategori", addForm.kategori);
            fd.append("kendaraan", addForm.kendaraan);
            if (addForm.gambarFile) {
                fd.append("gambar", addForm.gambarFile);
            }

            const created = await createItem(fd);

            setProducts((prev) => [...prev, created]);
            setIsAddOpen(false);
            setAddForm(EMPTY_FORM);
        } catch (err) {
            setAddError(err.message || "Gagal menambahkan produk.");
        } finally {
            setAddSubmitting(false);
        }
    };

    const closeAddModal = () => {
        if (addSubmitting) return;
        setIsAddOpen(false);
        setAddForm(EMPTY_FORM);
        setAddError("");
    };

    const filteredProducts = useMemo(() => {
        let result = sortedProducts;

        result = activeCategory === "Semua"
            ? result
            : result.filter((p) => p.kategori === activeCategory);

        result = selectedKendaraan.length === 0
            ? result
            : result.filter((p) => selectedKendaraan.includes(p.kendaraan));

        const q = keyword.trim().toLowerCase();
        result = q === ""
            ? result
            : result.filter(
                (p) =>
                    p.nama.toLowerCase().includes(q) ||
                    (p.kode || "").toLowerCase().includes(q)
            );

        result =
            priceSort === "asc"
                ? [...result].sort((a, b) => a.harga - b.harga)
                : priceSort === "desc"
                    ? [...result].sort((a, b) => b.harga - a.harga)
                    : [...result].sort((a, b) =>
                        a.nama.localeCompare(b.nama, "id", { sensitivity: "base" })
                    );

        return result;
    }, [sortedProducts, keyword, activeCategory, selectedKendaraan, priceSort]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, currentPage]);

    // ---------- EXPORT 1: KATALOG (GRID FOTO, LANDSCAPE) ----------
    const handleExportKatalogPdf = async () => {
        if (!filteredProducts.length) {
            alert("Tidak ada produk untuk diexport.");
            return;
        }

        setExportingKatalog(true);
        try {
            const doc = new jsPDF("l", "mm", "a4"); // landscape
            const logo = await getLogo();

            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();

            const marginX = 14;
            const startY = 46;
            const cols = 5;
            const rows = 2;
            const perPage = cols * rows; // 10 barang per halaman

            const colGap = 3; // jarak antar kolom
            const rowGap = 5; // jarak antar baris card
            const gapAboveFooter = 6; // jarak antara card terakhir dengan garis footer

            const cellW = (pageW - marginX * 2) / cols;
            const cardW = cellW - colGap;

            // tinggi card mengisi ruang yang tersedia antara header dan footer,
            // supaya tidak ada space kosong besar di bawah
            const availableH = pageH - startY - FOOTER_HEIGHT - gapAboveFooter;
            const cardH = (availableH - rowGap * (rows - 1)) / rows;

            const imgPadding = 3;
            const textBlockH = 22; // ruang untuk kode + nama (maks 2 baris) + harga
            // gambar mengisi sisa tinggi card, tapi tetap dibatasi lebar card supaya persegi
            const imgSize = Math.min(
                cardW - imgPadding * 2,
                cardH - textBlockH - imgPadding - 3
            );

            const items = filteredProducts;

            for (let i = 0; i < items.length; i++) {
                const posInPage = i % perPage;

                if (posInPage === 0) {
                    if (i !== 0) doc.addPage();
                    drawPdfHeader(doc, logo, "Katalog Produk");
                }

                const col = posInPage % cols;
                const row = Math.floor(posInPage / cols);

                const cardX = marginX + col * cellW + colGap / 2;
                const cardY = startY + row * (cardH + rowGap);

                // Border card, meniru tampilan card produk di web
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.3);
                doc.rect(cardX, cardY, cardW, cardH);

                const product = items[i];
                const imgUrl = product.gambar || FALLBACK_IMG(product.nama);
                const base64 = await imageUrlToBase64(imgUrl);

                const imgX = cardX + (cardW - imgSize) / 2;
                const imgY = cardY + imgPadding;

                if (base64) {
                    try {
                        doc.addImage(base64, "JPEG", imgX, imgY, imgSize, imgSize);
                    } catch {
                        doc.setDrawColor(200);
                        doc.rect(imgX, imgY, imgSize, imgSize);
                    }
                } else {
                    doc.setDrawColor(200);
                    doc.rect(imgX, imgY, imgSize, imgSize);
                }

                // garis pemisah gambar & teks, seperti card di web
                const dividerY = imgY + imgSize + 3;
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.2);
                doc.line(cardX, dividerY, cardX + cardW, dividerY);

                const textY = dividerY + 4;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                doc.setTextColor(130);
                doc.text(product.kode || "-", cardX + cardW / 2, textY, { align: "center" });

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(20, 40, 110);
                const namaLines = doc.splitTextToSize(product.nama, cardW - 6).slice(0, 2);
                doc.text(namaLines, cardX + cardW / 2, textY + 4, { align: "center" });

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(210, 30, 40);
                doc.text(
                    `Rp ${product.harga.toLocaleString("id-ID")}`,
                    cardX + cardW / 2,
                    textY + 4 + namaLines.length * 3.5 + 3,
                    { align: "center" }
                );
            }

            // footer (garis + teks + nomor halaman di tengah bawah) di semua halaman
            drawFooterAllPages(doc);

            doc.save("katalog-produk.pdf");
        } catch (err) {
            alert(err.message || "Gagal membuat PDF katalog.");
        } finally {
            setExportingKatalog(false);
        }
    };

    // ---------- EXPORT 2: LIST PRODUK (TABEL SEDERHANA, PDF) ----------
    const handleExportListPdf = () => {
        const rows = filteredProducts.map((p) => ({
            nama: p.nama,
            harga: `Rp ${p.harga.toLocaleString("id-ID")}`,
            satuan: getSatuan(p.keterangan),
        }));

        exportTablePdf({
            title: "List Produk",
            data: rows,
            fields: [
                { key: "nama", label: "Nama Barang" },
                { key: "harga", label: "Harga" },
                { key: "satuan", label: "Satuan" },
            ],
            fileName: "list-produk.pdf",
        });
    };

    // ---------- EXPORT 3: LIST PRODUK (EXCEL) ----------
    const handleExportExcel = async () => {
        const rows = filteredProducts.map((p) => ({
            nama: p.nama,
            harga: `Rp ${p.harga.toLocaleString("id-ID")}`,
            satuan: getSatuan(p.keterangan),
        }));

        setExportingExcel(true);
        try {
            await exportListExcel({
                title: "List Produk",
                data: rows,
                fields: [
                    { key: "nama", label: "Nama Barang" },
                    { key: "harga", label: "Harga" },
                    { key: "satuan", label: "Satuan" },
                ],
                fileName: "list-produk.xlsx",
            });
        } catch (err) {
            alert(err.message || "Gagal membuat Excel.");
        } finally {
            setExportingExcel(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <main className="dashboard-content">
                <div className="page-header-row">
                    <h1>Katalog</h1>
                    <div className="page-header-actions">
                        <ExportExcelButton
                            label={exportingExcel ? "Memproses..." : "Export Excel"}
                            onClick={handleExportExcel}
                        />
                        <ExportPdfButton
                            label={exportingKatalog ? "Memproses..." : "Export PDF"}
                            options={[
                                { label: "Export Katalog (Foto)", onClick: handleExportKatalogPdf },
                                { label: "Export List (Tabel)", onClick: handleExportListPdf },
                            ]}
                        />
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
                        {isLoading && (
                            <p className="py-10 text-center text-sm text-gray-500">
                                Memuat produk...
                            </p>
                        )}

                        {!isLoading && loadError && (
                            <p className="py-10 text-center text-sm text-red-500">
                                {loadError}
                            </p>
                        )}

                        {!isLoading && !loadError && (
                            <>
                                {paginatedProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                                        <p className="text-sm" style={{ color: "#475467" }}>
                                            Tidak ada produk yang cocok.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                        {paginatedProducts.map((product) => (
                                            <div
                                                key={product._id}
                                                className="group flex cursor-pointer flex-col overflow-hidden rounded-sm border border-gray-200 bg-white transition-shadow hover:shadow-md"
                                            >
                                                <div
                                                    className="relative aspect-square w-full overflow-hidden bg-gray-100"
                                                    onClick={() => setPreviewProduct(product)}
                                                >
                                                    <img
                                                        src={product.gambar || FALLBACK_IMG(product.nama)}
                                                        alt={product.nama}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <div className="absolute left-1.5 top-1.5 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditClick(product);
                                                            }}
                                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
                                                        >
                                                            <FaPen size={12} color={HEADING} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(product);
                                                            }}
                                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
                                                        >
                                                            <FaTrash size={12} color={ACCENT} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1 p-2.5">
                                                    <span
                                                        className="font-mono text-xs font-medium tracking-wide"
                                                        style={{ color: "#667085" }}
                                                    >
                                                        {product.kode}
                                                    </span>

                                                    <p className="line-clamp-2 text-sm leading-snug" style={{ color: HEADING }}>
                                                        {product.nama}
                                                    </p>

                                                    <p className="text-base font-semibold" style={{ color: ACCENT }}>
                                                        Rp {product.harga.toLocaleString("id-ID")}
                                                    </p>

                                                    <div className="flex items-center justify-center text-xs" style={{ color: "#9E9E9E" }}>
                                                        <span>{product.keterangan}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </>
                        )}
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
                            <div className="flex flex-col items-center gap-2">
                                <img
                                    src={editForm.gambarPreview || FALLBACK_IMG(editingProduct.nama)}
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
                                    value={editingProduct.kode}
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
                                    type="text"
                                    inputMode="numeric"
                                    value={formatRupiah(editForm.harga)}
                                    onChange={handleEditHargaChange}
                                    placeholder="Rp 25.000"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Keterangan
                                </label>
                                <input
                                    type="text"
                                    value={editForm.keterangan}
                                    onChange={(e) => handleEditFormChange("keterangan", e.target.value)}
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

                            {editError && (
                                <p className="text-xs" style={{ color: ACCENT }}>
                                    {editError}
                                </p>
                            )}

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={editSubmitting}
                                    className="rounded-md border px-4 py-2 text-sm font-medium"
                                    style={{ borderColor: BORDER, color: LABEL }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSubmitting}
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                                    style={{ background: ACCENT }}
                                >
                                    {editSubmitting ? "Menyimpan..." : "Simpan"}
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
                            <div className="flex flex-col items-center gap-2">
                                {addForm.gambarPreview ? (
                                    <img
                                        src={addForm.gambarPreview}
                                        alt="Preview produk baru"
                                        className="h-28 w-28 rounded-md border object-cover"
                                        style={{ borderColor: BORDER }}
                                    />
                                ) : (
                                    <div
                                        className="flex h-28 w-28 items-center justify-center rounded-md border border-dashed px-2 text-center text-xs"
                                        style={{ borderColor: BORDER, color: "#98A2B3" }}
                                    >
                                        Belum ada foto
                                    </div>
                                )}
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
                                    Kode
                                </label>
                                <input
                                    type="text"
                                    value="Otomatis oleh sistem setelah disimpan"
                                    disabled
                                    className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm text-gray-400"
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
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={formatRupiah(addForm.harga)}
                                    onChange={handleAddHargaChange}
                                    placeholder="Rp 25.000"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium" style={{ color: LABEL }}>
                                    Keterangan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.keterangan}
                                    onChange={(e) => handleAddFormChange("keterangan", e.target.value)}
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

                            {addError && (
                                <p className="text-xs" style={{ color: ACCENT }}>
                                    {addError}
                                </p>
                            )}

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    disabled={addSubmitting}
                                    className="rounded-md border px-4 py-2 text-sm font-medium"
                                    style={{ borderColor: BORDER, color: LABEL }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addSubmitting}
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                                    style={{ background: ACCENT }}
                                >
                                    {addSubmitting ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pop up preview foto */}
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
                                src={previewProduct.gambar || FALLBACK_IMG(previewProduct.nama)}
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
                                    <span className="font-medium">Keterangan:</span> {previewProduct.keterangan}
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

            {/* Pop up konfirmasi hapus produk */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: OVERLAY_BG }}
                    onClick={closeDeleteModal}
                >
                    <div
                        className="w-full max-w-sm rounded-lg bg-white p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-2 text-lg font-semibold" style={{ color: HEADING }}>
                            Hapus Produk
                        </h2>
                        <p className="text-sm" style={{ color: LABEL }}>
                            Yakin mau hapus{" "}
                            <span className="font-semibold" style={{ color: HEADING }}>
                                {deleteTarget.nama}
                            </span>
                            ? Tindakan ini tidak bisa dibatalkan.
                        </p>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleteSubmitting}
                                className="rounded-md border px-4 py-2 text-sm font-medium"
                                style={{ borderColor: BORDER, color: LABEL }}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleteSubmitting}
                                className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                                style={{ background: ACCENT }}
                            >
                                {deleteSubmitting ? "Menghapus..." : "Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Katalog;