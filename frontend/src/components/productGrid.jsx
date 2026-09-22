import ProductCard from "./productCard";
import { COLOR } from "../constants/ui";

export default function ProductGrid({
    products,
    onEdit,
    onDelete,
    onPreview,
    onAddToOrder,
    selectionMode = false,
    selectedIds = [],
    onToggleSelect,
    onRemoveDiskon,
}) {
    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <p className="text-sm" style={{ color: COLOR.body }}>
                    Tidak ada produk yang cocok.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
                <ProductCard
                    key={product._id ?? product.kode}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPreview={onPreview}
                    onAddToOrder={onAddToOrder}
                    selectionMode={selectionMode}
                    isSelected={selectedIds.includes(product._id)}
                    onToggleSelect={onToggleSelect}
                    onRemoveDiskon={onRemoveDiskon}
                />
            ))}
        </div>
    );
}