import ProductCard from "../components/productCard";

export default function ProductGrid({ products }) {
    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <p className="text-sm" style={{ color: "#475467" }}>
                    Tidak ada produk yang cocok.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
                <ProductCard key={product.kode} product={product} />
            ))}
        </div>
    );
}