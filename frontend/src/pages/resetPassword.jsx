import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoSima from "../assets/logoSima.png";
import "../css/login.css";
import "../css/daftar.css";

function ResetPassword() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        usernameEmail: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const validate = () => {
        if (!form.usernameEmail.trim()) {
            return "Username atau email wajib diisi.";
        }

        if (!form.newPassword || form.newPassword.length < 6) {
            return "Kata sandi baru minimal 6 karakter.";
        }

        if (form.newPassword !== form.confirmPassword) {
            return "Konfirmasi kata sandi tidak cocok.";
        }

        return "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError("");

        // Simulasi proses reset password
        setTimeout(() => {
            setLoading(false);

            console.log("Reset password untuk:", form.usernameEmail);
            // nanti di sini logic buat kirim data ke backend

            setShowSuccess(true);
        }, 1200);
    };

    const closeSuccessAndGoLogin = () => {
        setShowSuccess(false);
        navigate("/");
    };

    return (
        <div className="sima-login">

            {/* ---------- LEFT: BRAND PANEL ---------- */}
            <div className="sima-login__brand">
                <div className="sima-login__hazard" />

                <svg
                    className="sima-login__gear"
                    viewBox="0 0 200 200"
                    aria-hidden="true"
                >
                    <path
                        fill="currentColor"
                        d="M100 20 L108 0 L92 0 Z M100 180 L108 200 L92 200 Z
                        M180 100 L200 108 L200 92 Z M20 100 L0 108 L0 92 Z"
                    />

                    <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="18"
                    />

                    <circle
                        cx="100"
                        cy="100"
                        r="28"
                        fill="currentColor"
                    />
                </svg>

                <div className="sima-login__brand-top">

                    <img
                        src={logoSima}
                        alt="SIMA Motorcycle Parts"
                        className="sima-login__logo"
                    />

                    <p className="sima-login__eyebrow">
                        Portal Admin &amp; Sales
                    </p>

                    <center>
                        <h1 className="sima-login__headline">
                            <span className="headline-yellow">Suku cadang tepat,</span>
                            <span> dan terpercaya.</span>
                        </h1>
                    </center>

                    <center>
                        <p className="sima-login__sub">
                            Atur ulang kata sandi kamu untuk kembali mengakses
                            akun SIMA dengan aman.
                        </p>
                    </center>

                </div>

                <div className="sima-login__stats">
                    {/* Statistik dapat ditambahkan di sini */}
                </div>
            </div>


            {/* ---------- RIGHT: FORM PANEL ---------- */}
            <div className="sima-login__form-side">

                <form
                    className="sima-login__card"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <p className="sima-login__form-eyebrow">
                        Reset Kata Sandi
                    </p>

                    <h2 className="sima-login__title">
                        Lupa Kata Sandi?
                    </h2>

                    <p className="sima-login__desc">
                        Masukkan username/email kamu dan buat kata sandi baru.
                    </p>


                    {/* ---------- USERNAME / EMAIL ---------- */}
                    <div
                        className={`sima-login__field ${error ? "sima-login__field--error" : ""
                            }`}
                    >
                        <label className="sima-login__label" htmlFor="usernameEmail">
                            Username / Email
                        </label>

                        <div className="sima-login__input-wrap">
                            <input
                                id="usernameEmail"
                                name="usernameEmail"
                                type="text"
                                autoComplete="username"
                                placeholder="nama pengguna atau email"
                                className="sima-login__input"
                                value={form.usernameEmail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>


                    {/* ---------- NEW PASSWORD ---------- */}
                    <div
                        className={`sima-login__field ${error ? "sima-login__field--error" : ""
                            }`}
                    >
                        <label className="sima-login__label" htmlFor="newPassword">
                            Kata Sandi Baru
                        </label>

                        <div className="sima-login__input-wrap">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                className="sima-login__input"
                                value={form.newPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="sima-login__icon-btn"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={
                                    showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                                }
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                    </div>


                    {/* ---------- CONFIRM PASSWORD ---------- */}
                    <div
                        className={`sima-login__field ${error ? "sima-login__field--error" : ""
                            }`}
                    >
                        <label className="sima-login__label" htmlFor="confirmPassword">
                            Konfirmasi Kata Sandi Baru
                        </label>

                        <div className="sima-login__input-wrap">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                className="sima-login__input"
                                value={form.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="sima-login__icon-btn"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                aria-label={
                                    showConfirmPassword
                                        ? "Sembunyikan konfirmasi kata sandi"
                                        : "Tampilkan konfirmasi kata sandi"
                                }
                            >
                                <EyeIcon open={showConfirmPassword} />
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="sima-login__error-text">
                                {error}
                            </p>
                        )}
                    </div>


                    {/* ---------- SUBMIT BUTTON ---------- */}
                    <button
                        type="submit"
                        className="sima-login__submit"
                        disabled={loading}
                    >

                        {loading ? (

                            <>
                                <svg
                                    className="sima-login__submit-gear"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
                                    <path d="M21 12a9 9 0 0 0-9-9" />
                                </svg>
                                Memproses...
                            </>

                        ) : (

                            "Reset Kata Sandi"

                        )}

                    </button>


                    {/* ---------- BACK TO LOGIN ---------- */}
                    <p className="sima-login__footer">
                        Sudah ingat kata sandi?{" "}
                        <Link to="/">
                            Masuk di sini!
                        </Link>
                    </p>


                    <p className="sima-login__meta">
                        SIMA MOTORCYCLE PARTS
                    </p>

                </form>

            </div>


            {/* ---------- POPUP RESET BERHASIL ---------- */}
            {showSuccess && (
                <div className="sima-daftar__modal-overlay">
                    <div className="sima-daftar__modal">

                        <div className="sima-daftar__modal-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        </div>

                        <h3 className="sima-daftar__modal-title">
                            Reset Password Berhasil!
                        </h3>

                        <p className="sima-daftar__modal-text">
                            Kata sandi kamu berhasil diperbarui. Silakan masuk
                            kembali menggunakan kata sandi baru.
                        </p>

                        <button
                            type="button"
                            className="sima-login__submit"
                            onClick={closeSuccessAndGoLogin}
                        >
                            Kembali ke Halaman Masuk
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

function EyeIcon({ open }) {
    if (open) {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
        );
    }

    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export default ResetPassword;