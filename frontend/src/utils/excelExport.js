import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoSima from "../assets/logoSima.png";

let logoBufferCache = null;
async function getLogoBuffer() {
    if (logoBufferCache) return logoBufferCache;
    const res = await fetch(logoSima);
    logoBufferCache = await res.arrayBuffer();
    return logoBufferCache;
}

const HEADER_ROWS = 5; // jumlah baris yang dipakai header sebelum tabel mulai

// Header standar SIMA di Excel: logo + nama toko + hotline + garis + judul,
// mirip drawPdfHeader di utils/pdfExport.js
async function drawExcelHeader(workbook, sheet, title, colSpan) {
    const logoBuffer = await getLogoBuffer();
    const imageId = workbook.addImage({ buffer: logoBuffer, extension: "png" });

    sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 130, height: 42 },
    });

    sheet.mergeCells(1, 3, 1, colSpan);
    const nameCell = sheet.getCell(1, 3);
    nameCell.value = "SIMA PART BANDUNG";
    nameCell.font = { bold: true, size: 14, color: { argb: "FF14286E" } };
    nameCell.alignment = { vertical: "middle" };

    sheet.mergeCells(2, 3, 2, colSpan);
    const hotlineCell = sheet.getCell(2, 3);
    hotlineCell.value = "HOTLINE 082130156005";
    hotlineCell.font = { size: 10, color: { argb: "FFD21E28" } };
    hotlineCell.alignment = { vertical: "middle" };

    sheet.getRow(1).height = 20;
    sheet.getRow(2).height = 16;
    sheet.getRow(3).height = 8;

    for (let c = 1; c <= colSpan; c++) {
        sheet.getCell(3, c).border = {
            bottom: { style: "medium", color: { argb: "FF14286E" } },
        };
    }

    sheet.mergeCells(4, 1, 4, colSpan);
    const titleCell = sheet.getCell(4, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center" };
    sheet.getRow(4).height = 22;

    // garis kanan di sisi kolom terakhir header (baris 1-4), menutup kotak header
    for (let r = 1; r <= 4; r++) {
        const cell = sheet.getCell(r, colSpan);
        cell.border = {
            ...cell.border,
            right: { style: "medium", color: { argb: "FF14286E" } },
        };
    }

    sheet.getRow(5).height = 6; // spasi sebelum tabel
}

// Border tabel — warna abu-abu gelap supaya kelihatan jelas
// (gridline bawaan Excel dimatikan di setiap sheet, jadi border ini
// menjadi satu-satunya garis yang terlihat)
function tableBorder() {
    return {
        top: { style: "thin", color: { argb: "FF98A2B3" } },
        bottom: { style: "thin", color: { argb: "FF98A2B3" } },
        left: { style: "thin", color: { argb: "FF98A2B3" } },
        right: { style: "thin", color: { argb: "FF98A2B3" } },
    };
}

function styleTableHeaderRow(row, columns) {
    columns.forEach((label, i) => {
        const cell = row.getCell(i + 1);
        cell.value = label;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF14286E" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = tableBorder();
    });
    row.height = 20;
}

// Export Excel List Produk (Nama Barang, Harga, Satuan)
export async function exportListExcel({
    title = "List Produk",
    data = [],
    fields = [],
    fileName = "list-produk.xlsx",
}) {
    if (!data.length) {
        alert("Tidak ada data untuk diexport.");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet((title || "Data").slice(0, 31));

    // matikan gridline default supaya border tabel yang terlihat jelas
    sheet.views = [{ showGridLines: false }];

    const columns = ["No", ...fields.map((f) => f.label)];
    await drawExcelHeader(workbook, sheet, title, columns.length);

    const headerRowIndex = HEADER_ROWS + 1;
    styleTableHeaderRow(sheet.getRow(headerRowIndex), columns);

    data.forEach((item, i) => {
        const row = sheet.getRow(headerRowIndex + 1 + i);
        const values = [i + 1, ...fields.map((f) => item[f.key] ?? "-")];
        values.forEach((val, colIdx) => {
            const cell = row.getCell(colIdx + 1);
            cell.value = val;
            cell.alignment = { vertical: "middle" };
            cell.border = tableBorder();
        });
    });

    columns.forEach((label, i) => {
        let maxLen = label.length;
        data.forEach((item) => {
            const val =
                i === 0 ? String(data.length) : String(item[fields[i - 1]?.key] ?? "");
            maxLen = Math.max(maxLen, val.length);
        });
        sheet.getColumn(i + 1).width = Math.min(Math.max(maxLen + 4, 10), 40);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        fileName
    );
}