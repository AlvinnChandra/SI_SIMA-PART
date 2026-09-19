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
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman umum */}
        <Route path="/" element={<Login />} />
        <Route path="/daftar" element={<Daftar />} />
        <Route path="/reset-password" element={<Reset />} />

        {/* Halaman Admin (hanya role "admin") */}
        <Route
          path="/katalog"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Katalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Order />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dataSales"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DataSales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dataToko"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DataToko />
            </ProtectedRoute>
          }
        />

        {/* Halaman Sales (hanya role "sales") */}
        <Route
          path="/katalogSales"
          element={
            <ProtectedRoute allowedRoles={["sales"]}>
              <KatalogSales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pesananSales"
          element={
            <ProtectedRoute allowedRoles={["sales"]}>
              <PesananSales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dataToko2"
          element={
            <ProtectedRoute allowedRoles={["sales"]}>
              <DataToko2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/historyOrder"
          element={
            <ProtectedRoute allowedRoles={["sales"]}>
              <HistoryOrder />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;