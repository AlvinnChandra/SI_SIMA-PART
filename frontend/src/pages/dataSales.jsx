import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SearchBar from "../components/searchBar";
import ExportPdfButton from "../components/exportPDF";
import ExportExcelButton from "../components/exportExcel";
import SalesTable from "../fitur/salesTable";
import "../css/global.css";

const API_BASE_URL = "http://localhost:3000/api";

// Mapping status verifikasi backend -> label yang ditampilkan di laporan
function statusToLabel(status) {
    if (status === "active") return "Berhasil Verifikasi";
    if (status === "rejected") return "Tidak Berhasil Verifikasi";
    return "Menunggu Verifikasi";
}

function getAuthToken() {
    return (
        localStorage.getItem("simaToken") ||
        sessionStorage.getItem("simaToken")
    );
}

// Escape teks sederhana supaya aman ditaruh di dalam HTML
function escapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function DataSales() {
    const [keyword, setKeyword] = useState("");
    const [exporting, setExporting] = useState(false);

    const handleExportPdf = async () => {
        setExporting(true);

        try {
            const token = getAuthToken();

            const res = await fetch(`${API_BASE_URL}/users/sales`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Gagal mengambil data sales.");
            }

            const users = Array.isArray(data)
                ? data
                : Array.isArray(data.users)
                    ? data.users
                    : [];

            const searchKeyword = keyword.toLowerCase().trim();

            const filtered = users.filter((u) =>
                String(u.namaLengkap || "")
                    .toLowerCase()
                    .includes(searchKeyword)
            );

            const rows = filtered
                .map(
                    (u, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${escapeHtml(u.namaLengkap)}</td>
                            <td>${escapeHtml(u.nik)}</td>
                            <td>${escapeHtml(u.noTelepon)}</td>
                            <td>${escapeHtml(u.alamat)}</td>
                            <td>${escapeHtml(statusToLabel(u.status))}</td>
                            <td>${escapeHtml(u.role === "admin" ? "Admin" : "Sales")}</td>
                        </tr>
                    `
                )
                .join("");

            const tanggalCetak = new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });

            const html = `
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8" />
                    <title>Data Sales - SIMA Motorcycle Parts</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            font-family: Arial, Helvetica, sans-serif;
                            padding: 32px;
                            color: #1a1a1a;
                        }
                        h1 {
                            font-size: 20px;
                            margin-bottom: 4px;
                        }
                        p.subtitle {
                            margin-top: 0;
                            margin-bottom: 8px;
                            color: #555;
                            font-size: 13px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 12px;
                        }
                        th, td {
                            border: 1px solid #ccc;
                            padding: 8px 10px;
                            text-align: left;
                        }
                        th {
                            background: #f2f2f2;
                        }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Data Sales - SIMA Motorcycle Parts</h1>
                    <p class="subtitle">Dicetak pada ${tanggalCetak}${searchKeyword ? ` &mdash; Filter: "${escapeHtml(keyword)}"` : ""
                }</p>
                    

                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Sales</th>
                                <th>NIK</th>
                                <th>No Telepon</th>
                                <th>Alamat</th>
                                <th>Verifikasi</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows || `<tr><td colspan="7" style="text-align:center;">Tidak ada data.</td></tr>`
                }
                        </tbody>
                    </table>

                    <script>
                        window.onload = function () {
                            window.print();
                        };
                    <\/script>
                </body>
                </html>
            `;

            const printWindow = window.open("", "_blank");

            if (!printWindow) {
                alert(
                    "Popup diblokir browser. Izinkan popup untuk situs ini supaya bisa membuka laporan PDF."
                );
                return;
            }

            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();
        } catch (err) {
            alert(err.message || "Gagal membuat laporan PDF.");
        } finally {
            setExporting(false);
        }
    };

    const handleExportExcel = () => {
        // logic buat generate/export Excel data sales
        console.log("Export Excel diklik");
    };

    return (
        <div className="dashboard-layout">
            <Header />

            <main className="dashboard-content">

                <div className="page-header-row">
                    <h1>Data Sales</h1>

                    <div className="page-header-actions">
                        <ExportExcelButton onClick={handleExportExcel} />
                        <ExportPdfButton onClick={handleExportPdf} disabled={exporting} />
                    </div>
                </div>

                <SearchBar
                    placeholder="Cari nama sales..."
                    onSearch={setKeyword}
                />

                <SalesTable keyword={keyword} />

            </main>

            <Footer />
        </div>
    );
}

export default DataSales;