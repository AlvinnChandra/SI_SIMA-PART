import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import logoSima from "../assets/logoSima.png";
import ProfileModalSales from "./profileModalSales";
import "../css/headerSales.css";

const API_BASE_URL = "http://localhost:3000";

const menuItems = [
    { label: "Katalog", path: "/katalogSales" },
    { label: "Pesanan", path: "/pesananSales" },
    { label: "History Order", path: "/historyOrder" },
    { label: "DataToko", path: "/dataToko2" },
];

function getStoredUser() {
    const raw =
        localStorage.getItem("simaUser") || sessionStorage.getItem("simaUser");

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function updateStoredUser(updatedUser) {
    if (localStorage.getItem("simaUser")) {
        localStorage.setItem("simaUser", JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem("simaUser")) {
        sessionStorage.setItem("simaUser", JSON.stringify(updatedUser));
    }
}

function Header() {
    const navigate = useNavigate();

    const [user, setUser] = useState(getStoredUser());
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Nama lengkap dari data user yang tersimpan saat login
    const namaLengkap = user?.namaLengkap || "Sales";

    // Foto profil (kalau ada), diarahkan ke folder uploads backend
    const fotoProfil = user?.fotoProfile
        ? `${API_BASE_URL}/uploads/${user.fotoProfile}`
        : null;

    // Inisial untuk avatar fallback (kalau belum ada foto profil)
    const initial = namaLengkap.charAt(0).toUpperCase();

    const handleLogout = () => {
        // Bersihkan status login dari kedua storage
        localStorage.removeItem("simaToken");
        localStorage.removeItem("simaUser");
        sessionStorage.removeItem("simaToken");
        sessionStorage.removeItem("simaUser");

        navigate("/");
    };

    const handleProfileSaved = (updatedUser) => {
        setUser(updatedUser);
        updateStoredUser(updatedUser);
        setShowProfileModal(false);
    };

    return (
        <header className="sima-header">

            {/* ---------- LEFT: LOGO ---------- */}
            <div className="sima-header__brand">
                <img
                    src={logoSima}
                    alt="SIMA Motorcycle Parts"
                    className="sima-header__logo"
                />
            </div>

            {/* ---------- CENTER: MENU ---------- */}
            <nav className="sima-header__nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sima-header__nav-item ${isActive ? "sima-header__nav-item--active" : ""}`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* ---------- RIGHT: PROFILE ---------- */}
            <div className="sima-header__profile">

                <button
                    type="button"
                    className="sima-header__greeting sima-header__greeting--btn"
                    onClick={() => setShowProfileModal(true)}
                    title="Edit profil"
                >
                    <span className="sima-header__hi">Hi! Welcome</span>
                    <span className="sima-header__name">{namaLengkap}</span>
                </button>

                <button
                    type="button"
                    className="sima-header__avatar-btn"
                    onClick={() => setShowProfileModal(true)}
                    title="Edit profil"
                >
                    {fotoProfil ? (
                        <img
                            src={fotoProfil}
                            alt={`Foto profil ${namaLengkap}`}
                            className="sima-header__avatar sima-header__avatar--img"
                        />
                    ) : (
                        <div className="sima-header__avatar" aria-hidden="true">
                            {initial}
                        </div>
                    )}
                </button>

                <button
                    type="button"
                    className="sima-header__logout"
                    onClick={handleLogout}
                    aria-label="Keluar"
                    title="Keluar"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>

            </div>

            {showProfileModal && (
                <ProfileModalSales
                    currentUser={user}
                    onClose={() => setShowProfileModal(false)}
                    onSaved={handleProfileSaved}
                />
            )}

        </header>
    );
}

export default Header;