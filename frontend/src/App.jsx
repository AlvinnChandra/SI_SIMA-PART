import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Daftar from "./pages/daftar";
import Reset from "./pages/resetPassword";
import Katalog from "./pages/katalog";
import Order from "./pages/order";
import DataSales from "./pages/dataSales";
import DataToko from "./pages/dataToko";
import DataToko2 from "./pages/dataToko2";
import KatalogSales from "./pages/salesPage/katalogSales";
import PesananSales from "./pages/salesPage/pesananSales";
import HistoryOrder from "./pages/salesPage/historyOrder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Login />} />
        <Route path="/daftar" element={<Daftar />} />
        <Route path="/reset-password" element={<Reset />} />
        <Route path="/katalog" element={<Katalog />} />
        <Route path="/order" element={<Order />} />
        <Route path="/dataSales" element={<DataSales />} />
        <Route path="/dataToko" element={<DataToko />} />
        <Route path="/katalogSales" element={<KatalogSales />} />
        <Route path="/pesananSales" element={<PesananSales />} />
        <Route path="/dataToko2" element={<DataToko2 />} />
        <Route path="/historyOrder" element={<HistoryOrder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;