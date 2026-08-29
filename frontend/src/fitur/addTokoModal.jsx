import { useState, useEffect } from "react";
import "../css/tokoTable.css";

const emptyForm = { namaToko: "", alamat: "", noTelepon: "" };

function AddTokoModal({ isOpen, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);

    // reset form tiap kali modal dibuka
    useEffect(() => {
        if (isOpen) setForm(emptyForm);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="sima-table-modal-overlay" onClick={onClose} role="button" tabIndex={-1}>
            <div
                className="sima-table-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tambah-toko-title"
            >
                <div className="sima-table-modal__header">
                    <h3 id="tambah-toko-title">Tambah Data Toko</h3>
                    <button
                        type="button"
                        className="sima-table-modal__close"
                        onClick={onClose}
                        aria-label="Tutup"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="sima-table-modal__body">

                        <div className="sima-table-modal__field">
                            <label htmlFor="namaToko">Nama Toko</label>
                            <input
                                id="namaToko"
                                type="text"
                                value={form.namaToko}
                                onChange={(e) => handleChange("namaToko", e.target.value)}
                                required
                            />
                        </div>

                        <div className="sima-table-modal__field">
                            <label htmlFor="alamat">Alamat</label>
                            <textarea
                                id="alamat"
                                rows={2}
                                value={form.alamat}
                                onChange={(e) => handleChange("alamat", e.target.value)}
                                required
                            />
                        </div>

                        <div className="sima-table-modal__field">
                            <label htmlFor="noTelepon">No Telepon</label>
                            <input
                                id="noTelepon"
                                type="text"
                                value={form.noTelepon}
                                onChange={(e) => handleChange("noTelepon", e.target.value)}
                                required
                            />
                        </div>

                    </div>

                    <div className="sima-table-modal__footer">
                        <button
                            type="button"
                            className="sima-table-modal__btn sima-table-modal__btn--ghost"
                            onClick={onClose}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="sima-table-modal__btn sima-table-modal__btn--primary"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddTokoModal;