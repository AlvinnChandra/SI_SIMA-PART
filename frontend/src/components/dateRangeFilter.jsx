import { useState } from "react";
import "../css/dateRangeFilter.css";

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function DateRangeFilter({
    onFilter,
    defaultStart = "",
    defaultEnd = todayISO(),
}) {
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [error, setError] = useState("");

    const handleApply = () => {
        if (startDate && endDate && startDate > endDate) {
            setError("Tanggal awal tidak boleh lebih besar dari tanggal akhir.");
            return;
        }

        setError("");

        if (onFilter) {
            onFilter({ startDate, endDate });
        }
    };

    const handleReset = () => {
        setStartDate("");
        setEndDate(todayISO());
        setError("");

        if (onFilter) {
            onFilter({ startDate: "", endDate: todayISO() });
        }
    };

    return (
        <div className="sima-date-filter">

            <div className="sima-date-filter__field">
                <label htmlFor="startDate">Dari Tanggal</label>
                <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>

            <span className="sima-date-filter__sep">—</span>

            <div className="sima-date-filter__field">
                <label htmlFor="endDate">Sampai Tanggal</label>
                <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            <div className="sima-date-filter__actions">
                <button
                    type="button"
                    className="sima-date-filter__apply"
                    onClick={handleApply}
                >
                    Terapkan
                </button>
                <button
                    type="button"
                    className="sima-date-filter__reset"
                    onClick={handleReset}
                >
                    Reset
                </button>
            </div>

            {error && (
                <p className="sima-date-filter__error">{error}</p>
            )}

        </div>
    );
}

export default DateRangeFilter;