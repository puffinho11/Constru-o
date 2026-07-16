import { useEffect, useState } from "react"
import { Plus, Save, Trash2, UserCog, Users, Truck, Loader2 } from "lucide-react"

export default function AdminUsuariosPage({ apiUrl, authHeaders, fornecedores = [] }) {
  const [aba, setAba] = useState("internos")
  const [usuarios, setUsuarios] = useState([])
  const [acessos, setAcessos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [formUsuario, setFormUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "Operador",
  })
  const [formFornecedor, setFormFornecedor] = useState({
    fornecedorId: "",
    email: "",
    senha: "",
  })

  async function carregar() {
    setCarregando(true)
    try {
      const [usuariosResponse, acessosResponse] = await Promise.all([
        fetch(`${apiUrl}/admin/usuarios`, { headers: authHeaders() }),
        fetch(`${apiUrl}/admin/fornecedores-acesso`, { headers: authHeaders() }),
      ])

      const usuariosData = await usuariosResponse.json()
      const acessosData = await acessosResponse.json()

      if (!usuariosResponse.ok) {
        throw new Error(usuariosData.erro || "Erro ao carregar usuários.")
      }

      if (!acessosResponse.ok) {
        throw new Error(acessosData.erro || "Erro ao carregar acessos.")
      }

      setUsuarios(Array.isArray(usuariosData) ? usuariosData : [])
      setAcessos(Array.isArray(acessosData) ? acessosData : [])
    } catch (error) {
      alert(error.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function criarUsuario(event) {
    event.preventDefault()

    const response = await fetch(`${apiUrl}/admin/usuarios`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(formUsuario),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.erro || "Erro ao criar usuário.")
      return
    }

    setFormUsuario({
      nome: "",
      email: "",
      senha: "",
      perfil: "Operador",
    })
    await carregar()
  }

  async function criarAcessoFornecedor(event) {
    event.preventDefault()

    const response = await fetch(`${apiUrl}/admin/fornecedores-acesso`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(formFornecedor),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.erro || "Erro ao criar acesso do fornecedor.")
      return
    }

    setFormFornecedor({
      fornecedorId: "",
      email: "",
      senha: "",
    })
    await carregar()
  }

  async function excluirUsuario(id, tipo) {
    if (!confirm("Deseja realmente excluir este acesso?")) return

    const endpoint =
      tipo === "fornecedor"
        ? `${apiUrl}/admin/fornecedores-acesso/${id}`
        : `${apiUrl}/admin/usuarios/${id}`

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: authHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.erro || "Erro ao excluir.")
      return
    }

    await carregar()
  }

  return (
    <>
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Controle de acesso
        </p>
        <h1 className="text-3xl font-bold text-slate-950">Administração de usuários</h1>
        <p className="mt-2 text-sm text-slate-500">
          Crie usuários internos e logins exclusivos para fornecedores.
        </p>
      </div>

      <div className="mb-6 flex gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <button
          type="button"
          onClick={() => setAba("internos")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
            aba === "internos" ? "bg-blue-600 text-white" : "text-slate-600"
          }`}
        >
          <Users size={17} />
          Usuários internos
        </button>

        <button
          type="button"
          onClick={() => setAba("fornecedores")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
            aba === "fornecedores" ? "bg-blue-600 text-white" : "text-slate-600"
          }`}
        >
          <Truck size={17} />
          Acessos de fornecedores
        </button>
      </div>

      {aba === "internos" ? (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form
            onSubmit={criarUsuario}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-slate-900">Novo usuário interno</h2>

            <div className="mt-5 space-y-4">
              <input
                value={formUsuario.nome}
                onChange={(e) =>
                  setFormUsuario({ ...formUsuario, nome: e.target.value })
                }
                placeholder="Nome completo"
                className="h-11 w-full rounded-xl border border-slate-300 px-3.5"
                required
              />

              <input
                type="email"
                value={formUsuario.email}
                onChange={(e) =>
                  setFormUsuario({ ...formUsuario, email: e.target.value })
                }
                placeholder="E-mail"
                className="h-11 w-full rounded-xl border border-slate-300 px-3.5"
                required
              />

              <input
                type="password"
                value={formUsuario.senha}
                onChange={(e) =>
                  setFormUsuario({ ...formUsuario, senha: e.target.value })
                }
                placeholder="Senha inicial"
                className="h-11 w-full rounded-xl border border-slate-300 px-3.5"
                required
              />

              <select
                value={formUsuario.perfil}
                onChange={(e) =>
                  setFormUsuario({ ...formUsuario, perfil: e.target.value })
                }
                className="h-11 w-full rounded-xl border border-slate-300 px-3.5"
              >
                <option>Administrador</option>
                <option>Operador</option>
                <option>Consulta</option>
              </select>

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white">
                <Save size={17} />
                Criar usuário
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Usuários cadastrados</h2>
            </div>

            {carregando ? (
              <Loader2 className="m-8 animate-spin text-blue-600" />
            ) : (
              <div className="divide-y divide-slate-100">
                {usuarios.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-semibold text-slate-900">{item.nome}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                      <p className="mt-1 text-xs text-blue-700">{item.perfil}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => excluirUsuario(item._id, "interno")}
                      className="rounded-lg border border-red-200 p-2 text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form
            onSubmit={criarAcessoFornecedor}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-slate-900">Novo login de fornecedor</h2>

            <div className="mt-5 space-y-4">
              <select
                value={formFornecedor.fornecedorId}
                onChange={(e) => {
                  const fornecedor = fornecedores.find(
                    (item) => item._id === e.target.value
                  )

                  setFormFornecedor({
                    ...formFornecedor,
                    fornecedorId: e.target.value,
                    email: fornecedor?.email || "",
                  })
                }}
                className="h-11 w-full rounded-xl border border-slate-300 px-3.5"
                required
              >
                <option value="">Selecione o fornecedor</option>
                {fornecedores.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.empresa} - {item.email}
                  </option>
                ))}
              </select>

              <input
                type="email"
                value={formFornecedor.email}
                onChange={(e) =>
                  setFormFornecedor({ ...formFornecedor, email: e.target.value })
                }
                placeholder="E-mail de acesso"
                className="h-11 w-full rounded-xl border border-slate-300 px-3.5"
                required
              />

              <input
                type="password"
                value={formFornecedor.senha}
                onChange={(e) =>
                  setFormFornecedor({ ...formFornecedor, senha: e.target.value })
                }
                placeholder="Senha inicial"
                className="h-11 w-full rounded-xl border border-slate-300 px-3.5"
                required
              />

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white">
                <Save size={17} />
                Criar login
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Fornecedores com acesso</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {acessos.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.fornecedor?.empresa || "Fornecedor"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => excluirUsuario(item._id, "fornecedor")}
                    className="rounded-lg border border-red-200 p-2 text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
