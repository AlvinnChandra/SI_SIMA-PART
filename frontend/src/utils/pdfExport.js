import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoSima from "../assets/logoSima.png";

let logoCache = null;
export async function getLogo() {
    if (logoCache) return logoCache;
    const blob = await (await fetch(logoSima)).blob();
    logoCache = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
    return logoCache;
}

// Tinggi area yang dipakai footer (dipakai juga sebagai margin bawah tabel)
export const FOOTER_HEIGHT = 20;

// Header standar SIMA (logo + nama + hotline + garis + judul di tengah)
export function drawPdfHeader(doc, logo, title) {
    const pageW = doc.internal.pageSize.getWidth();

    doc.addImage(logo, "PNG", 14, 10, 40, 13);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(20, 40, 110);
    doc.text("SIMA PART BANDUNG", 60, 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(210, 30, 40);
    doc.text("HOTLINE 082130156005", 60, 23);

    doc.setDrawColor(20, 40, 110);
    doc.setLineWidth(0.6);
    doc.line(14, 27, pageW - 14, 27);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, pageW / 2, 40, { align: "center" });
}

// Footer standar SIMA (garis + teks & nomor halaman di tengah bawah)
export function drawPdfFooter(doc, pageNumber, totalPages) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const lineY = pageH - 16;

    doc.setDrawColor(20, 40, 110);
    doc.setLineWidth(0.4);
    doc.line(14, lineY, pageW - 14, lineY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
        "SIMA PART BANDUNG  |  Hotline 082130156005",
        pageW / 2,
        lineY + 5,
        { align: "center" }
    );

    if (totalPages) {
        doc.text(
            `Halaman ${pageNumber} dari ${totalPages}`,
            pageW / 2,
            lineY + 9.5,
            { align: "center" }
        );
    }

    // balikin warna teks biar nggak kebawa ke konten berikutnya
    doc.setTextColor(0, 0, 0);
}

// Gambar footer di semua halaman.
// Dipanggil setelah semua konten selesai, supaya total halaman sudah pasti.
export function drawFooterAllPages(doc) {
    const total = doc.internal.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        drawPdfFooter(doc, p, total);
    }
    doc.setPage(total);
}

// Export PDF tabel biasa (dipakai Data Toko, Data Sales, List Produk)
export async function exportTablePdf({
    title,
    data = [],
    fields = [],
    fileName = "laporan-sima.pdf",
    orientation = "p",
}) {
    if (!data.length) {
        alert("Tidak ada data untuk diexport.");
        return;
    }

    const doc = new jsPDF(orientation, "mm", "a4");
    const logo = await getLogo();

    const columns = ["No", ...fields.map((f) => f.label)];
    const rows = data.map((item, i) => [
        i + 1,
        ...fields.map((f) => item[f.key] ?? "-"),
    ]);

    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 46,
        margin: { top: 46, bottom: FOOTER_HEIGHT },
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: [20, 40, 110], textColor: 255 },
        didDrawPage: () => drawPdfHeader(doc, logo, title),
    });

    drawFooterAllPages(doc);
    doc.save(fileName);
}