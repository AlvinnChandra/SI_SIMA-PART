import ModalShell from "./modalShell";
import { COLOR } from "../constants/ui";
import { formatRupiah, onlyDigits, FALLBACK_IMG } from "../utils/productFormat";

// Definisi field ditulis sekali. Dulu lima blok <div><label><input> yang
// sama persis disalin dua kali (modal Tambah dan modal Edit).
const FIELDS = [
    { name: "nama", label: "Nama Produk", placeholder: "Contoh: Per Shock Breaker Grand" },
    { name: "harga", label: "Harga", placeholder: "Rp 25.000", numeric: true },
    { name: "keterangan", label: "Keterangan", placeholder: "Contoh: 1 Set 2 Pcs" },
    { name: "kategori", label: "Kategori", placeholder: "Contoh: Per Shock Breaker" },
    { name: "kendaraan", label: "Kendaraan", placeholder: "Contoh: Grand" },
];

function Field({ label, children }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: COLOR.label }}>
                {label}
            </label>
            {children}
        </div>
    );
}

const inputClass = "w-full rounded-md border px-3 py-2 text-sm";

export default function ProductFormModal({
    mode,            // "add" | "edit"
    product,         // hanya ada saat mode edit
    form,
    submitting,
    error,
    onChangeField,
    onChangePhoto,
    onSubmit,
    onClose,
}) {
    const isEdit = mode === "edit";

    return (
        <ModalShell
            onClose={onClose}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
            <div className="p-6">
                <h2 className="mb-4 text-lg font-semibold" style={{ color: COLOR.heading }}>
                    {isEdit ? "Edit Produk" : "Tambah Produk"}
                </h2>

                <form onSubmit={onSubmit} className="flex flex-col gap-3">
                    {/* foto */}
                    <div className="flex flex-col items-center gap-2">
                        {form.gambarPreview || isEdit ? (
                            <img
                                src={form.gambarPreview || FALLBACK_IMG(product?.nama)}
                                alt={form.nama || "Preview produk"}
                                className="h-28 w-28 rounded-md border object-cover"
                                style={{ borderColor: COLOR.border }}
                            />
                        ) : (
                            <div
                                className="flex h-28 w-28 items-center justify-center rounded-md border border-dashed px-2 text-center text-xs"
                                style={{ borderColor: COLOR.border, color: COLOR.faint }}
                            >
                                Belum ada foto
                            </div>
                        )}
                        <label
                            className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium"
                            style={{ borderColor: COLOR.border, color: COLOR.label }}
                        >
                            {isEdit ? "Ganti Foto" : "Upload Foto"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onChangePhoto(e.target.files[0])}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <Field label="Kode">
                        <input
                            type="text"
                            disabled
                            value={
                                isEdit
                                    ? product?.kode ?? ""
                                    : "Otomatis oleh sistem setelah disimpan"
                            }
                            className={`${inputClass} bg-gray-100 ${isEdit ? "" : "text-gray-400"}`}
                            style={{ borderColor: COLOR.border }}
                        />
                    </Field>

                    {FIELDS.map((field) => (
                        <Field key={field.name} label={field.label}>
                            <input
                                type="text"
                                inputMode={field.numeric ? "numeric" : undefined}
                                required={!isEdit}
                                placeholder={field.placeholder}
                                value={
                                    field.numeric
                                        ? formatRupiah(form[field.name])
                                        : form[field.name]
                                }
                                onChange={(e) =>
                                    onChangeField(
                                        field.name,
                                        field.numeric
                                            ? onlyDigits(e.target.value)
                                            : e.target.value
                                    )
                                }
                                className={inputClass}
                                style={{ borderColor: COLOR.border }}
                            />
                        </Field>
                    ))}

                    {error && (
                        <p className="text-xs" style={{ color: COLOR.accent }}>
                            {error}
                        </p>
                    )}

                    <div className="mt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-md border px-4 py-2 text-sm font-medium"
                            style={{ borderColor: COLOR.border, color: COLOR.label }}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                            style={{ background: COLOR.accent }}
                        >
                            {submitting ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </ModalShell>
    );
}