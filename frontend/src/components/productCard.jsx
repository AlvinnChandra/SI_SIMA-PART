import { FaPen, FaPlus, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import { COLOR, FONT_SANS, FONT_MONO } from "../constants/ui";
import { formatRupiah, getProductImage } from "../utils/productFormat";
import { getHargaFinal } from "../utils/diskonUtils";

// Satu-satunya definisi kartu produk di aplikasi.
// Sebelumnya katalog.jsx punya salinan inline sekitar 115 baris.
export default function ProductCard({
    product,
    onEdit,
    onDelete,
    onPreview,
    onAddToOrder,
    selectionMode = false,
    isSelected = false,
    onToggleSelect,
    onRemoveDiskon,
}) {
    const adaDiskon = product.diskon > 0;
    const hargaFinal = getHargaFinal(product);

    const handleCardClick = () => {
        if (selectionMode) {
            onToggleSelect?.(product);
        } else {
            onPreview?.(product);
        }
    };

    // Tombol-tombol kecil di pojok kartu punya pola yang sama:
    // hentikan bubbling, lalu panggil handler.
    const iconBtn = (key, Icon, color, handler, title) => (
        <button
            key={key}
            title={title}
            onClick={(e) => {
                e.stopPropagation();
                handler(product);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
        >
            <Icon size={12} color={color} />
        </button>
    );

    const hoverActions = [
        onEdit && iconBtn("edit", FaPen, COLOR.heading, onEdit, "Edit produk"),
        onDelete && iconBtn("delete", FaTrash, COLOR.accent, onDelete, "Hapus produk"),
        adaDiskon &&
            onRemoveDiskon &&
            iconBtn("undiskon", FaTimes, COLOR.accent, onRemoveDiskon, "Kembalikan harga semula"),
    ].filter(Boolean);

    return (
        <div
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-md border bg-white transition-shadow hover:shadow-md"
            style={{
                borderColor: selectionMode && isSelected ? COLOR.accent : COLOR.line,
                borderWidth: selectionMode && isSelected ? 2 : 1,
                fontFamily: FONT_SANS,
            }}
        >
            {/* gambar */}
            <div
                className="relative aspect-square w-full overflow-hidden bg-gray-100"
                onClick={handleCardClick}
            >
                <img
                    src={getProductImage(product)}
                    alt={product.nama}
                    className="h-full w-full object-cover"
                />

                {adaDiskon && (
                    <span
                        className="absolute right-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: COLOR.accent }}
                    >
                        -{product.diskon}%
                    </span>
                )}

                {selectionMode ? (
                    <span
                        className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border shadow"
                        style={{
                            borderColor: isSelected ? COLOR.accent : COLOR.border,
                            background: isSelected ? COLOR.accent : "rgba(255,255,255,0.9)",
                        }}
                    >
                        {isSelected && <FaCheck size={11} color="#fff" />}
                    </span>
                ) : (
                    <>
                        {hoverActions.length > 0 && (
                            <div className="absolute left-1.5 top-1.5 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                {hoverActions}
                            </div>
                        )}

                        {onAddToOrder && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToOrder(product);
                                }}
                                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
                            >
                                <FaPlus size={12} color={COLOR.heading} />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* teks: tinggi disamakan (flex-1) supaya harga selalu duduk
                di posisi yang sama meski nama produk 1 atau 2 baris */}
            <div className="flex flex-1 flex-col gap-1.5 p-3" onClick={handleCardClick}>
                <span
                    className="text-xs font-medium tracking-wide"
                    style={{ color: COLOR.muted, fontFamily: FONT_MONO }}
                >
                    {product.kode}
                </span>

                <p
                    className="line-clamp-2 text-sm font-medium"
                    style={{ color: COLOR.heading, lineHeight: "1.375", minHeight: "2.75em" }}
                >
                    {product.nama}
                </p>

                <div className="mt-auto flex flex-col gap-1">
                    {adaDiskon && (
                        <span className="text-xs line-through" style={{ color: COLOR.faint }}>
                            {formatRupiah(product.harga)}
                        </span>
                    )}
                    <p className="text-base font-bold" style={{ color: COLOR.accent }}>
                        {formatRupiah(hargaFinal)}
                    </p>

                    <div
                        className="flex items-center justify-center gap-1.5 text-center text-xs"
                        style={{ color: COLOR.body }}
                    >
                        <span>{product.keterangan}</span>
                        {product.terjual && (
                            <>
                                <span>•</span>
                                <span>{product.terjual} terjual</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}