import { COLOR, FONT_SANS } from "../constants/ui";

const ALL_LABEL = "Semua";

export default function CategoryList({
    categories = [],
    activeCategory,
    onSelectCategory,
}) {
    // "Lainnya" selalu di paling bawah, sisanya alfabetis.
    const sortedCategories = [...categories].sort((a, b) => {
        if (a.toLowerCase() === "lainnya") return 1;
        if (b.toLowerCase() === "lainnya") return -1;
        return a.localeCompare(b, "id", { sensitivity: "base" });
    });

    const items = [ALL_LABEL, ...sortedCategories];

    return (
        <div className="flex flex-col gap-4" style={{ fontFamily: FONT_SANS }}>
            <p
                className="border-b pb-2 text-left text-sm font-semibold"
                style={{ color: COLOR.heading, borderColor: COLOR.line }}
            >
                Kategori
            </p>

            <nav className="flex max-h-[500px] flex-col gap-1 overflow-y-auto pr-1">
                {items.map((item) => {
                    const isActive = item === activeCategory;

                    return (
                        <button
                            key={item}
                            onClick={() => onSelectCategory(item)}
                            className="shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors"
                            style={{
                                background: isActive ? COLOR.line : "transparent",
                                color: isActive ? COLOR.heading : COLOR.body,
                            }}
                        >
                            {item}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}