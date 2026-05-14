import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const [telaAtual, setTelaAtual] = useState("painel")

  const [secretarias, setSecretarias] = useState([])

  const [mostrarFormSecretaria, setMostrarFormSecretaria] =
    useState(false)

  const [secretariaEditando, setSecretariaEditando] =
    useState(null)

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

  async function carregarSecretarias() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/secretarias",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      const data = await response.json()

      setSecretarias(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    carregarSecretarias()
  }, [])

  async function salvarSecretaria(e) {
    e.preventDefault()

    const form = e.currentTarget

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

      await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify(dados),
      })

      form.reset()

      setSecretariaEditando(null)

      setMostrarFormSecretaria(false)

      carregarSecretarias()
    } catch (error) {
      console.log(error)
    }
  }

  async function excluirSecretaria(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta secretaria?"
    )

    if (!confirmar) return

    try {
      await fetch(`http://localhost:5000/api/secretarias/${id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      carregarSecretarias()
    } catch (error) {
      console.log(error)
    }
  }

  function abrirCadastroSecretaria() {
    setSecretariaEditando(null)

    setMostrarFormSecretaria(true)
  }

  function editarSecretaria(secretaria) {
    setSecretariaEditando(secretaria)

    setMostrarFormSecretaria(true)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function cancelarFormularioSecretaria() {
    setSecretariaEditando(null)

    setMostrarFormSecretaria(false)
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
    setMateriais(
      materiais.filter((item) => item.id !== id)
    )
  }

  function alterarItem(id, campo, valor) {
    setMateriais(
      materiais.map((item) =>
        item.id === id
          ? { ...item, [campo]: valor }
          : item
      )
    )
  }

  function sair() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    navigate("/")
  }

  const Header = ({
    tag,
    title,
    desc,
    button,
    onClick,
  }) => (
    <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-2 text-[10px] font-black text-emerald-700">
          {tag}
        </span>

        <h1 className="text-4xl font-black tracking-tight text-emerald-950">
          {title}
        </h1>

        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-500">
          {desc}
        </p>
      </div>

      {button && (
        <button
          onClick={onClick}
          className="rounded-2xl bg-emerald-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700"
        >
          {button}
        </button>
      )}
    </div>
  )

  const Panel = ({ title, children }) => (
    <div className="mb-7 rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
      <h2 className="text-2xl font-black text-emerald-950">
        {title}
      </h2>

      {children}
    </div>
  )
  function Painel() {
  return (
    <>
      <Header
        tag="Visão geral"
        title="Painel Inicial"
        desc="Controle completo das demandas, orçamentos, fornecedores, propostas e resultados do credenciamento."
        button="Abrir Nova Demanda"
        onClick={() => setTelaAtual("demanda")}
      />

      <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-emerald-100" />

          <span className="text-xs text-slate-500">
            Demandas abertas
          </span>

          <strong className="relative mt-2 mb-2 block text-4xl font-black text-emerald-950">
            0
          </strong>

          <small className="relative text-xs text-slate-400">
            Nenhuma demanda cadastrada
          </small>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-emerald-100" />

          <span className="text-xs text-slate-500">
            Secretarias ativas
          </span>

          <strong className="relative mt-2 mb-2 block text-4xl font-black text-emerald-950">
            {secretarias.length}
          </strong>

          <small className="relative text-xs text-slate-400">
            Secretarias cadastradas no sistema
          </small>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-emerald-100" />

          <span className="text-xs text-slate-500">
            Fornecedores
          </span>

          <strong className="relative mt-2 mb-2 block text-4xl font-black text-emerald-950">
            0
          </strong>

          <small className="relative text-xs text-slate-400">
            Nenhum fornecedor cadastrado
          </small>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-red-100" />

          <span className="text-xs text-slate-500">
            Pendências
          </span>

          <strong className="relative mt-2 mb-2 block text-4xl font-black text-red-600">
            0
          </strong>

          <small className="relative text-xs text-slate-400">
            Nenhuma pendência no momento
          </small>
        </div>
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
              [
                "01",
                "Demanda",
                "Secretaria informa os materiais necessários.",
              ],

              [
                "02",
                "Orçamento",
                "Itens são organizados e conferidos.",
              ],

              [
                "03",
                "Solicitação",
                "Envio para fornecedores credenciados.",
              ],

              [
                "04",
                "Propostas",
                "Recebimento e análise das cotações.",
              ],

              [
                "05",
                "Resultado",
                "Classificação e relatório final.",
              ],
            ].map((item) => (
              <div
                key={item[0]}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white">
                  {item[0]}
                </div>

                <h3 className="mt-5 text-xl font-black text-emerald-950">
                  {item[1]}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {item[2]}
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

          <div className="mt-6 grid gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />

              <span className="text-sm font-medium text-slate-600">
                Nenhum alerta registrado no momento.
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
          <h2 className="text-2xl font-black text-emerald-950">
            Atividades Recentes
          </h2>

          <div className="mt-6 grid gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <strong className="text-sm text-emerald-700">
                  Hoje
                </strong>

                <p className="mt-1 text-sm text-slate-500">
                  Nenhuma movimentação registrada ainda.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
          <h2 className="text-2xl font-black text-emerald-950">
            Resumo Financeiro Parcial
          </h2>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <span className="text-xs text-slate-500">
                Valor de referência
              </span>

              <strong className="mt-2 block text-3xl font-black text-emerald-950">
                R$ 0,00
              </strong>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <span className="text-xs text-slate-500">
                Menores propostas
              </span>

              <strong className="mt-2 block text-3xl font-black text-emerald-950">
                R$ 0,00
              </strong>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <span className="text-xs text-slate-500">
                Economia estimada
              </span>

              <strong className="mt-2 block text-3xl font-black text-emerald-700">
                R$ 0,00
              </strong>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
function SecretariasPage() {
  return (
    <>
      <Header
        tag="Gestão interna"
        title="Secretarias Participantes"
        desc="Cadastro e acompanhamento das secretarias autorizadas a abrir demandas."
        button="Cadastrar Secretaria"
        onClick={abrirCadastroSecretaria}
      />

      {mostrarFormSecretaria && (
        <Panel
          title={
            secretariaEditando
              ? "Editar Secretaria"
              : "Nova Secretaria"
          }
        >
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
                {secretariaEditando
                  ? "Salvar Alterações"
                  : "Salvar Secretaria"}
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
      )
}
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
                          onClick={() =>
                            editarSecretaria(secretaria)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-700 transition hover:bg-blue-200"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirSecretaria(secretaria._id)
                          }
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
}
function NovaDemandaPage() {
  return (
    <>
      <Header
        tag="Abertura da necessidade"
        title="Nova Demanda"
        desc="Cadastro profissional da solicitação de materiais pelas secretarias municipais."
        button="Salvar Demanda"
      />

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.5fr_0.7fr]">
        <div>
          <Panel title="Informações da Demanda">
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Secretaria Solicitante

                <select className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100">
                  <option>
                    Selecione a secretaria
                  </option>

                  {secretarias.map((secretaria) => (
                    <option key={secretaria._id}>
                      {secretaria.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                Responsável pela Solicitação

                <input
                  type="text"
                  placeholder="Nome do responsável"
                  className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                Número da Demanda

                <input
                  type="text"
                  placeholder="Ex: 004/2026"
                  className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                Prioridade

                <select className="rounded-2xl border border-slate-300 bg-white p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100">
                  <option>Normal</option>

                  <option>Urgente</option>

                  <option>Emergencial</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
                Objeto da Solicitação

                <input
                  type="text"
                  placeholder="Ex: Aquisição de materiais de construção para manutenção predial"
                  className="rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
                Justificativa da Necessidade

                <textarea
                  rows="6"
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
                        onClick={() =>
                          removerItem(material.id)
                        }
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
                          alterarItem(
                            material.id,
                            "item",
                            e.target.value
                          )
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
                          alterarItem(
                            material.id,
                            "quantidade",
                            e.target.value
                          )
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
                          alterarItem(
                            material.id,
                            "unidade",
                            e.target.value
                          )
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
                          alterarItem(
                            material.id,
                            "observacao",
                            e.target.value
                          )
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
}
function TelaPadrao({ titulo, tag, descricao }) {
  return (
    <>
      <Header
        tag={tag}
        title={titulo}
        desc={descricao}
        button="Novo Cadastro"
      />

      <Panel title="Nenhum registro cadastrado">
        <p className="mt-3 text-sm text-slate-500">
          Quando houver informações cadastradas no sistema,
          elas aparecerão aqui automaticamente.
        </p>
      </Panel>
    </>
  )
}

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
          onClick={sair}
          className="mt-3 rounded-2xl bg-red-500 p-4 text-sm font-black text-white transition hover:bg-red-600"
        >
          Sair
        </button>
      </div>
    </aside>
        <main className="ml-60 p-8">
      {telaAtual === "painel" && <Painel />}

      {telaAtual === "secretarias" && (
        <SecretariasPage />
      )}

      {telaAtual === "demanda" && (
        <NovaDemandaPage />
      )}

      {telaAtual === "orcamento" && (
        <TelaPadrao
          titulo="Orçamento da Secretaria"
          tag="Itens e quantitativos"
          descricao="Cadastro dos materiais, quantidades e finalidade de uso."
        />
      )}

      {telaAtual === "solicitacao" && (
        <TelaPadrao
          titulo="Solicitação aos Fornecedores"
          tag="Envio de cotação"
          descricao="Preparação e envio da solicitação de orçamento."
        />
      )}

      {telaAtual === "fornecedores" && (
        <TelaPadrao
          titulo="Fornecedores Credenciados"
          tag="Cadastro externo"
          descricao="Empresas aptas a receber pedidos de orçamento."
        />
      )}

      {telaAtual === "propostas" && (
        <TelaPadrao
          titulo="Propostas Recebidas"
          tag="Recebimento"
          descricao="Controle das cotações encaminhadas."
        />
      )}

      {telaAtual === "julgamento" && (
        <TelaPadrao
          titulo="Julgamento"
          tag="Classificação"
          descricao="Classificação das propostas válidas."
        />
      )}

      {telaAtual === "resultado" && (
        <TelaPadrao
          titulo="Resultado Final"
          tag="Finalização"
          descricao="Apuração dos fornecedores vencedores."
        />
      )}

      {telaAtual === "arquivos" && (
        <TelaPadrao
          titulo="Arquivos do Processo"
          tag="Documentos"
          descricao="Organização dos documentos do credenciamento."
        />
      )}
    </main>
  </div>
)
}