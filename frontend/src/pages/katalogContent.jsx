import { useState } from "react";
import { FaTag } from "react-icons/fa";

import SearchBar from "../components/searchBar";
import AddButton from "../components/addButton";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import Pagination from "../components/pagination";
import ProductGrid from "../components/productGrid";
import CatalogSidebar from "../components/catalogSidebar";
import DiskonToolbar from "../components/diskonToolBar";
import ConfirmDialog from "../components/confirmDialog";
import ProductFormModal from "../components/productFormModal";
import ProductPreviewModal from "../components/productPreviewModal";

import useProductCatalog from "../hooks/useProductCatalog";
import useDiskon from "../hooks/useDiskon";
import useConfirmModal from "../hooks/useConfirmModal";
import useProductCrud from "../hooks/useProductCrud";
import useKatalogExport from "../hooks/useKatalogExport";
import { useAuth } from "../hooks/useAuth";

// Badan halaman katalog. Ini satu-satunya tempat katalog digambar,
// dipakai oleh halaman /katalog maupun dashboard.
// Props:
//   onAddToOrder : kalau diisi, kartu produk menampilkan tombol "+" (mode user)
//   canManage    : izin admin (tambah / edit / hapus / export). Default ikut useAuth.
export default function KatalogContent({ onAddToOrder, canManage }) {
    const { isAdmin } = useAuth();
    const admin = canManage ?? isAdmin;

    const catalog = useProductCatalog();
    const { confirmState, requestConfirm, closeConfirm } = useConfirmModal();

    const diskon = useDiskon({
        products: catalog.products,
        setProducts: catalog.setProducts,
        filteredProducts: catalog.filteredProducts,
        requestConfirm,
    });

    const crud = useProductCrud({ setProducts: catalog.setProducts });
    const exportKatalog = useKatalogExport(catalog.filteredProducts);

    const [previewProduct, setPreviewProduct] = useState(null);

    // Mode diskon hanya boleh aktif untuk admin. diskon.diskonMode sendiri
    // cuma bisa jadi true lewat tombol yang sudah dikunci admin, tapi
    // variabel ini dipakai di semua tempat supaya kalau ada titik pemicu
    // baru nanti, aturannya tetap satu tempat.
    const diskonModeActive = admin && diskon.diskonMode;

    return (
        <main className="dashboard-content">
            <div className="page-header-row">
                <h1>Katalog</h1>
                <div className="page-header-actions flex flex-nowrap items-center gap-3 overflow-x-auto">
                    {admin && !diskonModeActive && (
                        <button
                            type="button"
                            onClick={diskon.bukaDiskonMode}
                            className="sima-ghost-btn shrink-0 whitespace-nowrap"
                        >
                            <FaTag size={12} />
                            Atur Diskon
                        </button>
                    )}

                    {admin && (
                        <>
                            <div className="shrink-0">
                                <ExportExcelButton
                                    label={exportKatalog.exportingExcel ? "Memproses..." : "Export Excel"}
                                    onClick={exportKatalog.exportExcel}
                                />
                            </div>
                            <div className="shrink-0">
                                <ExportPdfButton
                                    label={exportKatalog.exportingKatalog ? "Memproses..." : "Export PDF"}
                                    options={[
                                        { label: "Export Katalog (Foto)", onClick: exportKatalog.exportKatalogPdf },
                                        { label: "Export List (Tabel)", onClick: exportKatalog.exportListPdf },
                                    ]}
                                />
                            </div>
                            <div className="shrink-0">
                                <AddButton label="Tambah Produk" onClick={crud.openAdd} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {diskonModeActive && (
                <DiskonToolbar
                    diskonPersen={diskon.diskonPersen}
                    onPersenChange={diskon.setDiskonPersen}
                    jumlahDipilih={diskon.selectedForDiskon.length}
                    isAllSelected={diskon.isAllFilteredSelected}
                    onToggleSelectAll={diskon.toggleSelectAll}
                    onTerapkan={diskon.terapkanDiskon}
                    onResetSemua={diskon.resetSemuaDiskon}
                    onBatal={diskon.batalDiskonMode}
                    error={diskon.diskonError}
                />
            )}

            <SearchBar
                placeholder="Cari nama produk atau kode barang..."
                onSearch={catalog.onSearch}
            />

            <div className="mt-6 flex flex-col gap-6 md:flex-row">
                <CatalogSidebar
                    categories={catalog.categories}
                    activeCategory={catalog.activeCategory}
                    onSelectCategory={catalog.onSelectCategory}
                    kendaraanOptions={catalog.kendaraanOptions}
                    selectedKendaraan={catalog.selectedKendaraan}
                    onKendaraanChange={catalog.onKendaraanChange}
                    priceSort={catalog.priceSort}
                    onPriceSortChange={catalog.onPriceSortChange}
                />

                <div className="min-w-0 flex-1">
                    {catalog.isLoading && (
                        <p className="py-10 text-center text-sm text-gray-500">
                            Memuat produk...
                        </p>
                    )}

                    {!catalog.isLoading && catalog.loadError && (
                        <p className="py-10 text-center text-sm text-red-500">
                            {catalog.loadError}
                        </p>
                    )}

                    {!catalog.isLoading && !catalog.loadError && (
                        <>
                            <ProductGrid
                                products={catalog.paginatedProducts}
                                onEdit={admin && !diskonModeActive ? crud.openEdit : undefined}
                                onDelete={admin && !diskonModeActive ? crud.askDelete : undefined}
                                onPreview={diskonModeActive ? undefined : setPreviewProduct}
                                onAddToOrder={
                                    onAddToOrder && !diskonModeActive ? onAddToOrder : undefined
                                }
                                selectionMode={diskonModeActive}
                                selectedIds={diskon.selectedForDiskon}
                                onToggleSelect={diskon.toggleSelect}
                                onRemoveDiskon={admin ? diskon.hapusDiskon : undefined}
                            />

                            <div className="mt-8">
                                <Pagination
                                    currentPage={catalog.currentPage}
                                    totalPages={catalog.totalPages}
                                    onPageChange={catalog.setCurrentPage}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ---------- POPUP ---------- */}
            {crud.mode && (
                <ProductFormModal
                    mode={crud.mode}
                    product={crud.editingProduct}
                    form={crud.form}
                    submitting={crud.submitting}
                    error={crud.error}
                    onChangeField={crud.changeField}
                    onChangePhoto={crud.changePhoto}
                    onSubmit={crud.submitForm}
                    onClose={crud.closeForm}
                />
            )}

            {previewProduct && (
                <ProductPreviewModal
                    product={previewProduct}
                    onClose={() => setPreviewProduct(null)}
                />
            )}

            {crud.deleteTarget && (
                <ConfirmDialog
                    title="Hapus Produk"
                    message={`Yakin mau hapus "${crud.deleteTarget.nama}"? Tindakan ini tidak bisa dibatalkan.`}
                    confirmLabel="Hapus"
                    loading={crud.deleteSubmitting}
                    onConfirm={crud.confirmDelete}
                    onClose={crud.closeDelete}
                />
            )}

            {confirmState && (
                <ConfirmDialog
                    title={confirmState.title}
                    message={confirmState.message}
                    onConfirm={confirmState.onConfirm}
                    onClose={closeConfirm}
                />
            )}
        </main>
    );
}