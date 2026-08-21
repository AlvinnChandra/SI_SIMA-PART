import { useNavigate, NavLink } from "react-router-dom";
import logoSima from "../assets/logoSima.png";
import "../css/header.css";

const menuItems = [
    { label: "Katalog", path: "/katalog" },
    { label: "Orderan Masuk", path: "/order" },
    { label: "Data Toko", path: "/dataToko" },
    { label: "Data Sales", path: "/dataSales" },
    { label: "Laporan Order Per Sales", path: "/orderSales" },
];

function Header() {
    const navigate = useNavigate();

    // Ambil username yang disimpan saat login (lihat Login.jsx)
    const username =
        localStorage.getItem("simaUsername") ||
        sessionStorage.getItem("simaUsername") ||
        "Admin";

    // Inisial untuk avatar fallback (jika belum ada foto profil)
    const initial = username.charAt(0).toUpperCase();

    const handleLogout = () => {
        // Bersihkan status login dari kedua storage
        localStorage.removeItem("simaLogin");
        localStorage.removeItem("simaUsername");
        sessionStorage.removeItem("simaLogin");
        sessionStorage.removeItem("simaUsername");

        navigate("/");
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

                <div className="sima-header__greeting">
                    <span className="sima-header__hi">Hi! Welcome</span>
                    <span className="sima-header__name">{username}</span>
                </div>

                <div className="sima-header__avatar" aria-hidden="true">
                    {initial}
                </div>

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

        </header>
    );
}

export default Header;