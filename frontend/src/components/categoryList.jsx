import { FaList } from "react-icons/fa";

const ALL_LABEL = "Semua";

const BODY = "#667085";
const ACCENT_TEXT = "#16171d";
const ACCENT_BG = "#f3f4f6";

export default function CategoryList({
  categories = [],
  activeCategory,
  onSelectCategory,
}) {
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.toLowerCase() === "lainnya") return 1;
    if (b.toLowerCase() === "lainnya") return -1;

    return a.localeCompare(b, "id", {
      sensitivity: "base",
    });
  });

  const items = [ALL_LABEL, ...sortedCategories];

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4">
      <p
        className="border-b pb-2 text-left text-sm font-semibold"
        style={{ color: BODY }}
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
                background: isActive ? ACCENT_BG : "transparent",
                color: isActive ? ACCENT_TEXT : BODY,
              }}
            >
              {item}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}