import "../css/exportPDF.css";

function ExportPdfButton({ label = "Export PDF", onClick }) {
    return (
        <button
            type="button"
            className="sima-export-pdf-btn"
            onClick={onClick}
        >
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
                <path
                    d="M15 2v4a1 1 0 0 0 1 1h4"
                    fill="#FFFFFF"
                    fillOpacity="0.35"
                />
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
            {label}
        </button>
    );
}

export default ExportPdfButton;