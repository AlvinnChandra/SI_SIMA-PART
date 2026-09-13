// components/orderStatusTabs.jsx
const STATUS_LIST = [
    { key: "semua", label: "Semua" },
    { key: "masuk", label: "Orderan Masuk" },
    { key: "disiapkan", label: "Pesanan Disiapkan" },
    { key: "selesai", label: "Pesanan Selesai" },
];

function OrderStatusTabs({ activeStatus, onChange }) {
    return (
        <div className="order-status-tabs">
            {STATUS_LIST.map((status) => (
                <button
                    key={status.key}
                    className={`status-tab ${activeStatus === status.key ? "active" : ""}`}
                    onClick={() => onChange(status.key)}
                >
                    {status.label}
                </button>
            ))}
        </div>
    );
}

export default OrderStatusTabs;