import { useState } from "react";
import logoSima from "../assets/logoSima.png";
import "../css/login.css";

function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.username || !form.password) {
            setError("Username dan kata sandi wajib diisi.");
            return;
        }

        setLoading(true);
        setError("");

        // TODO: ganti dengan pemanggilan API autentikasi yang sebenarnya
        setTimeout(() => {
            setLoading(false);
            console.log("Login submitted:", { ...form, remember });
        }, 1200);
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
                    <circle cx="100" cy="100" r="28" fill="currentColor" />
                </svg>

                <div className="sima-login__brand-top">
                    <img src={logoSima} alt="SIMA Motorcycle Parts" className="sima-login__logo" />
                    <p className="sima-login__eyebrow">Portal Admin &amp; Sales</p>
                    <center><h1 className="sima-login__headline">
                        Suku cadang tepat, <span> dan terpercaya.</span>
                    </h1>
                    </center>
                    <center>
                        <p className="sima-login__sub">
                            Masuk untuk mengakses katalog dan mengelola pesanan
                            lengkap onderdil motor SIMA.
                        </p>
                    </center>
                </div>

                <div className="sima-login__stats">
                    {/* <div>
                        <span className="sima-login__stat-num">2.500+</span>
                        <span className="sima-login__stat-label">SKU Onderdil</span>
                    </div>
                    <div>
                        <span className="sima-login__stat-num">120+</span>
                        <span className="sima-login__stat-label">Kota Distribusi</span>
                    </div>
                    <div>
                        <span className="sima-login__stat-num">24/7</span>
                        <span className="sima-login__stat-label">Dukungan Mitra</span>
                    </div> */}
                </div>
            </div>

            {/* ---------- RIGHT: FORM PANEL ---------- */}
            <div className="sima-login__form-side">
                <form className="sima-login__card" onSubmit={handleSubmit} noValidate>
                    <p className="sima-login__form-eyebrow">Akses Akun</p>
                    <h2 className="sima-login__title">Selamat Datang</h2>
                    <p className="sima-login__desc">
                        Masukkan Akun Anda untuk melanjutkan ke dashboard SIMA.
                    </p>

                    <div className={`sima-login__field ${error ? "sima-login__field--error" : ""}`}>
                        <label className="sima-login__label" htmlFor="username">
                            Username / Email
                        </label>
                        <div className="sima-login__input-wrap">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                placeholder="nama pengguna"
                                className="sima-login__input"
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={`sima-login__field ${error ? "sima-login__field--error" : ""}`}>
                        <label className="sima-login__label" htmlFor="password">
                            Kata Sandi
                            {/* <button type="button" className="sima-login__forgot">
                                Lupa kata sandi?
                            </button> */}
                        </label>
                        <div className="sima-login__input-wrap">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="sima-login__input"
                                value={form.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="sima-login__icon-btn"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {error && <p className="sima-login__error-text">{error}</p>}
                    </div>

                    <div className="sima-login__row">
                        <input
                            id="remember"
                            type="checkbox"
                            className="sima-login__checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <label htmlFor="remember">Ingat saya di perangkat ini</label>
                    </div>

                    <button type="submit" className="sima-login__submit" disabled={loading}>
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
                            "Masuk"
                        )}
                    </button>

                    <div className="sima-login__divider">
                        <span>Butuh Bantuan</span>
                    </div>

                    <p className="sima-login__footer">
                        Belum punya akun?{" "}
                        <a href="#daftar">Hubungi tim SIMA</a>
                    </p>

                    <p className="sima-login__meta">SIMA MOTORCYCLE PARTS</p>
                </form>
            </div>
        </div>
    );
}

export default Login;