import { COLOR } from "../constants/ui";

// Toolbar mode "Atur Diskon". Tidak menyentuh database.
export default function DiskonToolbar({
    diskonPersen,
    onPersenChange,
    jumlahDipilih,
    isAllSelected,
    onToggleSelectAll,
    onTerapkan,
    onResetSemua,
    onBatal,
    error,
}) {
    const ghostBtn = "rounded-md border px-3 py-1.5 text-sm font-medium";

    return (
        <div
            className="mt-4 mb-4 flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ borderColor: COLOR.line, background: "#FFF9F5" }}
        >
            <span
                className="w-full text-sm font-medium sm:w-auto sm:flex-1"
                style={{ color: COLOR.label }}
            >
                Pilih barang di grid, lalu masukkan persen diskon:
            </span>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={onToggleSelectAll}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium"
                    style={{ borderColor: COLOR.border, color: COLOR.label }}
                >
                    {isAllSelected ? "Batal Pilih Semua" : "Pilih Semua"}
                </button>

                <input
                    type="number"
                    min="1"
                    max="100"
                    value={diskonPersen}
                    onChange={(e) => onPersenChange(e.target.value)}
                    placeholder="cth. 15"
                    className="w-24 rounded-md border px-2 py-1 text-sm"
                    style={{ borderColor: COLOR.border }}
                />
                <span className="text-sm" style={{ color: COLOR.muted }}>%</span>
                <span className="text-sm" style={{ color: COLOR.muted }}>
                    {jumlahDipilih} barang dipilih
                </span>

                <button
                    type="button"
                    onClick={onTerapkan}
                    className="rounded-md px-3 py-1.5 text-sm font-semibold text-white"
                    style={{ background: COLOR.accent }}
                >
                    Terapkan
                </button>
                <button
                    type="button"
                    onClick={onResetSemua}
                    className={ghostBtn}
                    style={{ borderColor: COLOR.border, color: COLOR.accent }}
                >
                    Reset Semua Diskon
                </button>
                <button
                    type="button"
                    onClick={onBatal}
                    className={ghostBtn}
                    style={{ borderColor: COLOR.border, color: COLOR.label }}
                >
                    Batal
                </button>
            </div>

            {error && (
                <span className="w-full text-xs" style={{ color: COLOR.accent }}>
                    {error}
                </span>
            )}
        </div>
    );
}