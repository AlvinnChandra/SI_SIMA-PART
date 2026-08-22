import { useState } from "react";
import "../css/searchBar.css";

function SearchBar({
    placeholder = "Cari produk...",
    onSearch,
}) {
    const [query, setQuery] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Kirim nilai pencarian secara realtime ke parent (opsional)
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(query);
        }
    };

    const handleClear = () => {
        setQuery("");
        if (onSearch) {
            onSearch("");
        }
    };

    return (
        <form className="sima-searchbar" onSubmit={handleSubmit}>

            <svg
                className="sima-searchbar__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
                type="text"
                className="sima-searchbar__input"
                placeholder={placeholder}
                value={query}
                onChange={handleChange}
            />

            {query && (
                <button
                    type="button"
                    className="sima-searchbar__clear"
                    onClick={handleClear}
                    aria-label="Hapus pencarian"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}

            <button type="submit" className="sima-searchbar__submit">
                Cari
            </button>

        </form>
    );
}

export default SearchBar;