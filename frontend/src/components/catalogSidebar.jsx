import CategoryList from "./categoryList";
import CheckboxFilter from "./checkboxFilter";
import PriceSort from "./priceSort";
import { COLOR } from "../constants/ui";

// Panel filter kiri. Susunannya dulu ditulis identik di dua halaman.
export default function CatalogSidebar({
    categories,
    activeCategory,
    onSelectCategory,
    kendaraanOptions,
    selectedKendaraan,
    onKendaraanChange,
    priceSort,
    onPriceSortChange,
}) {
    return (
        <aside className="flex w-full shrink-0 flex-col gap-6 md:w-56">
            <CategoryList
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={onSelectCategory}
            />

            <div className="border-t pt-4" style={{ borderColor: COLOR.line }}>
                <CheckboxFilter
                    title="Model Kendaraan"
                    options={kendaraanOptions}
                    selected={selectedKendaraan}
                    onChange={onKendaraanChange}
                />
            </div>

            <div className="border-t pt-4" style={{ borderColor: COLOR.line }}>
                <PriceSort value={priceSort} onChange={onPriceSortChange} />
            </div>
        </aside>
    );
}