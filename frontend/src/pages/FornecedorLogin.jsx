import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2, Loader2, LockKeyhole, Mail } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function FornecedorLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")

  async function entrar(event) {
    event.preventDefault()
    setCarregando(true)
    setErro("")

    try {
      const response = await fetch(`${API_URL}/fornecedor-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "E-mail ou senha inválidos.")
      }

      localStorage.setItem("fornecedorToken", data.token)
      localStorage.setItem("fornecedor", JSON.stringify(data.fornecedor))
      navigate("/fornecedor")
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <form
        onSubmit={entrar}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-950 text-white">
          <Building2 size={26} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-950">
          Portal do fornecedor
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Acesse seus resultados, empenhos e mensagens da Prefeitura de General Carneiro.
        </p>

        {erro && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4"
              required
            />
          </div>

          <div className="relative">
            <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4"
              required
            />
          </div>

          <button
            disabled={carregando}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 font-semibold text-white"
          >
            {carregando && <Loader2 className="animate-spin" size={18} />}
            Entrar
          </button>
        </div>
      </form>
    </main>
  )
}
