import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Katalog from "./pages/katalog";
import Order from "./pages/order";
import DataSales from "./pages/dataSales";
import DataToko from "./pages/dataToko";
import OrderSales from "./pages/laporanOrderSales";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Login />} />
        <Route path="/katalog" element={<Katalog />} />
        <Route path="/order" element={<Order />} />
        <Route path="/dataSales" element={<DataSales />} />
        <Route path="/dataToko" element={<DataToko />} />
        <Route path="/orderSales" element={<OrderSales />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;