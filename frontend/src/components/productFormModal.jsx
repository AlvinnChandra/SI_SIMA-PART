import { useId, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import ModalShell from "./modalShell";
import KendaraanMultiSelect from "./kendaraanMultiSelect";
import { COLOR } from "../constants/ui";
import { formatRupiah, onlyDigits, FALLBACK_IMG } from "../utils/productFormat";

const FIELD_NAMA = { name: "nama", label: "Nama Produk", placeholder: "Contoh: Per Shock Breaker Grand" };
const FIELD_HARGA = { name: "harga", label: "Harga", placeholder: "Rp 25.000", numeric: true };
const FIELD_KETERANGAN = { name: "keterangan", label: "Keterangan", placeholder: "Contoh: SET / PCS" };
const FIELD_KATEGORI = { name: "kategori", label: "Kategori", placeholder: "Contoh: Per Shock Breaker" };

const inputClass = "w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none";

function Field({ label, required, children }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: COLOR.label }}>
                {label}
                {required && <span style={{ color: COLOR.accent }}> *</span>}
            </label>
            {children}
        </div>
    );
}

export default function ProductFormModal({
    mode,            // "add" | "edit"
    product,         // hanya ada saat mode edit
    form,
    submitting,
    error,
    kendaraanOptions = [], // daftar model kendaraan yang sudah ada (dari useProductCatalog)
    onChangeField,
    onChangePhoto,
    onSubmit,
    onClose,
}) {
    const isEdit = mode === "edit";
    const formId = useId();

    // Escape untuk nutup modal, biar konsisten dengan pola modal lain di app.
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && !submitting) onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose, submitting]);

    const renderInput = (field) => (
        <input
            type="text"
            inputMode={field.numeric ? "numeric" : undefined}
            required={!isEdit}
            placeholder={field.placeholder}
            value={field.numeric ? formatRupiah(form[field.name]) : form[field.name]}
            onChange={(e) =>
                onChangeField(
                    field.name,
                    field.numeric ? onlyDigits(e.target.value) : e.target.value
                )
            }
            className={inputClass}
            style={{ borderColor: COLOR.border }}
            onFocus={(e) => (e.target.style.borderColor = COLOR.heading)}
            onBlur={(e) => (e.target.style.borderColor = COLOR.border)}
        />
    );

    return (
        <ModalShell
            onClose={onClose}
            className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden"
        >
            {/* header */}
            <div
                className="flex shrink-0 items-center justify-between border-b px-6 py-4"
                style={{ borderColor: COLOR.line }}
            >
                <h2 className="text-lg font-semibold" style={{ color: COLOR.heading }}>
                    {isEdit ? "Edit Produk" : "Tambah Produk"}
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                    style={{ color: COLOR.muted }}
                    aria-label="Tutup"
                >
                    <FaTimes size={14} />
                </button>
            </div>

            {/* body: ini yang scroll, header & footer tetap di tempat */}
            <form
                id={formId}
                onSubmit={onSubmit}
                className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
            >
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
                        className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
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
                        className={`${inputClass} cursor-not-allowed bg-gray-100 ${isEdit ? "" : "text-gray-400"}`}
                        style={{ borderColor: COLOR.border }}
                    />
                </Field>

                <Field label={FIELD_NAMA.label} required={!isEdit}>
                    {renderInput(FIELD_NAMA)}
                </Field>

                {/* Harga & Keterangan sejajar supaya form tidak terlalu panjang */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label={FIELD_HARGA.label} required={!isEdit}>
                        {renderInput(FIELD_HARGA)}
                    </Field>
                    <Field label={FIELD_KETERANGAN.label} required={!isEdit}>
                        {renderInput(FIELD_KETERANGAN)}
                    </Field>
                </div>

                <Field label={FIELD_KATEGORI.label} required={!isEdit}>
                    {renderInput(FIELD_KATEGORI)}
                </Field>

                <Field label="Kendaraan" required>
                    <KendaraanMultiSelect
                        options={kendaraanOptions}
                        selected={form.kendaraan || []}
                        onChange={(value) => onChangeField("kendaraan", value)}
                    />
                </Field>

                {error && (
                    <p className="text-xs" style={{ color: COLOR.accent }}>
                        {error}
                    </p>
                )}
            </form>

            {/* footer: nempel di bawah, ga ikut scroll bareng form */}
            <div
                className="flex shrink-0 justify-end gap-2 border-t px-6 py-4"
                style={{ borderColor: COLOR.line }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60"
                    style={{ borderColor: COLOR.border, color: COLOR.label }}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    form={formId}
                    disabled={submitting}
                    className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
                    style={{ background: COLOR.accent }}
                >
                    {submitting ? "Menyimpan..." : "Simpan"}
                </button>
            </div>
        </ModalShell>
    );
}