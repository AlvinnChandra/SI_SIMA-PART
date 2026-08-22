import { useState } from "react";
import Modal from "../components/modal";

function AddTokoModal({ isOpen, onClose, onSave }) {
    const [form, setForm] = useState({
        namaToko: "",
        alamat: "",
        noTelepon: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!form.namaToko.trim()) {
            newErrors.namaToko = "Nama toko wajib diisi.";
        }
        if (!form.alamat.trim()) {
            newErrors.alamat = "Alamat wajib diisi.";
        }
        if (!form.noTelepon.trim()) {
            newErrors.noTelepon = "No telepon wajib diisi.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        if (onSave) {
            onSave(form);
        }

        // Reset form & tutup modal
        setForm({ namaToko: "", alamat: "", noTelepon: "" });
        onClose();
    };

    const handleClose = () => {
        setForm({ namaToko: "", alamat: "", noTelepon: "" });
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Toko">
            <form onSubmit={handleSubmit}>

                <div className="sima-modal__field">
                    <label className="sima-modal__label" htmlFor="namaToko">
                        Nama Toko
                    </label>
                    <input
                        id="namaToko"
                        name="namaToko"
                        type="text"
                        className="sima-modal__input"
                        placeholder="Masukkan nama toko"
                        value={form.namaToko}
                        onChange={handleChange}
                    />
                    {errors.namaToko && (
                        <p className="sima-modal__error-text">{errors.namaToko}</p>
                    )}
                </div>

                <div className="sima-modal__field">
                    <label className="sima-modal__label" htmlFor="alamat">
                        Alamat
                    </label>
                    <textarea
                        id="alamat"
                        name="alamat"
                        className="sima-modal__textarea"
                        placeholder="Masukkan alamat lengkap toko"
                        value={form.alamat}
                        onChange={handleChange}
                    />
                    {errors.alamat && (
                        <p className="sima-modal__error-text">{errors.alamat}</p>
                    )}
                </div>

                <div className="sima-modal__field">
                    <label className="sima-modal__label" htmlFor="noTelepon">
                        No Telepon
                    </label>
                    <input
                        id="noTelepon"
                        name="noTelepon"
                        type="tel"
                        className="sima-modal__input"
                        placeholder="Contoh: 0812xxxxxxx"
                        value={form.noTelepon}
                        onChange={handleChange}
                    />
                    {errors.noTelepon && (
                        <p className="sima-modal__error-text">{errors.noTelepon}</p>
                    )}
                </div>

                <div className="sima-modal__footer">
                    <button
                        type="button"
                        className="sima-modal__btn-cancel"
                        onClick={handleClose}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="sima-modal__btn-save"
                    >
                        Simpan
                    </button>
                </div>

            </form>
        </Modal>
    );
}

export default AddTokoModal;