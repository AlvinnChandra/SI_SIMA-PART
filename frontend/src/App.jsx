import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;