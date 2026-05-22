import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Header({ tag, title, desc, button, onClick }) {
  return (
    <div className="mb-7 flex items-center justify-between">
      <div>
        <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-2 text-[10px] font-black text-emerald-700">
          {tag}
        </span>

        <h1 className="text-4xl font-black text-emerald-950">
          {title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {desc}
        </p>
      </div>

      {button && (
        <button
          type="button"
          onClick={onClick}
          className="rounded-2xl bg-emerald-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700"
        >
          {button}
        </button>
      )}
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="mb-7 rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
      <h2 className="text-2xl font-black text-emerald-950">
        {title}
      </h2>

      {children}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const [telaAtual, setTelaAtual] = useState("painel")
  const [secretarias, setSecretarias] = useState([])
  const [demandas, setDemandas] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [mostrarFormFornecedor, setMostrarFormFornecedor] = useState(false)
  const [fornecedorEditando, setFornecedorEditando] = useState(null)
  const [buscaFornecedor, setBuscaFornecedor] = useState("")
  const [demandaOrcamentoId, setDemandaOrcamentoId] = useState("")
  const [valoresOrcamento, setValoresOrcamento] = useState({})
  const [mostrarFormSecretaria, setMostrarFormSecretaria] = useState(false)
  const [secretariaEditando, setSecretariaEditando] = useState(null)

  const [demanda, setDemanda] = useState({
    secretaria: "",
    responsavel: "",
    numeroDemanda: "",
    prioridade: "Normal",
    objeto: "",
    justificativa: "",
  })

  const [materiais, setMateriais] = useState([
    {
      id: 1,
      item: "",
      quantidade: "",
      unidade: "",
      observacao: "",
    },
  ])

  const menu = [
    ["painel", "Painel Inicial"],
    ["secretarias", "Secretarias"],
    ["demanda", "Nova Demanda"],
    ["orcamento", "Orçamento"],
    ["solicitacao", "Solicitação"],
    ["fornecedores", "Fornecedores"],
    ["propostas", "Propostas"],
    ["julgamento", "Julgamento"],
    ["resultado", "Resultado"],
    ["arquivos", "Arquivos"],
  ]

  useEffect(() => {
    carregarSecretarias()
    carregarDemandas()
    carregarFornecedores()
  }, [])

  async function carregarSecretarias() {
    try {
      const response = await fetch("http://localhost:5000/api/secretarias", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      setSecretarias(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log(error)
    }
  }

  async function carregarDemandas() {
    try {
      const response = await fetch("http://localhost:5000/api/demandas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      setDemandas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log(error)
    }
  }

  async function carregarFornecedores() {
    try {
      const response = await fetch("http://localhost:5000/api/fornecedores", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      setFornecedores(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log(error)
    }
  }

  async function salvarSecretaria(e) {
    e.preventDefault()

    const form = e.target

    const dados = {
      nome: form.nome.value,
      responsavel: form.responsavel.value,
      email: form.email.value,
      telefone: form.telefone.value,
    }

    try {
      const url = secretariaEditando
        ? `http://localhost:5000/api/secretarias/${secretariaEditando._id}`
        : "http://localhost:5000/api/secretarias"

      const method = secretariaEditando ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dados),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar secretaria")
      }

      await carregarSecretarias()

      setMostrarFormSecretaria(false)
      setSecretariaEditando(null)
    } catch (error) {
      console.log(error)
      alert("Erro ao salvar secretaria")
    }
  }

  function editarSecretaria(secretaria) {
    setSecretariaEditando(secretaria)
    setMostrarFormSecretaria(true)
  }

  function cancelarFormularioSecretaria() {
    setSecretariaEditando(null)
    setMostrarFormSecretaria(false)
  }

  async function excluirSecretaria(id) {
    const confirmar = confirm("Deseja realmente excluir esta secretaria?")

    if (!confirmar) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/secretarias/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir secretaria")
      }

      await carregarSecretarias()
    } catch (error) {
      console.log(error)
      alert("Erro ao excluir secretaria")
    }
  }

  function adicionarItem() {
    setMateriais([
      ...materiais,
      {
        id: Date.now(),
        item: "",
        quantidade: "",
        unidade: "",
        observacao: "",
      },
    ])
  }

  function removerItem(id) {
    setMateriais(materiais.filter((item) => item.id !== id))
  }

  function alterarItem(id, campo, valor) {
    setMateriais((old) =>
      old.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    )
  }

  async function salvarDemanda() {
    try {
      const response = await fetch("http://localhost:5000/api/demandas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          numeroDemanda: demanda.numeroDemanda,
          secretaria: demanda.secretaria,
          responsavel: demanda.responsavel,
          prioridade: demanda.prioridade,
          objeto: demanda.objeto,
          justificativa: demanda.justificativa,
          materiais,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.erro || "Erro ao salvar demanda")
        return
      }

      alert("Demanda salva com sucesso")

      await carregarDemandas()

      setDemanda({
        secretaria: "",
        responsavel: "",
        numeroDemanda: "",
        prioridade: "Normal",
        objeto: "",
        justificativa: "",
      })

      setMateriais([
        {
          id: 1,
          item: "",
          quantidade: "",
          unidade: "",
          observacao: "",
        },
      ])

      setTelaAtual("painel")
    } catch (error) {
      console.log(error)
      alert("Erro ao salvar demanda")
    }
  }


  async function excluirDemanda(id) {
    const confirmar = confirm("Deseja realmente excluir esta demanda?")

    if (!confirmar) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/demandas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir demanda")
      }

      await carregarDemandas()
    } catch (error) {
      console.log(error)
      alert("Erro ao excluir demanda")
    }
  }

  async function salvarFornecedor(e) {
    e.preventDefault()

    const form = e.target

    const dados = {
      empresa: form.empresa.value,
      cnpj: form.cnpj.value,
      responsavel: form.responsavel.value,
      email: form.email.value,
      telefone: form.telefone.value,
      cidade: form.cidade.value,
      materiais: form.materiais.value,
      status: form.status.value,
    }

    try {
      const url = fornecedorEditando
        ? `http://localhost:5000/api/fornecedores/${fornecedorEditando._id}`
        : "http://localhost:5000/api/fornecedores"

      const method = fornecedorEditando ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dados),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.erro || "Erro ao salvar fornecedor")
        return
      }

      await carregarFornecedores()

      setFornecedorEditando(null)
      setMostrarFormFornecedor(false)
    } catch (error) {
      console.log(error)
      alert("Erro ao salvar fornecedor")
    }
  }

  function editarFornecedor(fornecedor) {
    setFornecedorEditando(fornecedor)
    setMostrarFormFornecedor(true)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function cancelarFormularioFornecedor() {
    setFornecedorEditando(null)
    setMostrarFormFornecedor(false)
  }

  async function excluirFornecedor(id) {
    const confirmar = confirm("Deseja realmente excluir este fornecedor?")

    if (!confirmar) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/fornecedores/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir fornecedor")
      }

      await carregarFornecedores()
    } catch (error) {
      console.log(error)
      alert("Erro ao excluir fornecedor")
    }
  }

  const fornecedoresFiltrados = fornecedores.filter((fornecedor) => {
    const termo = buscaFornecedor.toLowerCase()

    return (
      (fornecedor.empresa || "").toLowerCase().includes(termo) ||
      (fornecedor.cnpj || "").toLowerCase().includes(termo) ||
      (fornecedor.responsavel || "").toLowerCase().includes(termo) ||
      (fornecedor.materiais || "").toLowerCase().includes(termo)
    )
  })


  function sair() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const Painel = (
    <>
      <Header
        tag="Visão geral"
        title="Painel Inicial"
        desc="Controle completo das demandas, orçamentos, fornecedores, propostas e resultados do credenciamento."
        button="Abrir Nova Demanda"
        onClick={() => setTelaAtual("demanda")}
      />

      <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {[
          ["Demandas abertas", demandas.length, "Demandas cadastradas no sistema", "emerald"],
          ["Secretarias ativas", secretarias.length, "Secretarias cadastradas no sistema", "emerald"],
          ["Fornecedores", "0", "Nenhum fornecedor cadastrado", "emerald"],
          ["Pendências", "0", "Nenhuma pendência no momento", "red"],
        ].map(([titulo, valor, texto, cor]) => (
          <div
            key={titulo}
            className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl"
          >
            <div
              className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full ${
                cor === "red" ? "bg-red-100" : "bg-emerald-100"
              }`}
            />

            <span className="text-xs text-slate-500">
              {titulo}
            </span>

            <strong
              className={`relative mt-2 mb-2 block text-4xl font-black ${
                cor === "red" ? "text-red-600" : "text-emerald-950"
              }`}
            >
              {valor}
            </strong>

            <small className="relative text-xs text-slate-400">
              {texto}
            </small>
          </div>
        ))}
      </div>

      <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-emerald-950">
                Fluxo do Processo
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Acompanhamento das fases principais do credenciamento.
              </p>
            </div>

            <span className="rounded-full bg-emerald-100 px-4 py-2 text-[10px] font-black text-emerald-700">
              Aguardando cadastros
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {[
              ["01", "Demanda", "Secretaria informa os materiais necessários."],
              ["02", "Orçamento", "Itens são organizados e conferidos."],
              ["03", "Solicitação", "Envio para fornecedores credenciados."],
              ["04", "Propostas", "Recebimento e análise das cotações."],
              ["05", "Resultado", "Classificação e relatório final."],
            ].map(([numero, titulo, texto]) => (
              <div
                key={numero}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white">
                  {numero}
                </div>

                <h3 className="mt-5 text-xl font-black text-emerald-950">
                  {titulo}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
          <h2 className="text-2xl font-black text-emerald-950">
            Alertas do Sistema
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pontos que precisam de atenção.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />

            <span className="text-sm font-medium text-slate-600">
              Nenhum alerta registrado no momento.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
          <h2 className="text-2xl font-black text-emerald-950">
            Atividades Recentes
          </h2>

          <div className="mt-6 grid gap-3">
            {demandas.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <strong className="text-sm text-emerald-700">
                  Hoje
                </strong>

                <p className="mt-1 text-sm text-slate-500">
                  Nenhuma movimentação registrada ainda.
                </p>
              </div>
            ) : (
              demandas.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <strong className="text-sm text-emerald-700">
                        Demanda {item.numeroDemanda}
                      </strong>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {item.objeto}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Secretaria: {item.secretaria || "Não informada"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => excluirDemanda(item._id)}
                      className="rounded-xl bg-red-100 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-200"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
          <h2 className="text-2xl font-black text-emerald-950">
            Resumo Financeiro Parcial
          </h2>

          <div className="mt-6 grid gap-4">
            {[
              ["Valor de referência", "R$ 0,00"],
              ["Menores propostas", "R$ 0,00"],
              ["Economia estimada", "R$ 0,00"],
            ].map(([titulo, valor]) => (
              <div
                key={titulo}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <span className="text-xs text-slate-500">
                  {titulo}
                </span>

                <strong className="mt-2 block text-3xl font-black text-emerald-950">
                  {valor}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )

  const SecretariasPage = (
    <>
      <Header
        tag="Gestão interna"
        title="Secretarias Participantes"
        desc="Cadastro e acompanhamento das secretarias autorizadas a abrir demandas."
        button="Cadastrar Secretaria"
        onClick={() => {
          setSecretariaEditando(null)
          setMostrarFormSecretaria(true)
        }}
      />

      {mostrarFormSecretaria && (
        <Panel title={secretariaEditando ? "Editar Secretaria" : "Nova Secretaria"}>
          <form
            key={secretariaEditando?._id || "nova-secretaria"}
            onSubmit={salvarSecretaria}
            className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Nome da Secretaria

              <input
                name="nome"
                type="text"
                defaultValue={secretariaEditando?.nome || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="Ex: Secretaria de Obras"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Responsável

              <input
                name="responsavel"
                type="text"
                defaultValue={secretariaEditando?.responsavel || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="Nome do responsável"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              E-mail

              <input
                name="email"
                type="email"
                defaultValue={secretariaEditando?.email || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="email@prefeitura.pr.gov.br"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Telefone

              <input
                name="telefone"
                type="text"
                defaultValue={secretariaEditando?.telefone || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="(42) 99999-9999"
              />
            </label>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-emerald-600 p-4 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
              >
                {secretariaEditando ? "Salvar Alterações" : "Salvar Secretaria"}
              </button>

              <button
                type="button"
                onClick={cancelarFormularioSecretaria}
                className="rounded-2xl bg-slate-200 px-6 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title="Secretarias Cadastradas">
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Secretaria
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Responsável
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  E-mail
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Telefone
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wide text-emerald-950">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {secretarias.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    Nenhuma secretaria cadastrada.
                  </td>
                </tr>
              ) : (
                secretarias.map((secretaria) => (
                  <tr
                    key={secretaria._id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-5 text-sm font-bold text-slate-700">
                      {secretaria.nome}
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {secretaria.responsavel}
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {secretaria.email}
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {secretaria.telefone || "-"}
                    </td>

                    <td className="px-5 py-5">
                      <span className="rounded-full bg-emerald-100 px-3 py-2 text-[10px] font-black text-emerald-700">
                        Ativa
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => editarSecretaria(secretaria)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-700 transition hover:bg-blue-200"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() => excluirSecretaria(secretaria._id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-lg font-black text-red-700 transition hover:bg-red-200"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )

  const NovaDemandaPage = (
    <>
      <Header
        tag="Abertura da necessidade"
        title="Nova Demanda"
        desc="Cadastro profissional da solicitação de materiais pelas secretarias municipais."
        button="Salvar Demanda"
        onClick={salvarDemanda}
      />

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.5fr_0.7fr]">
        <div>
          <Panel title="Informações da Demanda">
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Secretaria Solicitante

                <select
                  value={demanda.secretaria}
                  onChange={(e) =>
                    setDemanda({
                      ...demanda,
                      secretaria: e.target.value,
                    })
                  }
                  className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">
                    Selecione a secretaria
                  </option>

                  {secretarias.map((secretaria) => (
                    <option
                      key={secretaria._id}
                      value={secretaria.nome}
                    >
                      {secretaria.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                Responsável pela Solicitação

                <input
                  type="text"
                  value={demanda.responsavel}
                  onChange={(e) =>
                    setDemanda({
                      ...demanda,
                      responsavel: e.target.value,
                    })
                  }
                  placeholder="Nome do responsável"
                  className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                Número da Demanda

                <input
                  type="text"
                  value={demanda.numeroDemanda}
                  onChange={(e) =>
                    setDemanda({
                      ...demanda,
                      numeroDemanda: e.target.value,
                    })
                  }
                  placeholder="Ex: 004/2026"
                  className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                Prioridade

                <select
                  value={demanda.prioridade}
                  onChange={(e) =>
                    setDemanda({
                      ...demanda,
                      prioridade: e.target.value,
                    })
                  }
                  className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                >
                  <option>Normal</option>
                  <option>Urgente</option>
                  <option>Emergencial</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
                Objeto da Solicitação

                <input
                  type="text"
                  value={demanda.objeto}
                  onChange={(e) =>
                    setDemanda({
                      ...demanda,
                      objeto: e.target.value,
                    })
                  }
                  placeholder="Ex: Aquisição de materiais de construção para manutenção predial"
                  className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
                Justificativa da Necessidade

                <textarea
                  rows="6"
                  value={demanda.justificativa}
                  onChange={(e) =>
                    setDemanda({
                      ...demanda,
                      justificativa: e.target.value,
                    })
                  }
                  placeholder="Descreva a necessidade da contratação..."
                  className="resize-none rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </label>
            </div>
          </Panel>

          <Panel title="Materiais Solicitados">
            <div className="mt-6 grid gap-5">
              {materiais.map((material, index) => (
                <div
                  key={material.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-black text-emerald-950">
                      Item {index + 1}
                    </h3>

                    {materiais.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerItem(material.id)}
                        className="rounded-xl bg-red-100 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-200"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-black text-slate-700">
                      Material

                      <input
                        type="text"
                        value={material.item}
                        onChange={(e) =>
                          alterarItem(material.id, "item", e.target.value)
                        }
                        placeholder="Ex: Cimento CP II"
                        className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-black text-slate-700">
                      Quantidade

                      <input
                        type="number"
                        value={material.quantidade}
                        onChange={(e) =>
                          alterarItem(material.id, "quantidade", e.target.value)
                        }
                        placeholder="0"
                        className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-black text-slate-700">
                      Unidade

                      <select
                        value={material.unidade}
                        onChange={(e) =>
                          alterarItem(material.id, "unidade", e.target.value)
                        }
                        className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      >
                        <option value="">
                          Selecione
                        </option>

                        <option value="UN">
                          Unidade
                        </option>

                        <option value="SC">
                          Saco
                        </option>

                        <option value="M²">
                          M²
                        </option>

                        <option value="M³">
                          M³
                        </option>

                        <option value="CX">
                          Caixa
                        </option>
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-black text-slate-700">
                      Observação

                      <input
                        type="text"
                        value={material.observacao}
                        onChange={(e) =>
                          alterarItem(material.id, "observacao", e.target.value)
                        }
                        placeholder="Detalhes do item"
                        className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={adicionarItem}
                className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
              >
                + Adicionar Novo Item
              </button>
            </div>
          </Panel>
        </div>

        <div>
          <Panel title="Resumo da Demanda">
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-xs text-slate-500">
                  Total de Itens
                </span>

                <strong className="mt-2 block text-3xl font-black text-emerald-950">
                  {materiais.length}
                </strong>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-xs text-slate-500">
                  Status Atual
                </span>

                <strong className="mt-2 block text-lg font-black text-yellow-600">
                  Em elaboração
                </strong>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-xs text-slate-500">
                  Fluxo do Processo
                </span>

                <div className="mt-4 grid gap-3">
                  {[
                    "Cadastro da demanda",
                    "Montagem do orçamento",
                    "Envio aos fornecedores",
                    "Recebimento das propostas",
                    "Julgamento final",
                  ].map((etapa, index) => (
                    <div
                      key={etapa}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
                        {index + 1}
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {etapa}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <span className="text-xs font-black text-emerald-700">
                  Observação
                </span>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Após salvar a demanda, os itens poderão ser encaminhados
                  para a etapa de orçamento e posterior solicitação aos
                  fornecedores credenciados.
                </p>
              </div>

              <button
                type="button"
                onClick={salvarDemanda}
                className="rounded-2xl bg-emerald-600 p-5 text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700"
              >
                Salvar Demanda
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )


  const demandaSelecionadaOrcamento =
    demandas.find((item) => item._id === demandaOrcamentoId) || null

  const materiaisOrcamento = demandaSelecionadaOrcamento?.materiais || []

  function atualizarValorOrcamento(index, valor) {
    setValoresOrcamento((old) => ({
      ...old,
      [index]: valor,
    }))
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function calcularTotalItem(item, index) {
    const quantidade = Number(item.quantidade || 0)
    const valorUnitario = Number(valoresOrcamento[index] || 0)

    return quantidade * valorUnitario
  }

  const totalOrcamento = materiaisOrcamento.reduce((total, item, index) => {
    return total + calcularTotalItem(item, index)
  }, 0)

  async function salvarOrcamento() {
    if (!demandaSelecionadaOrcamento) {
      alert("Selecione uma demanda para montar o orçamento")
      return
    }

    try {
      const itens = materiaisOrcamento.map((item, index) => {
        const valorUnitario = Number(valoresOrcamento[index] || 0)

        return {
          material: item.item,
          quantidade: Number(item.quantidade || 0),
          unidade: item.unidade,
          valorUnitario,
          valorTotal: Number(item.quantidade || 0) * valorUnitario,
        }
      })

      const response = await fetch("http://localhost:5000/api/orcamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          demanda: demandaSelecionadaOrcamento._id,
          numeroDemanda: demandaSelecionadaOrcamento.numeroDemanda,
          secretaria: demandaSelecionadaOrcamento.secretaria,
          itens,
          valorTotalEstimado: totalOrcamento,
          status: "Finalizado",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.erro || "Erro ao salvar orçamento")
        return
      }

      alert("Orçamento salvo com sucesso")
      setDemandaOrcamentoId("")
      setValoresOrcamento({})
    } catch (error) {
      console.log(error)
      alert("Erro ao salvar orçamento")
    }
  }

  const OrcamentoPage = (
    <>
      <Header
        tag="Itens e valores"
        title="Orçamento da Secretaria"
        desc="Selecione uma demanda cadastrada, confira os materiais solicitados e lance os valores unitários para formar o orçamento estimado."
        button="Salvar Orçamento"
        onClick={salvarOrcamento}
      />

      <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <span className="text-xs text-slate-500">
            Demandas disponíveis
          </span>

          <strong className="mt-2 block text-4xl font-black text-emerald-950">
            {demandas.length}
          </strong>

          <small className="text-xs text-slate-400">
            Demandas cadastradas para orçamento
          </small>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <span className="text-xs text-slate-500">
            Itens da demanda
          </span>

          <strong className="mt-2 block text-4xl font-black text-emerald-950">
            {materiaisOrcamento.length}
          </strong>

          <small className="text-xs text-slate-400">
            Materiais selecionados
          </small>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <span className="text-xs text-slate-500">
            Total estimado
          </span>

          <strong className="mt-2 block text-4xl font-black text-emerald-700">
            {formatarMoeda(totalOrcamento)}
          </strong>

          <small className="text-xs text-slate-400">
            Soma dos valores lançados
          </small>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.4fr_.8fr]">
        <div>
          <Panel title="Selecionar Demanda">
            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Demanda

                <select
                  value={demandaOrcamentoId}
                  onChange={(e) => {
                    setDemandaOrcamentoId(e.target.value)
                    setValoresOrcamento({})
                  }}
                  className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">
                    Selecione uma demanda cadastrada
                  </option>

                  {demandas.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.numeroDemanda} - {item.objeto}
                    </option>
                  ))}
                </select>
              </label>

              {!demandaSelecionadaOrcamento && (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                  <strong className="text-sm font-black text-yellow-700">
                    Nenhuma demanda selecionada
                  </strong>

                  <p className="mt-2 text-sm text-slate-600">
                    Para montar o orçamento, primeiro cadastre uma demanda na tela
                    “Nova Demanda” e depois selecione ela aqui.
                  </p>
                </div>
              )}

              {demandaSelecionadaOrcamento && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <strong className="text-sm font-black text-emerald-700">
                    Demanda {demandaSelecionadaOrcamento.numeroDemanda}
                  </strong>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {demandaSelecionadaOrcamento.objeto}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Secretaria: {demandaSelecionadaOrcamento.secretaria || "Não informada"}
                  </p>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Itens para Orçamento">
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                      Material
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                      Quantidade
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                      Unidade
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                      Valor Unitário
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {materiaisOrcamento.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-10 text-center text-sm text-slate-400"
                      >
                        Nenhum item disponível para orçamento.
                      </td>
                    </tr>
                  ) : (
                    materiaisOrcamento.map((item, index) => (
                      <tr
                        key={`${item.item}-${index}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-5 text-sm font-bold text-slate-700">
                          {item.item}
                          {item.observacao && (
                            <p className="mt-1 text-xs font-normal text-slate-400">
                              {item.observacao}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {item.quantidade}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {item.unidade}
                        </td>

                        <td className="px-5 py-5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={valoresOrcamento[index] || ""}
                            onChange={(e) =>
                              atualizarValorOrcamento(index, e.target.value)
                            }
                            className="w-36 rounded-2xl border border-slate-300 p-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                            placeholder="0,00"
                          />
                        </td>

                        <td className="px-5 py-5 text-sm font-black text-emerald-700">
                          {formatarMoeda(calcularTotalItem(item, index))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div>
          <Panel title="Resumo do Orçamento">
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-xs text-slate-500">
                  Demanda selecionada
                </span>

                <strong className="mt-2 block text-lg font-black text-emerald-950">
                  {demandaSelecionadaOrcamento?.numeroDemanda || "Nenhuma"}
                </strong>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-xs text-slate-500">
                  Itens com valor
                </span>

                <strong className="mt-2 block text-3xl font-black text-emerald-950">
                  {
                    materiaisOrcamento.filter((_, index) =>
                      Number(valoresOrcamento[index] || 0) > 0
                    ).length
                  }
                </strong>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <span className="text-xs font-black text-emerald-700">
                  Valor Total Estimado
                </span>

                <strong className="mt-2 block text-4xl font-black text-emerald-700">
                  {formatarMoeda(totalOrcamento)}
                </strong>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="text-xs font-black text-slate-600">
                  Próxima etapa
                </span>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Depois de preencher os valores, o orçamento poderá ser usado
                  como referência para solicitar cotações aos fornecedores.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )

  const FornecedoresPage = (
    <>
      <Header
        tag="Cadastro externo"
        title="Fornecedores Credenciados"
        desc="Cadastro e controle das empresas aptas a receber solicitações de orçamento."
        button="Cadastrar Fornecedor"
        onClick={() => {
          setFornecedorEditando(null)
          setMostrarFormFornecedor(true)
        }}
      />

      <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <span className="text-xs text-slate-500">
            Total de fornecedores
          </span>

          <strong className="mt-2 block text-4xl font-black text-emerald-950">
            {fornecedores.length}
          </strong>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <span className="text-xs text-slate-500">
            Fornecedores ativos
          </span>

          <strong className="mt-2 block text-4xl font-black text-emerald-950">
            {fornecedores.filter((item) => item.status === "Ativo").length}
          </strong>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <span className="text-xs text-slate-500">
            Pendentes/Inativos
          </span>

          <strong className="mt-2 block text-4xl font-black text-red-600">
            {fornecedores.filter((item) => item.status !== "Ativo").length}
          </strong>
        </div>
      </div>

      {mostrarFormFornecedor && (
        <Panel
          title={
            fornecedorEditando
              ? "Editar Fornecedor"
              : "Novo Fornecedor"
          }
        >
          <form
            key={fornecedorEditando?._id || "novo-fornecedor"}
            onSubmit={salvarFornecedor}
            className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Empresa
              <input
                name="empresa"
                type="text"
                defaultValue={fornecedorEditando?.empresa || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="Nome da empresa"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              CNPJ
              <input
                name="cnpj"
                type="text"
                defaultValue={fornecedorEditando?.cnpj || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="00.000.000/0000-00"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Responsável
              <input
                name="responsavel"
                type="text"
                defaultValue={fornecedorEditando?.responsavel || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="Nome do responsável"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              E-mail
              <input
                name="email"
                type="email"
                defaultValue={fornecedorEditando?.email || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="empresa@email.com"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Telefone
              <input
                name="telefone"
                type="text"
                defaultValue={fornecedorEditando?.telefone || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="(42) 99999-9999"
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Cidade
              <input
                name="cidade"
                type="text"
                defaultValue={fornecedorEditando?.cidade || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="Cidade/UF"
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Materiais que fornece
              <input
                name="materiais"
                type="text"
                defaultValue={fornecedorEditando?.materiais || ""}
                className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                placeholder="Ex: cimento, areia, brita, tubos..."
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Status
              <select
                name="status"
                defaultValue={fornecedorEditando?.status || "Ativo"}
                className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              >
                <option>Ativo</option>
                <option>Inativo</option>
                <option>Pendente</option>
              </select>
            </label>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-emerald-600 p-4 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
              >
                {fornecedorEditando
                  ? "Salvar Alterações"
                  : "Salvar Fornecedor"}
              </button>

              <button
                type="button"
                onClick={cancelarFormularioFornecedor}
                className="rounded-2xl bg-slate-200 px-6 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title="Fornecedores Cadastrados">
        <div className="mt-6 mb-5">
          <input
            type="text"
            value={buscaFornecedor}
            onChange={(e) => setBuscaFornecedor(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            placeholder="Buscar por empresa, CNPJ, responsável ou material..."
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Empresa
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  CNPJ
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Responsável
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Contato
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Materiais
                </th>

                <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-emerald-950">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wide text-emerald-950">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {fornecedoresFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    Nenhum fornecedor cadastrado.
                  </td>
                </tr>
              ) : (
                fornecedoresFiltrados.map((fornecedor) => (
                  <tr
                    key={fornecedor._id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-5 text-sm font-bold text-slate-700">
                      {fornecedor.empresa}
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {fornecedor.cnpj}
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {fornecedor.responsavel}
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      <p>{fornecedor.email}</p>
                      <p className="text-xs text-slate-400">
                        {fornecedor.telefone || "-"} · {fornecedor.cidade || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {fornecedor.materiais || "-"}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`rounded-full px-3 py-2 text-[10px] font-black ${
                          fornecedor.status === "Ativo"
                            ? "bg-emerald-100 text-emerald-700"
                            : fornecedor.status === "Pendente"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {fornecedor.status}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => editarFornecedor(fornecedor)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-700 transition hover:bg-blue-200"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() => excluirFornecedor(fornecedor._id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-lg font-black text-red-700 transition hover:bg-red-200"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-slate-900">
      <aside className="fixed left-0 top-0 z-20 flex h-screen w-60 flex-col justify-between overflow-y-auto bg-gradient-to-b from-emerald-950 to-emerald-700 p-5 text-white shadow-2xl">
        <div>
          <div className="flex items-center gap-3 border-b border-white/20 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-emerald-700">
              GC
            </div>

            <div>
              <h2 className="text-lg font-black leading-tight">
                Credenciamento
              </h2>

              <p className="text-[10px] text-white/80">
                Materiais de Construção
              </p>
            </div>
          </div>

          <nav className="mt-7 grid gap-2">
            {menu.map(([id, nome]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTelaAtual(id)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition-all ${
                  telaAtual === id
                    ? "translate-x-1 bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                {nome}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 grid gap-2">
          <small className="text-xs text-white/70">
            Usuário logado
          </small>

          <strong className="text-base">
            {user?.nome || "Administrador"}
          </strong>

          <button
            type="button"
            onClick={sair}
            className="mt-3 rounded-2xl bg-red-500 p-4 text-sm font-black text-white transition hover:bg-red-600"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="ml-60 p-8">
        {telaAtual === "painel" && Painel}

        {telaAtual === "secretarias" && SecretariasPage}

        {telaAtual === "demanda" && NovaDemandaPage}

        {telaAtual === "orcamento" && OrcamentoPage}

        {telaAtual === "solicitacao" && (
          <Panel title="Solicitação">
            <p className="mt-4 text-sm text-slate-500">
              Tela de solicitação em desenvolvimento.
            </p>
          </Panel>
        )}

        {telaAtual === "fornecedores" && FornecedoresPage}

        {telaAtual === "propostas" && (
          <Panel title="Propostas">
            <p className="mt-4 text-sm text-slate-500">
              Tela de propostas em desenvolvimento.
            </p>
          </Panel>
        )}

        {telaAtual === "julgamento" && (
          <Panel title="Julgamento">
            <p className="mt-4 text-sm text-slate-500">
              Tela de julgamento em desenvolvimento.
            </p>
          </Panel>
        )}

        {telaAtual === "resultado" && (
          <Panel title="Resultado">
            <p className="mt-4 text-sm text-slate-500">
              Tela de resultado em desenvolvimento.
            </p>
          </Panel>
        )}

        {telaAtual === "arquivos" && (
          <Panel title="Arquivos">
            <p className="mt-4 text-sm text-slate-500">
              Tela de arquivos em desenvolvimento.
            </p>
          </Panel>
        )}
      </main>
    </div>
  )
}