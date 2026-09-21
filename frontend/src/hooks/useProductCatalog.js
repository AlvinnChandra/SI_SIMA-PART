import { useState, useEffect, useMemo, useCallback } from "react";
import { getItems } from "../services/itemService";
import { applyStoredDiskon } from "../utils/diskonUtils";
import { PAGE_SIZE } from "../constants/ui";

// Semua logika data katalog: ambil dari API, filter, sort, pagination.
// Dulu blok ini ada dua kali dengan perbedaan kecil yang justru berbahaya
// (katalog.jsx punya sort alfabetis default, katalogContent.jsx tidak).
export default function useProductCatalog() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [selectedKendaraan, setSelectedKendaraan] = useState([]);
    const [priceSort, setPriceSort] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);

    const reload = useCallback(() => {
        setIsLoading(true);
        setLoadError(null);
        return getItems()
            .then((items) => setProducts(applyStoredDiskon(items)))
            .catch((err) => setLoadError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    const categories = useMemo(
        () => [...new Set(products.map((p) => p.kategori))],
        [products]
    );

    const kendaraanOptions = useMemo(
        () => [...new Set(products.map((p) => p.kendaraan))].sort(),
        [products]
    );

    const filteredProducts = useMemo(() => {
        let result = products;

        if (activeCategory !== "Semua") {
            result = result.filter((p) => p.kategori === activeCategory);
        }

        if (selectedKendaraan.length > 0) {
            result = result.filter((p) => selectedKendaraan.includes(p.kendaraan));
        }

        const q = keyword.trim().toLowerCase();
        if (q !== "") {
            result = result.filter(
                (p) =>
                    p.nama.toLowerCase().includes(q) ||
                    (p.kode || "").toLowerCase().includes(q)
            );
        }

        if (priceSort === "asc") {
            return [...result].sort((a, b) => a.harga - b.harga);
        }
        if (priceSort === "desc") {
            return [...result].sort((a, b) => b.harga - a.harga);
        }
        // default: alfabetis, mengikuti perilaku halaman katalog lama
        return [...result].sort((a, b) =>
            a.nama.localeCompare(b.nama, "id", { sensitivity: "base" })
        );
    }, [products, keyword, activeCategory, selectedKendaraan, priceSort]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, currentPage]);

    // Setiap ganti filter, balik ke halaman 1. Dulu ini empat handler
    // yang isinya sama persis di dua file.
    const makeFilterHandler = (setter) => (value) => {
        setter(value);
        setCurrentPage(1);
    };

    return {
        products,
        setProducts,
        isLoading,
        loadError,
        reload,

        keyword,
        activeCategory,
        selectedKendaraan,
        priceSort,
        currentPage,
        setCurrentPage,

        onSearch: makeFilterHandler(setKeyword),
        onSelectCategory: makeFilterHandler(setActiveCategory),
        onKendaraanChange: makeFilterHandler(setSelectedKendaraan),
        onPriceSortChange: makeFilterHandler(setPriceSort),

        categories,
        kendaraanOptions,
        filteredProducts,
        paginatedProducts,
        totalPages,
    };
}