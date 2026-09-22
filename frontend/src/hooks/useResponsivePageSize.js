import { useState, useEffect } from "react";

// Breakpoint ini HARUS sinkron dengan class Tailwind di ProductGrid:
// grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
const BREAKPOINTS = [
    { minWidth: 1280, columns: 5 }, // xl
    { minWidth: 1024, columns: 4 }, // lg
    { minWidth: 640, columns: 3 },  // sm
    { minWidth: 0, columns: 2 },    // default
];

// Perkiraan tinggi 1 kartu produk (termasuk gap). Sesuaikan kalau layout
// ProductCard berubah signifikan (misal font/padding diubah).
const ESTIMATED_CARD_HEIGHT = 260;

// Tinggi yang "dipakai" elemen lain di atas grid (header, search bar,
// page-header-row, dsb) supaya sisa ruang yang dihitung lebih akurat.
const RESERVED_HEIGHT = 380;

function getColumns(width) {
    const bp = BREAKPOINTS.find((b) => width >= b.minWidth);
    return bp.columns;
}

function computePageSize(width, height) {
    const columns = getColumns(width);

    const availableHeight = Math.max(height - RESERVED_HEIGHT, ESTIMATED_CARD_HEIGHT);
    const rows = Math.max(2, Math.floor(availableHeight / ESTIMATED_CARD_HEIGHT));

    return columns * rows;
}

// Menghitung berapa produk yang pas mengisi satu layar penuh,
// mengikuti jumlah kolom grid DAN tinggi viewport (supaya portrait
// yang punya ruang vertikal lebih, dapat baris lebih banyak juga).
export default function useResponsivePageSize() {
    const [pageSize, setPageSize] = useState(() =>
        typeof window !== "undefined"
            ? computePageSize(window.innerWidth, window.innerHeight)
            : 10
    );

    useEffect(() => {
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setPageSize(computePageSize(window.innerWidth, window.innerHeight));
            }, 150);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    return pageSize;
}