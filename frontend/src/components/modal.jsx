import { useEffect } from "react";
import "../css/modal.css";

function Modal({ isOpen, onClose, title, children }) {

    // Tutup modal pas tombol Escape ditekan
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="sima-modal-overlay"
            onClick={onClose}
        >
            <div
                className="sima-modal"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="sima-modal__header">
                    <h2 className="sima-modal__title">{title}</h2>
                    <button
                        type="button"
                        className="sima-modal__close"
                        onClick={onClose}
                        aria-label="Tutup"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="sima-modal__body">
                    {children}
                </div>

            </div>
        </div>
    );
}

export default Modal;