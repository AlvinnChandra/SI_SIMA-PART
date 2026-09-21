import { useState, useCallback } from "react";

// Popup konfirmasi custom (pengganti window.confirm).
// Dulu state + JSX-nya ditulis dua kali, di katalog.jsx dan katalogContent.jsx.
export default function useConfirmModal() {
    const [confirmState, setConfirmState] = useState(null);

    const closeConfirm = useCallback(() => setConfirmState(null), []);

    // requestConfirm({ title, message, onConfirm })
    // onConfirm dibungkus supaya popup otomatis tertutup setelah aksi selesai.
    const requestConfirm = useCallback(({ title, message, onConfirm }) => {
        setConfirmState({
            title,
            message,
            onConfirm: () => {
                onConfirm?.();
                setConfirmState(null);
            },
        });
    }, []);

    return { confirmState, requestConfirm, closeConfirm };
}