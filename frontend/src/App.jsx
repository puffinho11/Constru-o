import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CotacaoPublica from "./pages/CotacaoPublica";
import FornecedorLogin from "./pages/FornecedorLogin";
import FornecedorPortal from "./pages/FornecedorPortal";
import PrivateRoute from "./routes/PrivateRoute";
import "./style.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/cotacao/:token" element={<CotacaoPublica />} />

        <Route
          path="/fornecedor/login"
          element={<FornecedorLogin />}
        />

        <Route
          path="/fornecedor"
          element={<FornecedorPortal />}
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}