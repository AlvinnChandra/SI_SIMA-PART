import { FaList } from "react-icons/fa";

const ALL_LABEL = "Semua";

const BODY = "#f3f4f6";
const ACCENT_TEXT = "#16171d";
const ACCENT_BG = "#f3f4f6";

export default function CategoryList({ categories = [], activeCategory, onSelectCategory }) {
  const items = [ALL_LABEL, ...categories];

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4">
      <p className="text-sm font-semibold border-b text-left pb-2" style={{ color: BODY }}>
        Kategori
      </p>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = item === activeCategory;
          return (
            <button
              key={item}
              onClick={() => onSelectCategory(item)}
              className="rounded-md px-3 py-2 text-left text-sm font-medium transition-colors"
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