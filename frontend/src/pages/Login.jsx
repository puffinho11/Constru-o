import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          "E-mail ou senha inválidos."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-900 text-lg font-bold text-white">
            GC
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Sistema de Gestão de Compras
          </h1>

          <p className="mt-2 text-slate-500">
            Prefeitura Municipal de General Carneiro - PR
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          autoComplete="off"
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="mb-1 text-xl font-semibold text-slate-900">
            Acesso ao Sistema
          </h2>

          <p className="mb-6 text-sm text-slate-500">
            Informe suas credenciais para continuar.
          </p>

          {erro && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Senha
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {mostrarSenha ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 py-3 font-semibold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Entrar
                </>
              )}
            </button>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-center text-xs text-slate-500">
              Acesso restrito aos usuários autorizados.
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 Prefeitura Municipal de General Carneiro - PR
        </p>
      </div>
    </main>
  );
}