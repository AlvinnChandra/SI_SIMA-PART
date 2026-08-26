const ACCENT = "#EE4D2D";
const ACCENT_BADGE_BG = "#FFD6BC";
const NAME = "#222222";
const META = "#9E9E9E";
const KODE = "#B0B0B0";

function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function ProductCard({ product }) {
    const imageSrc = product.gambar || `https://picsum.photos/seed/${product.kode}/400/400`;

    return (
        <div className="group flex cursor-pointer flex-col overflow-hidden rounded-sm border border-gray-200 bg-white transition-shadow hover:shadow-md">
            {/* image */}
            <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                <img
                    src={imageSrc}
                    alt={product.nama}
                    className="h-full w-full object-cover"
                />
                {product.diskon && (
                    <span
                        className="absolute right-0 top-0 rounded-bl-md px-1.5 py-0.5 text-[11px] font-semibold"
                        style={{ background: ACCENT_BADGE_BG, color: ACCENT }}
                    >
                        -{product.diskon}%
                    </span>
                )}
            </div>

            {/* text content */}
            <div className="flex flex-col gap-1 p-2.5">
                <span className="font-mono text-[10px] tracking-wide" style={{ color: KODE }}>
                    {product.kode}
                </span>

                <p className="line-clamp-2 text-sm leading-snug" style={{ color: NAME }}>
                    {product.nama}
                </p>

                <p className="text-base font-semibold" style={{ color: ACCENT }}>
                    {formatRupiah(product.harga)}
                </p>

                <div className="flex items-center justify-between text-xs" style={{ color: META }}>
                <span>{product.qty}</span>
                {product.terjual && <span>{product.terjual} terjual</span>}
                </div>
            </div>
        </div>
    );
}