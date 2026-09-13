// components/orderTable.jsx
function OrderTable({ orders }) {
    if (orders.length === 0) {
        return <p className="empty-state">Tidak ada pesanan yang cocok.</p>;
    }

    return (
        <table className="order-table">
            <thead>
                <tr>
                    <th>No. Pesanan</th>
                    <th>Nama Toko</th>
                    <th>Sales</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr key={order.id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.storeName}</td>
                        <td>{order.salesName}</td>
                        <td>{order.orderDate}</td>
                        <td>
                            <span className={`status-badge status-${order.status}`}>
                                {order.statusLabel}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default OrderTable;