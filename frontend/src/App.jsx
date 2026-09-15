import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireRole from "./components/requireRole";

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
        {/* Admin-Only */}       
        <Route path="/katalog" element={<RequireRole role="admin"><Katalog /></RequireRole>} />
        <Route path="/order" element={<RequireRole role="admin"><Order /></RequireRole>} />
        <Route path="/dataSales" element={<RequireRole role="admin"><DataSales /></RequireRole>} />
        <Route path="/dataToko" element={<RequireRole role="admin"><DataToko /></RequireRole>} />

        {/* Sales-Only */}
        <Route path="/katalogSales" element={<RequireRole role="user"><KatalogSales /></RequireRole>} />
        <Route path="/pesananSales" element={<RequireRole role="user"><PesananSales /></RequireRole>} />
        <Route path="/dataToko2" element={<RequireRole role="user"><DataToko2 /></RequireRole>} />
        <Route path="/historyOrder" element={<RequireRole role="user"><HistoryOrder /></RequireRole>} />      </Routes>
    </BrowserRouter>
  );
}

export default App;