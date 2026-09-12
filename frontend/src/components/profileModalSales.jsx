import { useState, useLayoutEffect } from "react";
import "../css/profileModal.css";

const API_BASE_URL = "http://localhost:3000/api";
const FILE_BASE_URL = "http://localhost:3000/uploads";

function getAuthToken() {
    return (
        localStorage.getItem("simaToken") || sessionStorage.getItem("simaToken")
    );
}

async function apiFetch(path, options = {}) {
    const token = getAuthToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body instanceof FormData
                ? {}
                : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan.");
    }

    return data;
}

function useLockBodyScroll() {
    useLayoutEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function ProfileModalSales({ currentUser, onClose, onSaved }) {
    useLockBodyScroll();

    const [namaLengkap, setNamaLengkap] = useState(currentUser?.namaLengkap || "");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Preview foto: URL data lokal (kalau ganti) atau foto lama dari server
    const [fotoPreview, setFotoPreview] = useState(
        currentUser?.fotoProfile
            ? `${FILE_BASE_URL}/${currentUser.fotoProfile}`
            : null
    );
    const [fotoFile, setFotoFile] = useState(null); // File asli utk dikirim ke backend

    const [errorMsg, setErrorMsg] = useState("");
    const [saving, setSaving] = useState(false);

    const initial = (namaLengkap || "S").charAt(0).toUpperCase();

    const handleFotoChange = async (file) => {
        if (!file) return;
        const dataUrl = await readFileAsDataUrl(file);
        setFotoPreview(dataUrl);
        setFotoFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const inginGantiPassword =
            oldPassword || newPassword || confirmPassword;

        if (inginGantiPassword) {
            if (!oldPassword || !newPassword || !confirmPassword) {
                setErrorMsg("Isi semua field password untuk menggantinya.");
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorMsg("Password baru dan konfirmasi tidak sama.");
                return;
            }

            if (newPassword.length < 6) {
                setErrorMsg("Password baru minimal 6 karakter.");
                return;
            }
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("namaLengkap", namaLengkap.trim());

            if (inginGantiPassword) {
                formData.append("oldPassword", oldPassword);
                formData.append("newPassword", newPassword);
            }

            if (fotoFile) {
                formData.append("fotoProfile", fotoFile);
            }

            const result = await apiFetch("/auth/profile", {
                method: "PUT",
                body: formData,
            });

            onSaved(result.user);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="sima-profile-modal-overlay"
            onClick={onClose}
            role="button"
            tabIndex={-1}
        >
            <div
                className="sima-profile-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-modal-title"
            >
                <div className="sima-profile-modal__header">
                    <h3 id="profile-modal-title">Edit Profil</h3>
                    <button
                        type="button"
                        className="sima-profile-modal__close"
                        onClick={onClose}
                        aria-label="Tutup"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="sima-profile-modal__body">

                        {/* ---------- FOTO PROFIL ---------- */}
                        <div className="sima-profile-modal__photo-row">
                            {fotoPreview ? (
                                <img
                                    src={fotoPreview}
                                    alt="Foto profil"
                                    className="sima-profile-modal__photo-preview"
                                />
                            ) : (
                                <div className="sima-profile-modal__photo-fallback">
                                    {initial}
                                </div>
                            )}

                            <label className="sima-profile-modal__photo-btn">
                                Ganti Foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) =>
                                        handleFotoChange(e.target.files?.[0])
                                    }
                                />
                            </label>
                        </div>

                        <div className="sima-profile-modal__field">
                            <label htmlFor="namaLengkap">Nama Lengkap</label>
                            <input
                                id="namaLengkap"
                                type="text"
                                value={namaLengkap}
                                onChange={(e) => setNamaLengkap(e.target.value)}
                                required
                            />
                        </div>

                        <div className="sima-profile-modal__divider">
                            Ganti Password <span>(opsional)</span>
                        </div>

                        <div className="sima-profile-modal__field">
                            <label htmlFor="oldPassword">Password Lama</label>
                            <input
                                id="oldPassword"
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Kosongkan jika tidak ganti password"
                            />
                        </div>

                        <div className="sima-profile-modal__field-row">
                            <div className="sima-profile-modal__field">
                                <label htmlFor="newPassword">Password Baru</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="sima-profile-modal__field">
                                <label htmlFor="confirmPassword">Konfirmasi Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {errorMsg && (
                            <p className="sima-profile-modal__error">{errorMsg}</p>
                        )}

                    </div>

                    <div className="sima-profile-modal__footer">
                        <button
                            type="button"
                            className="sima-profile-modal__btn sima-profile-modal__btn--ghost"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="sima-profile-modal__btn sima-profile-modal__btn--primary"
                            disabled={saving}
                        >
                            {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileModalSales;