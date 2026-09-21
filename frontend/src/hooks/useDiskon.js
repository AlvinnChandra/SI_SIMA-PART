import { useState } from "react";
import {
    hitungHargaSetelahDiskon,
    setDiskonForIds,
    removeDiskonForId,
    clearAllDiskon,
} from "../utils/diskonUtils";

// Seluruh state + handler mode "Atur Diskon".
// Dulu blok ini ada dua kali, sekitar 90 baris yang identik.
export default function useDiskon({ products, setProducts, filteredProducts, requestConfirm }) {
    const [diskonMode, setDiskonMode] = useState(false);
    const [diskonPersen, setDiskonPersen] = useState("");
    const [selectedForDiskon, setSelectedForDiskon] = useState([]);
    const [diskonError, setDiskonError] = useState("");

    const resetMode = () => {
        setDiskonMode(false);
        setSelectedForDiskon([]);
        setDiskonPersen("");
        setDiskonError("");
    };

    const bukaDiskonMode = () => {
        setDiskonMode(true);
        setSelectedForDiskon([]);
        setDiskonPersen("");
        setDiskonError("");
    };

    const toggleSelect = (product) => {
        setSelectedForDiskon((prev) =>
            prev.includes(product._id)
                ? prev.filter((id) => id !== product._id)
                : [...prev, product._id]
        );
    };

    // "Pilih Semua" mengacu ke seluruh produk sesuai filter aktif,
    // bukan cuma satu halaman.
    const isAllFilteredSelected =
        filteredProducts.length > 0 &&
        filteredProducts.every((p) => selectedForDiskon.includes(p._id));

    const toggleSelectAll = () => {
        setSelectedForDiskon(
            isAllFilteredSelected ? [] : filteredProducts.map((p) => p._id)
        );
    };

    const terapkanDiskon = () => {
        const persen = Number(diskonPersen);

        if (selectedForDiskon.length === 0) {
            setDiskonError("Pilih minimal 1 barang terlebih dahulu.");
            return;
        }
        if (!persen || persen <= 0 || persen > 100) {
            setDiskonError("Masukkan persen diskon yang valid (1 - 100).");
            return;
        }

        setDiskonError("");
        setDiskonForIds(selectedForDiskon, persen);

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
        resetMode();
    };

    // Kembalikan satu produk ke harga semula (tombol X di kartu).
    const hapusDiskon = (product) => {
        if (!product.diskon || product.diskon <= 0) return;

        requestConfirm({
            title: "Kembalikan Harga",
            message: `Kembalikan harga "${product.nama}" ke harga semula?`,
            onConfirm: () => {
                removeDiskonForId(product._id);
                setProducts((prev) =>
                    prev.map((p) =>
                        p._id === product._id
                            ? { ...p, diskon: 0, hargaSetelahDiskon: p.harga }
                            : p
                    )
                );
            },
        });
    };

    const resetSemuaDiskon = () => {
        if (!products.some((p) => p.diskon > 0)) return;

        requestConfirm({
            title: "Reset Semua Diskon",
            message:
                "Kembalikan SEMUA produk ke harga semula? Ini akan menghapus semua diskon yang sedang aktif.",
            onConfirm: () => {
                clearAllDiskon();
                setProducts((prev) =>
                    prev.map((p) => ({ ...p, diskon: 0, hargaSetelahDiskon: p.harga }))
                );
                resetMode();
            },
        });
    };

    return {
        diskonMode,
        diskonPersen,
        setDiskonPersen,
        selectedForDiskon,
        diskonError,
        isAllFilteredSelected,
        bukaDiskonMode,
        batalDiskonMode: resetMode,
        toggleSelect,
        toggleSelectAll,
        terapkanDiskon,
        hapusDiskon,
        resetSemuaDiskon,
    };
}