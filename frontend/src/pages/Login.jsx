import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@email.com");
  const [password, setPassword] = useState("123456");
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      setErro("E-mail ou senha inválidos.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-100"
      >
        <div className="mb-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white">
            GC
          </div>

          <h1 className="text-3xl font-black text-emerald-950">
            Credenciamento
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Acesse o sistema de materiais de construção
          </p>
        </div>

        {erro && (
          <div className="mb-5 rounded-2xl bg-red-100 px-4 py-3 text-sm font-black text-red-700">
            {erro}
          </div>
        )}

        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-black text-slate-700">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-2xl bg-emerald-600 p-4 text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700"
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}