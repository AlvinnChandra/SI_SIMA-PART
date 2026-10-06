import ModalShell from "./modalShell";
import { COLOR } from "../constants/ui";
import { formatRupiah, getProductImage } from "../utils/productFormat";
import { getHargaFinal } from "../utils/diskonUtils";

export default function ProductPreviewModal({ product, onClose }) {
    const adaDiskon = product.diskon > 0;

    const detail = [
        ["Keterangan", product.keterangan],
        ["Kategori", product.kategori],
        ["Kendaraan", (product.kendaraan || []).join(", ")],
    ];

    return (
        <ModalShell
            onClose={onClose}
            className="flex w-full max-w-4xl overflow-hidden"
        >
            <div className="w-1/2 shrink-0 bg-gray-100">
                <img
                    src={getProductImage(product)}
                    alt={product.nama}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="flex w-1/2 flex-col gap-2 p-8">
                <span className="font-mono text-sm" style={{ color: COLOR.faint }}>
                    {product.kode}
                </span>
                <h3 className="text-2xl font-semibold" style={{ color: COLOR.heading }}>
                    {product.nama}
                </h3>

                {adaDiskon && (
                    <div className="flex items-center gap-2">
                        <span className="text-base line-through" style={{ color: COLOR.faint }}>
                            {formatRupiah(product.harga)}
                        </span>
                        <span
                            className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            style={{ background: COLOR.accent }}
                        >
                            -{product.diskon}%
                        </span>
                    </div>
                )}

                <p className="text-2xl font-bold" style={{ color: COLOR.accent }}>
                    {formatRupiah(getHargaFinal(product))}
                </p>

                <div className="mt-3 flex flex-col gap-2 text-base" style={{ color: COLOR.label }}>
                    {detail.map(([label, value]) => (
                        <p key={label}>
                            <span className="font-medium">{label}:</span> {value}
                        </p>
                    ))}
                </div>

                <div className="mt-auto flex justify-end pt-6">
                    <button
                        onClick={onClose}
                        className="rounded-md border px-5 py-2.5 text-sm font-medium"
                        style={{ borderColor: COLOR.border, color: COLOR.label }}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}