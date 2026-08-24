import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Daftar from "./pages/daftar";
import Reset from "./pages/resetPassword";
import Katalog from "./pages/katalog";
import Order from "./pages/order";
import DataSales from "./pages/dataSales";
import DataToko from "./pages/dataToko";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;