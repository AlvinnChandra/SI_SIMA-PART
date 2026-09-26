import { useState, useRef, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { COLOR } from "../constants/ui";

// Dua mode:
// - "select": cari & pilih dari kendaraan yang sudah ada. Item yang dipilih
//   tampil sebagai chip di dalam kotak, dan tetap muncul di dropdown dengan
//   tanda centang (bukan hilang dari daftar) supaya gampang di-toggle.
// - "addNew": ketik beberapa kendaraan baru sekaligus, dipisah koma, lalu
//   "Tambahkan" untuk memasukkan semuanya sebagai chip baru.
export default function KendaraanMultiSelect({ options = [], selected = [], onChange }) {
    const [mode, setMode] = useState("select"); // "select" | "addNew"
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [newText, setNewText] = useState("");
    const wrapperRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Dropdown-nya position: absolute, jadi tidak ikut dihitung tinggi wrapper
    // dan tidak otomatis kena auto-scroll bawaan browser. Begitu terbuka,
    // paksa scroll body form supaya dropdown-nya langsung kelihatan.
    useEffect(() => {
        if (isOpen) {
            dropdownRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }, [isOpen]);

    const toggleKendaraan = (item) => {
        if (selected.includes(item)) {
            onChange(selected.filter((k) => k !== item));
        } else {
            onChange([...selected, item]);
        }
    };

    const removeKendaraan = (item) => {
        onChange(selected.filter((k) => k !== item));
    };

    const q = query.trim().toLowerCase();
    const filteredOptions = q
        ? options.filter((opt) => opt.toLowerCase().includes(q))
        : options;

    const commitNewKendaraan = () => {
        const items = newText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        if (items.length === 0) return;

        const merged = [...selected];
        items.forEach((item) => {
            if (!merged.includes(item)) merged.push(item);
        });
        onChange(merged);
        setNewText("");
        setMode("select");
    };

    if (mode === "addNew") {
        return (
            <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" style={{ color: COLOR.label }}>
                    Kendaraan Baru (pisahkan dengan koma)
                </label>
                <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="cth: Grand, Supra, Beat"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{ borderColor: COLOR.border }}
                    autoFocus
                />
                <div className="flex justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setNewText("");
                            setMode("select");
                        }}
                        className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
                        style={{ borderColor: COLOR.border, color: COLOR.label }}
                    >
                        Pakai Kendaraan yang Ada
                    </button>
                    <button
                        type="button"
                        onClick={commitNewKendaraan}
                        className="rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                        style={{ background: COLOR.accent }}
                    >
                        Tambahkan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="relative flex flex-col gap-2">
            <div
                className="flex flex-wrap items-center gap-1.5 rounded-md border px-2.5 py-2 transition-colors"
                style={{ borderColor: isOpen ? COLOR.heading : COLOR.border }}
                onClick={() => setIsOpen(true)}
            >
                {selected.map((item) => (
                    <span
                        key={item}
                        className="flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-1.5 text-xs font-medium"
                        style={{ background: COLOR.line, color: COLOR.heading }}
                    >
                        {item}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeKendaraan(item);
                            }}
                            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none transition-colors hover:text-white"
                            style={{ color: COLOR.muted }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = COLOR.accent)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            aria-label={`Hapus ${item}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selected.length === 0 ? "Cari model kendaraan..." : ""}
                    className="min-w-[100px] flex-1 border-0 py-0.5 text-sm outline-none"
                />
            </div>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg"
                    style={{ borderColor: COLOR.border }}
                >
                    {filteredOptions.length === 0 && (
                        <p className="px-3 py-2 text-xs" style={{ color: COLOR.faint }}>
                            {options.length === 0
                                ? "Belum ada model kendaraan."
                                : "Tidak ada yang cocok."}
                        </p>
                    )}
                    {filteredOptions.map((opt) => {
                        const isSelected = selected.includes(opt);
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => toggleKendaraan(opt)}
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors"
                                style={{
                                    background: isSelected ? COLOR.accent : "transparent",
                                    color: isSelected ? "#fff" : COLOR.label,
                                }}
                            >
                                {opt}
                                {isSelected && <FaCheck size={11} />}
                            </button>
                        );
                    })}
                </div>
            )}

            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setMode("addNew")}
                    className="self-start rounded-md border border-dashed px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ borderColor: COLOR.accent, color: COLOR.accent }}
                >
                    + Tambah Kendaraan Baru
                </button>
            )}
        </div>
    );
}