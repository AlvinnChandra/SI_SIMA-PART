import { FaPen, FaPlus, FaCheck } from "react-icons/fa";

const ACCENT = "#EE4D2D";
const ACCENT_BADGE_BG = "#FFD6BC";
const NAME = "#222222";
const META = "#9E9E9E";
const KODE = "#B0B0B0";

function formatRupiah(n) {
    return "Rp " + n.toLocaleString("id-ID");
}

export default function ProductCard({
    product,
    onEdit,
    onPreview,
    onAddToOrder,
    selectionMode = false,
    isSelected = false,
    onToggleSelect,
}) {
    const imageSrc = product.gambar || `https://picsum.photos/seed/${product.kode}/400/400`;
    const adaDiskon = product.diskon > 0;
    const hargaSetelahDiskon = adaDiskon
        ? Math.round(product.harga * (1 - product.diskon / 100))
        : product.harga;

    const handleCardClick = () => {
        if (selectionMode) {
            onToggleSelect?.(product);
        } else {
            onPreview?.(product);
        }
    };

    return (
        <div
            className="group flex cursor-pointer flex-col overflow-hidden rounded-sm border bg-white transition-shadow hover:shadow-md"
            style={{ borderColor: selectionMode && isSelected ? ACCENT : "#e5e7eb" }}
        >
            {/* image */}
            <div
                className="relative aspect-square w-full overflow-hidden bg-gray-100"
                onClick={handleCardClick}
            >
                <img
                    src={imageSrc}
                    alt={product.nama}
                    className="h-full w-full object-cover"
                />
                {adaDiskon && (
                    <span
                        className="absolute right-0 top-0 rounded-bl-md px-1.5 py-0.5 text-[11px] font-semibold"
                        style={{ background: ACCENT_BADGE_BG, color: ACCENT }}
                    >
                        Diskon {product.diskon}%
                    </span>
                )}

                {selectionMode ? (
                    <span
                        className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border bg-white/90 shadow"
                        style={{
                            borderColor: isSelected ? ACCENT : "#D0D5DD",
                            background: isSelected ? ACCENT : "rgba(255,255,255,0.9)",
                        }}
                    >
                        {isSelected && <FaCheck size={11} color="#fff" />}
                    </span>
                ) : (
                    <>
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(product);
                                }}
                                className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
                            >
                                <FaPen size={12} color={NAME} />
                            </button>
                        )}
                        {onAddToOrder && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToOrder(product);
                                }}
                                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
                            >
                                <FaPlus size={12} color={NAME} />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* text content */}
            <div className="flex flex-col gap-1 p-2.5">
                <span className="font-mono text-xs font-medium tracking-wide" style={{ color: "#667085" }}>
                    {product.kode}
                </span>

                <p className="line-clamp-2 text-sm leading-snug" style={{ color: NAME }}>
                    {product.nama}
                </p>

                {adaDiskon ? (
                    <div className="flex flex-col">
                        <span className="text-xs line-through" style={{ color: "#98A2B3" }}>
                            {formatRupiah(product.harga)}
                        </span>
                        <p className="text-base font-semibold" style={{ color: ACCENT }}>
                            {formatRupiah(hargaSetelahDiskon)}
                        </p>
                    </div>
                ) : (
                    <p className="text-base font-semibold" style={{ color: ACCENT }}>
                        {formatRupiah(product.harga)}
                    </p>
                )}

                <div className="flex items-center justify-center gap-1.5 text-xs text-center" style={{ color: META }}>
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
    );
}