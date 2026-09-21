import { COLOR } from "../constants/ui";

// Kerangka semua popup: overlay gelap, klik luar untuk tutup,
// klik dalam tidak menutup. Dulu tiga baris ini disalin di lima tempat.
export default function ModalShell({ onClose, children, className = "w-full max-w-sm" }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: COLOR.overlay }}
            onClick={onClose}
        >
            <div
                className={`rounded-lg bg-white ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}