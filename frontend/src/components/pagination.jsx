import { ChevronLeft, ChevronRight } from "lucide-react";

const BODY = "#667085";
const LINE = "#D0D5DD";
const ACCENT = "#f3f4f6";
const ACCENT_TEXT = "#16171d";

function getPageList(current, total) {
    const pages = [];
    const window = 1;

    for (let i = 1; i <= total; i++) {
        const isEdge = i === 1 || i === total;
        const isNearCurrent = Math.abs(i - current) <= window;
        if (isEdge || isNearCurrent) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }
    return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = getPageList(currentPage, totalPages);

    return (
        <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: LINE }}>
            <button
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: LINE, color: BODY }}
            >
                <ChevronLeft size={16} />
                Previous
            </button>

            <div className="hidden items-center gap-1 sm:flex">
                {pages.map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-sm" style={{ color: BODY }}>
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors"
                            style={{
                                background: p === currentPage ? ACCENT : "transparent",
                                color: p === currentPage ? ACCENT_TEXT : BODY,
                            }}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>
            <button
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: LINE, color: BODY }}
            >
                Next
                <ChevronRight size={16} />
            </button>
        </div>
    );
}