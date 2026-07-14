import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@email.com");
  const [password, setPassword] = useState("123456");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setErro("");
    setCarregando(true);

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
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[500px_1fr]">
        {/* Lado Esquerdo */}
        <section className="flex items-center justify-center bg-white px-8 py-12 border-r border-slate-200">
          <div className="w-full max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Acesso Institucional
            </p>

            <h1 className="mt-3 text-4xl font-bold text-slate-900 leading-tight">
              Sistema de Gestão de Compras
            </h1>

            <p className="mt-4 text-slate-500 leading-7">
              Utilize suas credenciais para acessar o ambiente administrativo da
              Prefeitura Municipal de General Carneiro.
            </p>

            {erro && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  E-mail
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@prefeitura.pr.gov.br"
                    className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Senha
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-700"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-11 pr-12 py-3 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 py-3 font-semibold text-white transition hover:bg-blue-950"
              >
                {carregando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Entrar no Sistema
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 rounded-xl bg-slate-50 p-5">
              <div className="flex gap-3">
                <ShieldCheck className="text-blue-700" size={20} />

                <p className="text-sm leading-6 text-slate-500">
                  O acesso é restrito aos usuários autorizados pela Prefeitura
                  Municipal de General Carneiro.
                </p>
              </div>
            </div>

            <p className="mt-10 text-center text-xs text-slate-400">
              © 2026 Prefeitura Municipal de General Carneiro - PR
            </p>
          </div>
        </section>

        {/* Lado Direito */}
        <section className="relative hidden overflow-hidden bg-blue-950 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.25),_transparent_45%)]"></div>

          <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>

          <div className="relative p-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
              <Building2 size={15} />
              Administração Pública Municipal
            </div>

            <div className="mt-20 max-w-xl">
              <div className="mb-6 inline-flex rounded-2xl bg-white/10 p-4">
                <ShieldCheck className="text-white" size={34} />
              </div>

              <h2 className="text-5xl font-bold leading-tight text-white">
                Gestão pública com organização, segurança e transparência
              </h2>

              <p className="mt-6 text-lg leading-8 text-blue-100">
                Centralize informações das compras públicas, acompanhe demandas,
                fornecedores, orçamentos e resultados em um único ambiente.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {[
                  "Gestão de demandas",
                  "Formação de orçamentos",
                  "Cadastro de fornecedores",
                  "Julgamento e resultados",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <CheckCircle2 size={18} className="text-blue-300" />

                    <span className="text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/10 px-14 py-6 text-sm text-blue-200 flex justify-between">
            <span>Sistema Institucional de Compras Públicas</span>
            <span>Ambiente seguro e controlado</span>
          </div>
        </section>
      </div>
    </main>
  );
}