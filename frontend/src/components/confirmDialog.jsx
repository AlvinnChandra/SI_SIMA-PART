import ModalShell from "./modalShell";
import { COLOR } from "../constants/ui";

// Satu komponen untuk semua konfirmasi: reset diskon, kembalikan harga,
// dan hapus produk. Dulu JSX-nya ada tiga salinan.
export default function ConfirmDialog({
    title = "Konfirmasi",
    message,
    confirmLabel = "OK",
    cancelLabel = "Batal",
    loading = false,
    onConfirm,
    onClose,
}) {
    return (
        <ModalShell onClose={onClose}>
            <div className="p-6">
                <h2 className="mb-2 text-lg font-semibold" style={{ color: COLOR.heading }}>
                    {title}
                </h2>
                <p className="text-sm" style={{ color: COLOR.label }}>
                    {message}
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-md border px-4 py-2 text-sm font-medium"
                        style={{ borderColor: COLOR.border, color: COLOR.label }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                        style={{ background: COLOR.accent }}
                    >
                        {loading ? "Memproses..." : confirmLabel}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}