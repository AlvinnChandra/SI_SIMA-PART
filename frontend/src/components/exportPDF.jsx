import { useState, useRef, useEffect } from "react";
import { exportTablePdf } from "../utils/pdfExport";
import "../css/exportPDF.css";

function PdfIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
                fill="#E5252A"
            />
            <path d="M15 2v4a1 1 0 0 0 1 1h4" fill="#FFFFFF" fillOpacity="0.35" />
            <text
                x="12"
                y="17.5"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontSize="7"
                fontWeight="700"
                fill="#FFFFFF"
            >
                PDF
            </text>
        </svg>
    );
}

/**
 * Mode 1 (lama, satu tombol langsung export):
 *   <ExportPdfButton title="Data Toko" data={...} fields={...} fileName="..." />
 *
 * Mode 2 (dropdown, beberapa pilihan export):
 *   <ExportPdfButton
 *     options={[
 *       { label: "Export Katalog (Foto)", onClick: fn1 },
 *       { label: "Export List (Tabel)", onClick: fn2 },
 *     ]}
 *   />
 */
function ExportPdfButton({
    label = "Export PDF",
    title = "Laporan",
    data = [],
    fields = [],
    fileName = "laporan-sima.pdf",
    orientation = "p",
    options = null,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSimpleExport = () => {
        exportTablePdf({ title, data, fields, fileName, orientation });
    };

    // ---- MODE DROPDOWN ----
    if (options && options.length > 0) {
        return (
            <div className="sima-export-pdf-dropdown" ref={wrapRef}>
                <button
                    type="button"
                    className="sima-export-pdf-btn"
                    onClick={() => setIsOpen((v) => !v)}
                >
                    <PdfIcon />
                    {label}
                </button>

                {isOpen && (
                    <div className="sima-export-pdf-dropdown__menu">
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                type="button"
                                className="sima-export-pdf-dropdown__item"
                                onClick={() => {
                                    setIsOpen(false);
                                    opt.onClick();
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ---- MODE TOMBOL BIASA ----
    return (
        <button type="button" className="sima-export-pdf-btn" onClick={handleSimpleExport}>
            <PdfIcon />
            {label}
        </button>
    );
}

export default ExportPdfButton;