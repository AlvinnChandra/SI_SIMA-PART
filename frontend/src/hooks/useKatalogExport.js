import { useState } from "react";
import jsPDF from "jspdf";
import {
    getLogo,
    drawPdfHeader,
    exportTablePdf,
    drawFooterAllPages,
    FOOTER_HEIGHT,
} from "../utils/pdfExport";
import { exportListExcel } from "../utils/excelExport";
import { getHargaFinal } from "../utils/diskonUtils";
import { getProductImage } from "../utils/productFormat";

// Ubah gambar (URL / cross-origin) jadi base64 supaya bisa ditempel ke PDF.
async function imageUrlToBase64(url) {
    try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) throw new Error("Gagal ambil gambar");
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch {
        return null; // gambar gagal diambil -> nanti digambar kotak kosong
    }
}

// Baris tabel untuk export List (PDF maupun Excel) dibangun sekali saja.
const LIST_FIELDS = [
    { key: "nama", label: "Nama Barang" },
    { key: "harga", label: "Harga" },
    { key: "satuan", label: "Satuan" },
];

function buildListRows(items) {
    return items.map((p) => ({
        nama: p.nama,
        harga: `Rp ${getHargaFinal(p).toLocaleString("id-ID")}`,
        satuan: p.keterangan,
    }));
}

export default function useKatalogExport(filteredProducts) {
    const [exportingKatalog, setExportingKatalog] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);

    // ---------- EXPORT 1: KATALOG (GRID FOTO, LANDSCAPE) ----------
    const exportKatalogPdf = async () => {
        if (!filteredProducts.length) {
            alert("Tidak ada produk untuk diexport.");
            return;
        }

        setExportingKatalog(true);
        try {
            const doc = new jsPDF("l", "mm", "a4"); // landscape
            const logo = await getLogo();

            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();

            const marginX = 14;
            const startY = 46;
            const cols = 5;
            const rows = 2;
            const perPage = cols * rows; // 10 barang per halaman

            const colGap = 3;
            const rowGap = 5;
            const gapAboveFooter = 6;

            const cellW = (pageW - marginX * 2) / cols;
            const cardW = cellW - colGap;

            const availableH = pageH - startY - FOOTER_HEIGHT - gapAboveFooter;
            const cardH = (availableH - rowGap * (rows - 1)) / rows;

            const imgPadding = 3;
            const textBlockH = 26; // dinaikkan dari 22 -> kasih ruang untuk baris satuan
            const imgSize = Math.min(
                cardW - imgPadding * 2,
                cardH - textBlockH - imgPadding - 3
            );

            const items = filteredProducts;

            for (let i = 0; i < items.length; i++) {
                const posInPage = i % perPage;

                if (posInPage === 0) {
                    if (i !== 0) doc.addPage();
                    drawPdfHeader(doc, logo, "Katalog Produk");
                }

                const col = posInPage % cols;
                const row = Math.floor(posInPage / cols);

                const cardX = marginX + col * cellW + colGap / 2;
                const cardY = startY + row * (cardH + rowGap);

                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.3);
                doc.rect(cardX, cardY, cardW, cardH);

                const product = items[i];
                const base64 = await imageUrlToBase64(getProductImage(product));

                const imgX = cardX + (cardW - imgSize) / 2;
                const imgY = cardY + imgPadding;

                let imageDrawn = false;
                if (base64) {
                    try {
                        doc.addImage(base64, "JPEG", imgX, imgY, imgSize, imgSize);
                        imageDrawn = true;
                    } catch {
                        imageDrawn = false;
                    }
                }
                if (!imageDrawn) {
                    doc.setDrawColor(200);
                    doc.rect(imgX, imgY, imgSize, imgSize);
                }

                const dividerY = imgY + imgSize + 3;
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.2);
                doc.line(cardX, dividerY, cardX + cardW, dividerY);

                const textY = dividerY + 4;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                doc.setTextColor(130);
                doc.text(product.kode || "-", cardX + cardW / 2, textY, { align: "center" });

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(20, 40, 110);
                const namaLines = doc.splitTextToSize(product.nama, cardW - 6).slice(0, 2);
                doc.text(namaLines, cardX + cardW / 2, textY + 4, { align: "center" });

                // hargaY dibuat TETAP (selalu anggap nama 2 baris) supaya harga & satuan
                // sejajar rata di semua card dalam satu baris, terlepas nama 1 atau 2 baris.
                const hargaY = textY + 4 + 2 * 3.5 + 3;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(210, 30, 40);
                doc.text(
                    `Rp ${getHargaFinal(product).toLocaleString("id-ID")}`,
                    cardX + cardW / 2,
                    hargaY,
                    { align: "center" }
                );

                // satuan (PCS/SET) -- ambil langsung dari field keterangan di DB
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                doc.setTextColor(130);
                doc.text(
                    product.keterangan || "-",
                    cardX + cardW / 2,
                    hargaY + 3.5,
                    { align: "center" }
                );
            }

            drawFooterAllPages(doc);
            doc.save("katalog-produk.pdf");
        } catch (err) {
            alert(err.message || "Gagal membuat PDF katalog.");
        } finally {
            setExportingKatalog(false);
        }
    };

    // ---------- EXPORT 2: LIST PRODUK (TABEL, PDF) ----------
    const exportListPdf = () => {
        exportTablePdf({
            title: "List Produk",
            data: buildListRows(filteredProducts),
            fields: LIST_FIELDS,
            fileName: "list-produk.pdf",
        });
    };

    // ---------- EXPORT 3: LIST PRODUK (EXCEL) ----------
    const exportExcel = async () => {
        setExportingExcel(true);
        try {
            await exportListExcel({
                title: "List Produk",
                data: buildListRows(filteredProducts),
                fields: LIST_FIELDS,
                fileName: "list-produk.xlsx",
            });
        } catch (err) {
            alert(err.message || "Gagal membuat Excel.");
        } finally {
            setExportingExcel(false);
        }
    };

    return {
        exportingKatalog,
        exportingExcel,
        exportKatalogPdf,
        exportListPdf,
        exportExcel,
    };
}