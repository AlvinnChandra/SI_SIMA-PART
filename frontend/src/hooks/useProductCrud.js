import { useState } from "react";
import { createItem, updateItem, deleteItem } from "../services/itemService";
import { applyStoredDiskon, removeDiskonForId } from "../utils/diskonUtils";

export const EMPTY_FORM = {
    nama: "",
    harga: "",
    keterangan: "",
    kategori: "",
    kendaraan: [],       // array: bisa lebih dari satu model kendaraan
    gambarFile: null,   // File asli yang dikirim ke server
    gambarPreview: null, // base64 hanya untuk preview di UI
};

function buildFormData(form) {
    const fd = new FormData();
    ["nama", "harga", "keterangan", "kategori"].forEach((key) =>
        fd.append(key, form[key])
    );
    // multipart/form-data tidak punya tipe array, jadi kendaraan dikirim
    // sebagai JSON string dan di-parse lagi di itemController.js.
    fd.append("kendaraan", JSON.stringify(form.kendaraan || []));
    if (form.gambarFile) fd.append("gambar", form.gambarFile);
    return fd;
}

// Tambah, edit, hapus produk. Dulu handler tambah dan edit hampir identik
// (bedanya cuma createItem vs updateItem), sekarang jadi satu alur.
export default function useProductCrud({ setProducts }) {
    // mode: null | "add" | "edit"
    const [mode, setMode] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    const openAdd = () => {
        setMode("add");
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setError("");
    };

    const openEdit = (product) => {
        setMode("edit");
        setEditingProduct(product);
        setForm({
            nama: product.nama,
            harga: String(product.harga),
            keterangan: product.keterangan || "",
            kategori: product.kategori,
            // jaga-jaga untuk data lama yang belum dimigrasi ke array
            kendaraan: Array.isArray(product.kendaraan)
                ? product.kendaraan
                : product.kendaraan
                ? [product.kendaraan]
                : [],
            gambarFile: null,
            gambarPreview: product.gambar || null,
        });
        setError("");
    };

    const closeForm = () => {
        if (submitting) return;
        setMode(null);
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setError("");
    };

    const changeField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const changePhoto = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setForm((prev) => ({
                ...prev,
                gambarFile: file,
                gambarPreview: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    const submitForm = async (e) => {
        e.preventDefault();

        if (!form.kendaraan || form.kendaraan.length === 0) {
            setError("Pilih atau tambahkan minimal satu kendaraan.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const fd = buildFormData(form);

            if (mode === "edit") {
                const updated = await updateItem(editingProduct._id, fd);
                // Respons server tidak membawa diskon, jadi ditempel ulang
                // dari localStorage. Harga bisa berubah, hargaSetelahDiskon
                // ikut dihitung ulang.
                const [withDiskon] = applyStoredDiskon([updated]);
                setProducts((prev) =>
                    prev.map((p) => (p._id === editingProduct._id ? withDiskon : p))
                );
            } else {
                const created = await createItem(fd);
                setProducts((prev) => [...prev, created]);
            }

            setMode(null);
            setEditingProduct(null);
            setForm(EMPTY_FORM);
        } catch (err) {
            setError(
                err.message ||
                    (mode === "edit"
                        ? "Gagal menyimpan perubahan."
                        : "Gagal menambahkan produk.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        setDeleteSubmitting(true);
        try {
            await deleteItem(deleteTarget._id);
            // bersihkan juga diskon produk yang dihapus
            removeDiskonForId(deleteTarget._id);
            setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            alert(err.message || "Gagal menghapus produk.");
        } finally {
            setDeleteSubmitting(false);
        }
    };

    return {
        mode,
        editingProduct,
        form,
        submitting,
        error,
        openAdd,
        openEdit,
        closeForm,
        changeField,
        changePhoto,
        submitForm,

        deleteTarget,
        deleteSubmitting,
        askDelete: setDeleteTarget,
        closeDelete: () => !deleteSubmitting && setDeleteTarget(null),
        confirmDelete,
    };
}