import { useState, useMemo, useEffect } from "react";
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
import { getItems } from "../services/itemService";
import "../css/global.css";

const PAGE_SIZE = 8;

function Katalog() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [selectedKendaraan, setSelectedKendaraan] = useState([]);
    const [priceSort, setPriceSort] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        getItems()
            .then(setProducts)
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
                        {isLoading && <p className="py-10 text-center text-sm text-gray-500">Memuat produk...</p>}
                        {loadError && <p className="py-10 text-center text-sm text-red-500">{loadError}</p>}
                        {!isLoading && !loadError && (
                            <>
                                <ProductGrid products={paginatedProducts} />
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
        </div>
    );
}

export default Katalog;