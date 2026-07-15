import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CotacaoPublica from "./pages/CotacaoPublica";
import PrivateRoute from "./routes/PrivateRoute";
import "./style.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/cotacao/:token"
          element={<CotacaoPublica />}
        />
      </Routes>
    </BrowserRouter>
  );
}