function OrderTable({ orders }) {
    if (orders.length === 0) {
        return <p className="empty-state">Tidak ada pesanan yang cocok.</p>;
    }

    return (
        <table className="order-table">
            <thead>
                <tr>
                    <th>No</th>
                    <th>No. Pesanan</th>
                    <th>Nama Toko</th>
                    <th>Sales</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order, index) => (
                    <tr key={order.id}>
                        <td>{order.rowNumber ?? index + 1}</td>
                        <td>{order.orderNumber}</td>
                        <td>{order.storeName}</td>
                        <td>{order.salesName}</td>
                        <td>{order.orderDate}</td>
                        <td>
                            <span className={`status-badge status-${order.status}`}>
                                {order.statusLabel}
                            </span>
                        </td>
                        <td className="order-actions">
                            {order.onView && (
                                <button
                                    type="button"
                                    className="btn-icon"
                                    onClick={() => order.onView(order.id)}
                                    aria-label="Lihat detail"
                                >
                                    👁
                                </button>
                            )}
                            {order.onDelete && (
                                <button
                                    type="button"
                                    className="btn-icon btn-icon-danger"
                                    onClick={() => order.onDelete(order.id)}
                                    aria-label="Hapus pesanan"
                                >
                                    🗑
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default OrderTable;