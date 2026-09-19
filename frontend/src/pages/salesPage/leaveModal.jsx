// ======================================================
// POPUP KONFIRMASI PINDAH HALAMAN
// Muncul kalau ada barang di pesanan dan user mengklik
// menu Katalog / History Order / DataToko di Header.
//
// Komponen ini murni presentational (tidak menyimpan
// state sendiri) - semua data & aksi dikirim lewat props
// dari PesananSales.jsx.
// ======================================================

function LeaveModal({
    show,
    pesananCount,
    tokoNama,
    onBatal,
    onLanjutTanpaSimpan,
    onSimpanDanLanjut
}) {

    if (!show) {
        return null;
    }

    return (

        <div className="leave-modal-overlay">

            <div className="leave-modal">

                <div className="leave-modal-icon">
                    ⚠️
                </div>

                <h3 className="leave-modal-title">
                    Pesanan Belum Disimpan
                </h3>

                <p className="leave-modal-text">
                    Ada{" "}
                    <strong>
                        {pesananCount} barang
                    </strong>{" "}
                    di pesanan untuk toko{" "}
                    <strong>
                        {tokoNama || "-"}
                    </strong>{" "}
                    yang belum disimpan sebagai draft.
                    Kalau pindah halaman sekarang, data ini
                    bisa hilang.
                </p>

                <div className="leave-modal-actions">

                    <button
                        type="button"
                        onClick={onBatal}
                        className="btn-secondary"
                    >
                        Batal, Tetap Disini
                    </button>

                    <button
                        type="button"
                        onClick={onLanjutTanpaSimpan}
                        className="btn-danger-outline"
                    >
                        Lanjut Tanpa Simpan
                    </button>

                    <button
                        type="button"
                        onClick={onSimpanDanLanjut}
                        className="btn-primary"
                    >
                        Simpan Draft & Lanjut
                    </button>

                </div>

            </div>

        </div>

    );
}


// ======================================================
// NOTIF MODAL
// Pengganti alert() & window.confirm() bawaan browser,
// supaya tampilannya konsisten dengan LeaveModal di atas
// (pakai class CSS yang sama, tidak perlu CSS tambahan).
//
// type "alert"   -> 1 tombol OK
// type "confirm" -> tombol Batal + tombol Ya (jalankan onConfirm)
//
// Cara pakai (dari komponen lain):
//   const [notif, setNotif] = useState(null);
//
//   setNotif({ type: "alert", message: "..." });
//   setNotif({ type: "confirm", message: "...", onConfirm: () => {...} });
//
//   <NotifModal notif={notif} onClose={() => setNotif(null)} />
// ======================================================

export function NotifModal({ notif, onClose }) {

    if (!notif) {
        return null;
    }

    const { type, message, onConfirm } = notif;

    function handleConfirm() {

        onClose();

        if (onConfirm) {
            onConfirm();
        }
    }

    return (

        <div className="leave-modal-overlay">

            <div className="leave-modal">

                <div className="leave-modal-icon">
                    {type === "confirm" ? "⚠️" : "ℹ️"}
                </div>

                <p
                    className="leave-modal-text"
                    style={{ marginBottom: 24 }}
                >
                    {message}
                </p>

                <div className="leave-modal-actions">

                    {type === "confirm" ? (

                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="btn-danger-outline"
                            >
                                Ya, Lanjutkan
                            </button>
                        </>

                    ) : (

                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-primary"
                        >
                            OK
                        </button>

                    )}

                </div>

            </div>

        </div>

    );
}


export default LeaveModal;