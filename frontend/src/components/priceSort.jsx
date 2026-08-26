const HEADING = "#101828";
const BODY = "#f3f4f6";
const ACCENT = "#EE4D2D";

const OPTIONS = [
    { value: "default", label: "Default" },
    { value: "asc", label: "Harga Terendah" },
    { value: "desc", label: "Harga Tertinggi" },
];

export default function PriceSort({ value, onChange }) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold" style={{ color: HEADING }}>
                Urutkan Harga
            </p>
            <div className="flex flex-col gap-1.5">
                {OPTIONS.map((opt) => (
                    <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                        style={{ color: BODY }}
                    >
                        <input
                            type="radio"
                            name="price-sort"
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                            className="h-3.5 w-3.5"
                            style={{ accentColor: ACCENT }}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
        </div>
    );
}