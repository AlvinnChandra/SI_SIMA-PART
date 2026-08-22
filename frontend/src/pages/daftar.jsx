import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoSima from "../assets/logoSima.png";
import "../css/login.css";
import "../css/daftar.css";

function Daftar() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        namaLengkap: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        tempatLahir: "",
        tanggalLahir: "",
        nik: "",
        noTelepon: "",
        alamat: "",
    });

    const [files, setFiles] = useState({
        fotoKtp: null,
        fotoSimA: null,
        fotoSimC: null,
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

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;

        setFiles((prev) => ({
            ...prev,
            [name]: selectedFiles && selectedFiles[0] ? selectedFiles[0] : null,
        }));

        if (error) {
            setError("");
        }
    };

    const validate = () => {
        const wajib = [
            "namaLengkap",
            "username",
            "email",
            "password",
            "confirmPassword",
            "tempatLahir",
            "tanggalLahir",
            "nik",
            "noTelepon",
            "alamat",
        ];

        for (const field of wajib) {
            if (!form[field] || form[field].trim() === "") {
                return "Semua field wajib harus diisi.";
            }
        }

        if (form.password.length < 6) {
            return "Kata sandi minimal 6 karakter.";
        }

        if (form.password !== form.confirmPassword) {
            return "Konfirmasi kata sandi tidak cocok.";
        }

        if (!files.fotoKtp) {
            return "Foto KTP wajib diunggah.";
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

        // Simulasi proses pendaftaran
        setTimeout(() => {
            setLoading(false);

            console.log("Data pendaftaran:", form);
            console.log("File diunggah:", files);
            // nanti di sini logic buat kirim data + file ke backend

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
                            Daftarkan dirimu sebagai sales untuk mulai mengelola
                            pesanan onderdil motor SIMA.
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
                    className="sima-login__card sima-daftar__card"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <p className="sima-login__form-eyebrow">
                        Pendaftaran Sales
                    </p>

                    <h2 className="sima-login__title">
                        Buat Akun Baru
                    </h2>

                    <p className="sima-login__desc">
                        Lengkapi data di bawah ini untuk mendaftar sebagai sales SIMA.
                    </p>


                    {/* ---------- NAMA LENGKAP ---------- */}
                    <div className="sima-login__field">
                        <label className="sima-login__label" htmlFor="namaLengkap">
                            <span>Nama Lengkap <span className="sima-daftar__required">*</span></span>
                        </label>
                        <div className="sima-login__input-wrap">
                            <input
                                id="namaLengkap"
                                name="namaLengkap"
                                type="text"
                                placeholder="Nama lengkap sesuai KTP"
                                className="sima-login__input"
                                value={form.namaLengkap}
                                onChange={handleChange}
                            />
                        </div>
                    </div>


                    {/* ---------- USERNAME & EMAIL ---------- */}
                    <div className="sima-daftar__grid-2">
                        <div className="sima-login__field">
                            <label className="sima-login__label" htmlFor="username">
                                <span>Username <span className="sima-daftar__required">*</span></span>
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

                        <div className="sima-login__field">
                            <label className="sima-login__label" htmlFor="email">
                                <span>Email <span className="sima-daftar__required">*</span></span>
                            </label>
                            <div className="sima-login__input-wrap">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="sima-login__input"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>


                    {/* ---------- PASSWORD & CONFIRM PASSWORD ---------- */}
                    <div className="sima-daftar__grid-2">
                        <div className="sima-login__field">
                            <label className="sima-login__label" htmlFor="password">
                                <span>Kata Sandi <span className="sima-daftar__required">*</span></span>
                            </label>
                            <div className="sima-login__input-wrap">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="sima-login__input"
                                    value={form.password}
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

                        <div className="sima-login__field">
                            <label className="sima-login__label" htmlFor="confirmPassword">
                                <span>Konfirmasi Kata Sandi <span className="sima-daftar__required">*</span></span>
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
                        </div>
                    </div>


                    {/* ---------- TEMPAT & TANGGAL LAHIR ---------- */}
                    <div className="sima-daftar__grid-2">
                        <div className="sima-login__field">
                            <label className="sima-login__label" htmlFor="tempatLahir">
                                <span>Tempat Lahir <span className="sima-daftar__required">*</span></span>
                            </label>
                            <div className="sima-login__input-wrap">
                                <input
                                    id="tempatLahir"
                                    name="tempatLahir"
                                    type="text"
                                    placeholder="Kota kelahiran"
                                    className="sima-login__input"
                                    value={form.tempatLahir}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="sima-login__field">
                            <label className="sima-login__label" htmlFor="tanggalLahir">
                                <span>Tanggal Lahir <span className="sima-daftar__required">*</span></span>
                            </label>
                            <div className="sima-login__input-wrap">
                                <input
                                    id="tanggalLahir"
                                    name="tanggalLahir"
                                    type="date"
                                    className="sima-login__input"
                                    value={form.tanggalLahir}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>


                    {/* ---------- NIK & NO TELEPON ---------- */}
                    <div className="sima-daftar__grid-2">
                        <div className="sima-login__field">
                            <label className="sima-login__label" htmlFor="nik">
                                <span>NIK <span className="sima-daftar__required">*</span></span>
                            </label>
                            <div className="sima-login__input-wrap">
                                <input
                                    id="nik"
                                    name="nik"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={16}
                                    placeholder="16 digit NIK"
                                    className="sima-login__input"
                                    value={form.nik}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="sima-login__field">
                            <label className="sima-login__label" htmlFor="noTelepon">
                                <span>No Telepon <span className="sima-daftar__required">*</span></span>
                            </label>
                            <div className="sima-login__input-wrap">
                                <input
                                    id="noTelepon"
                                    name="noTelepon"
                                    type="tel"
                                    placeholder="08xx-xxxx-xxxx"
                                    className="sima-login__input"
                                    value={form.noTelepon}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>


                    {/* ---------- ALAMAT ---------- */}
                    <div className="sima-login__field">
                        <label className="sima-login__label" htmlFor="alamat">
                            <span>Alamat <span className="sima-daftar__required">*</span></span>
                        </label>
                        <div className="sima-login__input-wrap">
                            <textarea
                                id="alamat"
                                name="alamat"
                                rows={2}
                                placeholder="Alamat lengkap sesuai domisili"
                                className="sima-login__input sima-daftar__textarea"
                                value={form.alamat}
                                onChange={handleChange}
                            />
                        </div>
                    </div>


                    {/* ---------- UPLOAD DOKUMEN ---------- */}
                    <div className="sima-daftar__upload-group">

                        <FileUploadField
                            id="fotoKtp"
                            label="Upload KTP"
                            required
                            file={files.fotoKtp}
                            onChange={handleFileChange}
                        />

                        <FileUploadField
                            id="fotoSimA"
                            label="Upload SIM A"
                            file={files.fotoSimA}
                            onChange={handleFileChange}
                        />

                        <FileUploadField
                            id="fotoSimC"
                            label="Upload SIM C"
                            file={files.fotoSimC}
                            onChange={handleFileChange}
                        />

                    </div>


                    {/* Error */}
                    {error && (
                        <p className="sima-login__error-text">
                            {error}
                        </p>
                    )}


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

                            "Daftar"

                        )}

                    </button>


                    {/* ---------- LOGIN ---------- */}
                    <p className="sima-login__footer">
                        Sudah punya akun?{" "}
                        <Link to="/">
                            Masuk di sini!
                        </Link>
                    </p>


                    <p className="sima-login__meta">
                        SIMA MOTORCYCLE PARTS
                    </p>

                </form>

            </div>


            {/* ---------- POPUP REGISTRASI BERHASIL ---------- */}
            {showSuccess && (
                <div className="sima-daftar__modal-overlay">
                    <div className="sima-daftar__modal">

                        <div className="sima-daftar__modal-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        </div>

                        <h3 className="sima-daftar__modal-title">
                            Registrasi Berhasil!
                        </h3>

                        <p className="sima-daftar__modal-text">
                            Akun kamu berhasil didaftarkan. Aktivasi akun akan dihubungi
                            oleh tim admin melalui nomor WhatsApp yang telah kamu daftarkan.
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

function FileUploadField({ id, label, required = false, file, onChange }) {
    return (
        <div className="sima-daftar__upload-field">
            <label className="sima-login__label" htmlFor={id}>
                <span>{label} {required && <span className="sima-daftar__required">*</span>}</span>
            </label>

            <label htmlFor={id} className="sima-daftar__upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>{file ? file.name : "Pilih Foto"}</span>
            </label>

            <input
                id={id}
                name={id}
                type="file"
                accept="image/*"
                className="sima-daftar__upload-input"
                onChange={onChange}
            />
        </div>
    );
}

export default Daftar;