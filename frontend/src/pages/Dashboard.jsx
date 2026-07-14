import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  FilePlus2,
  Calculator,
  Send,
  Truck,
  ClipboardList,
  Scale,
  Trophy,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  FileText,
  CircleDollarSign,
  Users,
  PackageSearch,
  ArrowRight,
  Bell,
  Filter,
  Save,
  Loader2,
  Upload,
  Download,
  Paperclip,
  FileCheck2,
  CircleX,
  ChevronRight,
  CalendarDays,
  BarChart3,
  RefreshCw,
  MoreHorizontal,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  Boxes,
  ListChecks,
  Gavel,
  Award,
  Archive,
  Copy,
  ExternalLink,
} from "lucide-react"

const API_URL = "http://localhost:5000/api"

function authHeaders(contentType = false) {
  return {
    ...(contentType ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function formatarData(data) {
  if (!data) return "-"
  const valor = new Date(data)
  if (Number.isNaN(valor.getTime())) return data
  return valor.toLocaleDateString("pt-BR")
}

function StatusBadge({ status = "Em andamento" }) {
  const normalized = String(status).toLowerCase()

  let style = "bg-blue-50 text-blue-700 ring-blue-200"

  if (
    normalized.includes("final") ||
    normalized.includes("ativo") ||
    normalized.includes("aprovado") ||
    normalized.includes("vencedor")
  ) {
    style = "bg-emerald-50 text-emerald-700 ring-emerald-200"
  } else if (
    normalized.includes("urgente") ||
    normalized.includes("emergencial") ||
    normalized.includes("inativo") ||
    normalized.includes("reprovado") ||
    normalized.includes("cancelado")
  ) {
    style = "bg-red-50 text-red-700 ring-red-200"
  } else if (
    normalized.includes("pendente") ||
    normalized.includes("análise") ||
    normalized.includes("aguardando")
  ) {
    style = "bg-amber-50 text-amber-700 ring-amber-200"
  } else if (normalized.includes("rascunho")) {
    style = "bg-slate-100 text-slate-700 ring-slate-200"
  } else if (normalized.includes("enviado")) {
    style = "bg-violet-50 text-violet-700 ring-violet-200"
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function PageHeader({ eyebrow, title, description, actionLabel, onAction, secondaryAction }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {secondaryAction}
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <Plus size={18} />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

function CardHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

function MetricCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <strong className="mt-2 block text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </strong>
          <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
        </div>
        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </Card>
  )
}

function EmptyState({ icon: Icon = FileText, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
        <Icon size={28} />
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function Input({ label, className = "", ...props }) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-700 ${className}`}>
      {label}
      <input
        {...props}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  )
}

function Select({ label, className = "", children, ...props }) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-700 ${className}`}>
      {label}
      <select
        {...props}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  )
}

function Textarea({ label, className = "", ...props }) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-700 ${className}`}>
      {label}
      <textarea
        {...props}
        className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  )
}

function ActionButton({ title, icon: Icon, onClick, tone = "default" }) {
  const styles = {
    default: "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800",
    blue: "border-blue-200 text-blue-600 hover:bg-blue-50",
    red: "border-red-200 text-red-600 hover:bg-red-50",
    emerald: "border-emerald-200 text-emerald-600 hover:bg-emerald-50",
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg border p-2 transition ${styles[tone]}`}
    >
      <Icon size={17} />
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [telaAtual, setTelaAtual] = useState("painel")
  const [carregando, setCarregando] = useState(false)

  const [secretarias, setSecretarias] = useState([])
  const [demandas, setDemandas] = useState([])
  const [fornecedores, setFornecedores] = useState([])

  const [solicitacoes, setSolicitacoes] = useState([])
  const [propostas, setPropostas] = useState([])
  const [arquivos, setArquivos] = useState([])

  const [mostrarFormSecretaria, setMostrarFormSecretaria] = useState(false)
  const [secretariaEditando, setSecretariaEditando] = useState(null)

  const [mostrarFormFornecedor, setMostrarFormFornecedor] = useState(false)
  const [fornecedorEditando, setFornecedorEditando] = useState(null)
  const [buscaFornecedor, setBuscaFornecedor] = useState("")

  const [buscaDemanda, setBuscaDemanda] = useState("")
  const [filtroSituacao, setFiltroSituacao] = useState("Todas")

  const [demandaOrcamentoId, setDemandaOrcamentoId] = useState("")
  const [valoresOrcamento, setValoresOrcamento] = useState({})

  const [mostrarFormSolicitacao, setMostrarFormSolicitacao] = useState(false)
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    demandaId: "",
    fornecedorId: "",
    prazo: "",
    observacao: "",
  })

  const [mostrarFormProposta, setMostrarFormProposta] = useState(false)
  const [novaProposta, setNovaProposta] = useState({
    solicitacaoId: "",
    valor: "",
    validade: "60",
    prazoEntrega: "",
    observacao: "",
  })

  const [mostrarFormArquivo, setMostrarFormArquivo] = useState(false)
  const [novoArquivo, setNovoArquivo] = useState({
    nome: "",
    tipo: "Documento",
    processo: "",
    observacao: "",
  })

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
    { id: "painel", nome: "Dashboard", icon: LayoutDashboard },
    { id: "secretarias", nome: "Secretarias", icon: Building2 },
    { id: "demanda", nome: "Nova Demanda", icon: FilePlus2 },
    { id: "orcamento", nome: "Orçamentos", icon: Calculator },
    { id: "solicitacao", nome: "Solicitações", icon: Send },
    { id: "fornecedores", nome: "Fornecedores", icon: Truck },
    { id: "propostas", nome: "Propostas", icon: ClipboardList },
    { id: "julgamento", nome: "Julgamento", icon: Scale },
    { id: "resultado", nome: "Resultados", icon: Trophy },
    { id: "arquivos", nome: "Arquivos", icon: FolderOpen },
  ]

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)

    await Promise.all([
      carregarSecretarias(),
      carregarDemandas(),
      carregarFornecedores(),
    ])

    setCarregando(false)
  }

  async function carregarSecretarias() {
    try {
      const response = await fetch(`${API_URL}/secretarias`, {
        headers: authHeaders(),
      })
      const data = await response.json()
      setSecretarias(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    }
  }

  async function carregarDemandas() {
    try {
      const response = await fetch(`${API_URL}/demandas`, {
        headers: authHeaders(),
      })
      const data = await response.json()
      setDemandas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    }
  }

  async function carregarFornecedores() {
    try {
      const response = await fetch(`${API_URL}/fornecedores`, {
        headers: authHeaders(),
      })
      const data = await response.json()
      setFornecedores(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    }
  }

  async function salvarSecretaria(event) {
    event.preventDefault()
    const form = event.currentTarget

    const dados = {
      nome: form.nome.value,
      responsavel: form.responsavel.value,
      email: form.email.value,
      telefone: form.telefone.value,
    }

    try {
      const response = await fetch(
        secretariaEditando
          ? `${API_URL}/secretarias/${secretariaEditando._id}`
          : `${API_URL}/secretarias`,
        {
          method: secretariaEditando ? "PUT" : "POST",
          headers: authHeaders(true),
          body: JSON.stringify(dados),
        }
      )

      if (!response.ok) throw new Error("Erro ao salvar secretaria")

      await carregarSecretarias()
      setMostrarFormSecretaria(false)
      setSecretariaEditando(null)
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar secretaria")
    }
  }

  async function excluirSecretaria(id) {
    if (!confirm("Deseja realmente excluir esta secretaria?")) return

    try {
      const response = await fetch(`${API_URL}/secretarias/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      })

      if (!response.ok) throw new Error("Erro ao excluir secretaria")
      await carregarSecretarias()
    } catch (error) {
      console.error(error)
      alert("Erro ao excluir secretaria")
    }
  }

  function adicionarItem() {
    setMateriais((old) => [
      ...old,
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
    setMateriais((old) => old.filter((item) => item.id !== id))
  }

  function alterarItem(id, campo, valor) {
    setMateriais((old) =>
      old.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    )
  }

  async function salvarDemanda() {
    if (
      !demanda.secretaria ||
      !demanda.responsavel ||
      !demanda.numeroDemanda ||
      !demanda.objeto
    ) {
      alert("Preencha os campos obrigatórios da demanda.")
      return
    }

    if (materiais.some((item) => !item.item || !item.quantidade || !item.unidade)) {
      alert("Preencha material, quantidade e unidade de todos os itens.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/demandas`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ ...demanda, materiais }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.erro || "Erro ao salvar demanda")
        return
      }

      alert("Demanda salva com sucesso.")
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
        { id: 1, item: "", quantidade: "", unidade: "", observacao: "" },
      ])

      abrirTela("painel")
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar demanda")
    }
  }

  async function excluirDemanda(id) {
    if (!confirm("Deseja realmente excluir esta demanda?")) return

    try {
      const response = await fetch(`${API_URL}/demandas/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      })

      if (!response.ok) throw new Error("Erro ao excluir demanda")
      await carregarDemandas()
    } catch (error) {
      console.error(error)
      alert("Erro ao excluir demanda")
    }
  }

  async function salvarFornecedor(event) {
    event.preventDefault()
    const form = event.currentTarget

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
      const response = await fetch(
        fornecedorEditando
          ? `${API_URL}/fornecedores/${fornecedorEditando._id}`
          : `${API_URL}/fornecedores`,
        {
          method: fornecedorEditando ? "PUT" : "POST",
          headers: authHeaders(true),
          body: JSON.stringify(dados),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.erro || "Erro ao salvar fornecedor")
        return
      }

      await carregarFornecedores()
      setFornecedorEditando(null)
      setMostrarFormFornecedor(false)
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar fornecedor")
    }
  }

  async function excluirFornecedor(id) {
    if (!confirm("Deseja realmente excluir este fornecedor?")) return

    try {
      const response = await fetch(`${API_URL}/fornecedores/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      })

      if (!response.ok) throw new Error("Erro ao excluir fornecedor")
      await carregarFornecedores()
    } catch (error) {
      console.error(error)
      alert("Erro ao excluir fornecedor")
    }
  }

  async function salvarOrcamento() {
    const demandaSelecionada = demandas.find((item) => item._id === demandaOrcamentoId)

    if (!demandaSelecionada) {
      alert("Selecione uma demanda.")
      return
    }

    const itens = (demandaSelecionada.materiais || []).map((item, index) => {
      const valorUnitario = Number(valoresOrcamento[index] || 0)

      return {
        material: item.item,
        quantidade: Number(item.quantidade || 0),
        unidade: item.unidade,
        valorUnitario,
        valorTotal: Number(item.quantidade || 0) * valorUnitario,
      }
    })

    const valorTotalEstimado = itens.reduce((total, item) => total + item.valorTotal, 0)

    try {
      const response = await fetch(`${API_URL}/orcamentos`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          demanda: demandaSelecionada._id,
          numeroDemanda: demandaSelecionada.numeroDemanda,
          secretaria: demandaSelecionada.secretaria,
          itens,
          valorTotalEstimado,
          status: "Finalizado",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.erro || "Erro ao salvar orçamento")
        return
      }

      alert("Orçamento salvo com sucesso.")
      setDemandaOrcamentoId("")
      setValoresOrcamento({})
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar orçamento")
    }
  }

  function salvarSolicitacao(event) {
    event.preventDefault()

    if (!novaSolicitacao.demandaId || !novaSolicitacao.fornecedorId) {
      alert("Selecione a demanda e o fornecedor.")
      return
    }

    const demandaSelecionada = demandas.find(
      (item) => item._id === novaSolicitacao.demandaId
    )
    const fornecedorSelecionado = fornecedores.find(
      (item) => item._id === novaSolicitacao.fornecedorId
    )

    setSolicitacoes((old) => [
      {
        id: crypto.randomUUID(),
        numero: `SOL-${String(old.length + 1).padStart(3, "0")}/2026`,
        demandaId: novaSolicitacao.demandaId,
        fornecedorId: novaSolicitacao.fornecedorId,
        demanda: demandaSelecionada?.numeroDemanda || "-",
        objeto: demandaSelecionada?.objeto || "-",
        fornecedor: fornecedorSelecionado?.empresa || "-",
        email: fornecedorSelecionado?.email || "-",
        prazo: novaSolicitacao.prazo,
        observacao: novaSolicitacao.observacao,
        status: "Enviado",
        criadaEm: new Date().toISOString(),
      },
      ...old,
    ])

    setNovaSolicitacao({
      demandaId: "",
      fornecedorId: "",
      prazo: "",
      observacao: "",
    })
    setMostrarFormSolicitacao(false)
  }

  function salvarProposta(event) {
    event.preventDefault()

    if (!novaProposta.solicitacaoId || !novaProposta.valor) {
      alert("Selecione a solicitação e informe o valor.")
      return
    }

    const solicitacaoSelecionada = solicitacoes.find(
      (item) => item.id === novaProposta.solicitacaoId
    )

    setPropostas((old) => [
      {
        id: crypto.randomUUID(),
        numero: `PROP-${String(old.length + 1).padStart(3, "0")}/2026`,
        solicitacaoId: novaProposta.solicitacaoId,
        solicitacao: solicitacaoSelecionada?.numero || "-",
        demanda: solicitacaoSelecionada?.demanda || "-",
        objeto: solicitacaoSelecionada?.objeto || "-",
        fornecedor: solicitacaoSelecionada?.fornecedor || "-",
        valor: Number(novaProposta.valor),
        validade: novaProposta.validade,
        prazoEntrega: novaProposta.prazoEntrega,
        observacao: novaProposta.observacao,
        status: "Em análise",
        recebidaEm: new Date().toISOString(),
      },
      ...old,
    ])

    setNovaProposta({
      solicitacaoId: "",
      valor: "",
      validade: "60",
      prazoEntrega: "",
      observacao: "",
    })
    setMostrarFormProposta(false)
  }

  function alterarStatusProposta(id, status) {
    setPropostas((old) =>
      old.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }

  function salvarArquivo(event) {
    event.preventDefault()

    if (!novoArquivo.nome) {
      alert("Informe o nome do arquivo.")
      return
    }

    setArquivos((old) => [
      {
        id: crypto.randomUUID(),
        ...novoArquivo,
        tamanho: "Arquivo local",
        criadoEm: new Date().toISOString(),
        responsavel: user?.nome || "Administrador",
      },
      ...old,
    ])

    setNovoArquivo({
      nome: "",
      tipo: "Documento",
      processo: "",
      observacao: "",
    })
    setMostrarFormArquivo(false)
  }

  const fornecedoresFiltrados = useMemo(() => {
    const termo = buscaFornecedor.toLowerCase().trim()

    return fornecedores.filter((fornecedor) =>
      [
        fornecedor.empresa,
        fornecedor.cnpj,
        fornecedor.responsavel,
        fornecedor.materiais,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    )
  }, [fornecedores, buscaFornecedor])

  const demandasFiltradas = useMemo(() => {
    const termo = buscaDemanda.toLowerCase().trim()

    return demandas.filter((item) => {
      const combinaBusca = [
        item.numeroDemanda,
        item.objeto,
        item.secretaria,
        item.responsavel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)

      const situacao = item.status || "Em andamento"
      const combinaSituacao =
        filtroSituacao === "Todas" || situacao === filtroSituacao

      return combinaBusca && combinaSituacao
    })
  }, [demandas, buscaDemanda, filtroSituacao])

  const demandaSelecionadaOrcamento =
    demandas.find((item) => item._id === demandaOrcamentoId) || null

  const materiaisOrcamento = demandaSelecionadaOrcamento?.materiais || []

  const totalOrcamento = materiaisOrcamento.reduce((total, item, index) => {
    const quantidade = Number(item.quantidade || 0)
    const valorUnitario = Number(valoresOrcamento[index] || 0)
    return total + quantidade * valorUnitario
  }, 0)

  const propostasOrdenadas = [...propostas].sort((a, b) => a.valor - b.valor)
  const vencedora = propostasOrdenadas.find(
    (item) => item.status === "Aprovado" || item.status === "Vencedor"
  )
  const menorProposta = propostasOrdenadas[0]

  function abrirTela(id) {
    setTelaAtual(id)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function sair() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const PainelPage = (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title="Solicitações de Compras"
        description="Acompanhe as demandas, fornecedores e todas as etapas do credenciamento."
        actionLabel="Nova solicitação"
        onAction={() => abrirTela("demanda")}
        secondaryAction={
          <button
            type="button"
            onClick={carregarDados}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Atualizar
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Demandas"
          value={demandas.length}
          description="Necessidades cadastradas"
          icon={FileText}
          tone="blue"
        />
        <MetricCard
          title="Solicitações enviadas"
          value={solicitacoes.length}
          description="Pedidos enviados aos fornecedores"
          icon={Send}
          tone="violet"
        />
        <MetricCard
          title="Propostas recebidas"
          value={propostas.length}
          description="Cotações registradas"
          icon={ClipboardList}
          tone="amber"
        />
        <MetricCard
          title="Fornecedores ativos"
          value={fornecedores.filter((item) => item.status === "Ativo").length}
          description="Empresas aptas ao processo"
          icon={Users}
          tone="emerald"
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Minhas demandas"
          description="Consulte e acompanhe os processos cadastrados."
          action={
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Filter size={16} />
              Filtros
            </button>
          }
        />

        <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={buscaDemanda}
              onChange={(event) => setBuscaDemanda(event.target.value)}
              placeholder="Buscar por número, objeto, secretaria ou responsável..."
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={filtroSituacao}
            onChange={(event) => setFiltroSituacao(event.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option>Todas</option>
            <option>Em andamento</option>
            <option>Finalizado</option>
            <option>Pendente</option>
          </select>
        </div>

        {demandasFiltradas.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nenhuma demanda encontrada"
            description="Cadastre uma nova demanda ou altere os filtros."
            actionLabel="Cadastrar demanda"
            onAction={() => abrirTela("demanda")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5">Nº</th>
                  <th className="px-5 py-3.5">Objeto</th>
                  <th className="px-5 py-3.5">Secretaria</th>
                  <th className="px-5 py-3.5">Itens</th>
                  <th className="px-5 py-3.5">Prioridade</th>
                  <th className="px-5 py-3.5">Situação</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demandasFiltradas.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      {item.numeroDemanda || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-md truncate text-sm font-semibold text-slate-900">
                        {item.objeto}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Responsável: {item.responsavel || "Não informado"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.secretaria || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.materiais?.length || 0}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.prioridade || "Normal"} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status || "Em andamento"} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton title="Visualizar" icon={Eye} />
                        <ActionButton
                          title="Excluir"
                          icon={Trash2}
                          tone="red"
                          onClick={() => excluirDemanda(item._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title="Fluxo do processo"
            description="Etapas principais do credenciamento."
          />
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["01", "Demanda", "Cadastro da necessidade", FilePlus2],
              ["02", "Orçamento", "Formação do valor estimado", Calculator],
              ["03", "Solicitação", "Envio aos fornecedores", Send],
              ["04", "Propostas", "Recebimento das cotações", ClipboardList],
              ["05", "Resultado", "Classificação final", Trophy],
            ].map(([numero, titulo, texto, Icon], index) => (
              <div key={titulo} className="relative">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-blue-600 p-2.5 text-white">
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {numero}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    {titulo}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{texto}</p>
                </div>
                {index < 4 && (
                  <ArrowRight
                    size={18}
                    className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-slate-300 xl:block"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Resumo operacional"
            description="Indicadores que precisam de atenção."
          />
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Clock3 className="text-amber-500" size={20} />
                <span className="text-sm font-medium text-slate-700">
                  Propostas em análise
                </span>
              </div>
              <strong>{propostas.filter((item) => item.status === "Em análise").length}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span className="text-sm font-medium text-slate-700">
                  Propostas aprovadas
                </span>
              </div>
              <strong>{propostas.filter((item) => item.status === "Aprovado").length}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="text-blue-500" size={20} />
                <span className="text-sm font-medium text-slate-700">
                  Arquivos cadastrados
                </span>
              </div>
              <strong>{arquivos.length}</strong>
            </div>
          </div>
        </Card>
      </div>
    </>
  )

  const SecretariasPage = (
    <>
      <PageHeader
        eyebrow="Gestão interna"
        title="Secretarias participantes"
        description="Cadastre e gerencie as secretarias autorizadas a abrir demandas."
        actionLabel="Cadastrar secretaria"
        onAction={() => {
          setSecretariaEditando(null)
          setMostrarFormSecretaria(true)
        }}
      />

      {mostrarFormSecretaria && (
        <Card className="mb-6">
          <CardHeader
            title={secretariaEditando ? "Editar secretaria" : "Nova secretaria"}
            description="Preencha os dados da unidade administrativa."
          />
          <form
            key={secretariaEditando?._id || "nova-secretaria"}
            onSubmit={salvarSecretaria}
            className="grid gap-4 p-5 md:grid-cols-2"
          >
            <Input
              label="Nome da secretaria"
              name="nome"
              defaultValue={secretariaEditando?.nome || ""}
              placeholder="Ex.: Secretaria Municipal de Obras"
              required
            />
            <Input
              label="Responsável"
              name="responsavel"
              defaultValue={secretariaEditando?.responsavel || ""}
              placeholder="Nome do responsável"
              required
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              defaultValue={secretariaEditando?.email || ""}
              placeholder="email@prefeitura.pr.gov.br"
              required
            />
            <Input
              label="Telefone"
              name="telefone"
              defaultValue={secretariaEditando?.telefone || ""}
              placeholder="(42) 99999-9999"
            />

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 md:col-span-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormSecretaria(false)
                  setSecretariaEditando(null)
                }}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Save size={17} />
                Salvar
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Secretarias cadastradas"
          description={`${secretarias.length} registro(s) encontrado(s).`}
        />

        {secretarias.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Nenhuma secretaria cadastrada"
            description="Use o botão acima para cadastrar a primeira secretaria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Secretaria</th>
                  <th className="px-5 py-3.5">Responsável</th>
                  <th className="px-5 py-3.5">E-mail</th>
                  <th className="px-5 py-3.5">Telefone</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {secretarias.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {item.nome}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.responsavel}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.email}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.telefone || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status="Ativo" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          title="Editar"
                          icon={Pencil}
                          tone="blue"
                          onClick={() => {
                            setSecretariaEditando(item)
                            setMostrarFormSecretaria(true)
                          }}
                        />
                        <ActionButton
                          title="Excluir"
                          icon={Trash2}
                          tone="red"
                          onClick={() => excluirSecretaria(item._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )

  const NovaDemandaPage = (
    <>
      <PageHeader
        eyebrow="Abertura da necessidade"
        title="Nova demanda"
        description="Cadastre a solicitação da secretaria e os materiais necessários."
        actionLabel="Salvar demanda"
        onAction={salvarDemanda}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.7fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Informações da demanda"
              description="Dados gerais da solicitação."
            />
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Select
                label="Secretaria solicitante *"
                value={demanda.secretaria}
                onChange={(event) =>
                  setDemanda({ ...demanda, secretaria: event.target.value })
                }
              >
                <option value="">Selecione a secretaria</option>
                {secretarias.map((item) => (
                  <option key={item._id} value={item.nome}>
                    {item.nome}
                  </option>
                ))}
              </Select>

              <Input
                label="Responsável pela solicitação *"
                value={demanda.responsavel}
                onChange={(event) =>
                  setDemanda({ ...demanda, responsavel: event.target.value })
                }
                placeholder="Nome do responsável"
              />

              <Input
                label="Número da demanda *"
                value={demanda.numeroDemanda}
                onChange={(event) =>
                  setDemanda({ ...demanda, numeroDemanda: event.target.value })
                }
                placeholder="Ex.: 004/2026"
              />

              <Select
                label="Prioridade"
                value={demanda.prioridade}
                onChange={(event) =>
                  setDemanda({ ...demanda, prioridade: event.target.value })
                }
              >
                <option>Normal</option>
                <option>Urgente</option>
                <option>Emergencial</option>
              </Select>

              <Input
                label="Objeto da solicitação *"
                className="md:col-span-2"
                value={demanda.objeto}
                onChange={(event) =>
                  setDemanda({ ...demanda, objeto: event.target.value })
                }
                placeholder="Descreva de forma objetiva o que será adquirido."
              />

              <Textarea
                label="Justificativa da necessidade"
                className="md:col-span-2"
                rows="5"
                value={demanda.justificativa}
                onChange={(event) =>
                  setDemanda({ ...demanda, justificativa: event.target.value })
                }
                placeholder="Informe a necessidade administrativa e a finalidade da contratação."
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Materiais solicitados"
              description="Informe os itens que compõem a demanda."
              action={
                <button
                  type="button"
                  onClick={adicionarItem}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <Plus size={16} />
                  Adicionar item
                </button>
              }
            />

            <div className="space-y-4 p-5">
              {materiais.map((material, index) => (
                <div
                  key={material.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Item {index + 1}
                      </p>
                      <p className="text-xs text-slate-500">
                        Preencha a descrição, quantidade e unidade.
                      </p>
                    </div>
                    {materiais.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerItem(material.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Material *"
                      value={material.item}
                      onChange={(event) =>
                        alterarItem(material.id, "item", event.target.value)
                      }
                      placeholder="Ex.: Cimento CP II"
                    />
                    <Input
                      label="Quantidade *"
                      type="number"
                      min="0"
                      value={material.quantidade}
                      onChange={(event) =>
                        alterarItem(material.id, "quantidade", event.target.value)
                      }
                      placeholder="0"
                    />
                    <Select
                      label="Unidade *"
                      value={material.unidade}
                      onChange={(event) =>
                        alterarItem(material.id, "unidade", event.target.value)
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="UN">Unidade</option>
                      <option value="SC">Saco</option>
                      <option value="KG">Quilograma</option>
                      <option value="L">Litro</option>
                      <option value="M">Metro</option>
                      <option value="M²">Metro quadrado</option>
                      <option value="M³">Metro cúbico</option>
                      <option value="CX">Caixa</option>
                    </Select>
                    <Input
                      label="Observação"
                      value={material.observacao}
                      onChange={(event) =>
                        alterarItem(material.id, "observacao", event.target.value)
                      }
                      placeholder="Detalhes técnicos do item"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-24">
          <CardHeader
            title="Resumo da demanda"
            description="Confira os dados antes de salvar."
          />
          <div className="space-y-4 p-5">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total de itens
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {materiais.length}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 text-amber-600" size={19} />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Em elaboração
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    A demanda ainda não foi salva.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                "Cadastro da demanda",
                "Montagem do orçamento",
                "Envio aos fornecedores",
                "Recebimento das propostas",
                "Julgamento final",
              ].map((etapa, index) => (
                <div key={etapa} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-700">{etapa}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={salvarDemanda}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Save size={18} />
              Salvar demanda
            </button>
          </div>
        </Card>
      </div>
    </>
  )

  const OrcamentoPage = (
    <>
      <PageHeader
        eyebrow="Formação de preço"
        title="Orçamento da demanda"
        description="Selecione uma demanda e informe os valores unitários dos materiais."
        actionLabel="Salvar orçamento"
        onAction={salvarOrcamento}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Demandas disponíveis"
          value={demandas.length}
          description="Demandas cadastradas"
          icon={FileText}
          tone="blue"
        />
        <MetricCard
          title="Itens selecionados"
          value={materiaisOrcamento.length}
          description="Materiais da demanda"
          icon={PackageSearch}
          tone="violet"
        />
        <MetricCard
          title="Total estimado"
          value={formatarMoeda(totalOrcamento)}
          description="Soma dos valores informados"
          icon={CircleDollarSign}
          tone="emerald"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.7fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Selecionar demanda"
              description="Escolha a demanda que receberá o orçamento."
            />
            <div className="p-5">
              <Select
                label="Demanda"
                value={demandaOrcamentoId}
                onChange={(event) => {
                  setDemandaOrcamentoId(event.target.value)
                  setValoresOrcamento({})
                }}
              >
                <option value="">Selecione uma demanda cadastrada</option>
                {demandas.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.numeroDemanda} - {item.objeto}
                  </option>
                ))}
              </Select>

              {demandaSelecionadaOrcamento && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    Demanda {demandaSelecionadaOrcamento.numeroDemanda}
                  </p>
                  <p className="mt-1 text-sm text-blue-800">
                    {demandaSelecionadaOrcamento.objeto}
                  </p>
                  <p className="mt-2 text-xs text-blue-700">
                    Secretaria: {demandaSelecionadaOrcamento.secretaria}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Itens do orçamento"
              description="Informe o valor unitário de cada item."
            />

            {materiaisOrcamento.length === 0 ? (
              <EmptyState
                icon={Calculator}
                title="Nenhum item selecionado"
                description="Selecione uma demanda para visualizar os materiais."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Material</th>
                      <th className="px-5 py-3.5">Quantidade</th>
                      <th className="px-5 py-3.5">Unidade</th>
                      <th className="px-5 py-3.5">Valor unitário</th>
                      <th className="px-5 py-3.5">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materiaisOrcamento.map((item, index) => {
                      const total =
                        Number(item.quantidade || 0) *
                        Number(valoresOrcamento[index] || 0)

                      return (
                        <tr key={`${item.item}-${index}`}>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {item.item}
                            </p>
                            {item.observacao && (
                              <p className="mt-1 text-xs text-slate-500">
                                {item.observacao}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.quantidade}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.unidade}
                          </td>
                          <td className="px-5 py-4">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={valoresOrcamento[index] || ""}
                              onChange={(event) =>
                                setValoresOrcamento((old) => ({
                                  ...old,
                                  [index]: event.target.value,
                                }))
                              }
                              className="h-10 w-36 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              placeholder="0,00"
                            />
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                            {formatarMoeda(total)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-24">
          <CardHeader
            title="Resumo do orçamento"
            description="Conferência dos valores."
          />
          <div className="space-y-4 p-5">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Demanda
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {demandaSelecionadaOrcamento?.numeroDemanda || "Nenhuma"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Itens preenchidos
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {
                  materiaisOrcamento.filter(
                    (_, index) => Number(valoresOrcamento[index] || 0) > 0
                  ).length
                }
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Valor total estimado
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {formatarMoeda(totalOrcamento)}
              </p>
            </div>

            <button
              type="button"
              onClick={salvarOrcamento}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Save size={18} />
              Salvar orçamento
            </button>
          </div>
        </Card>
      </div>
    </>
  )

  const SolicitacoesPage = (
    <>
      <PageHeader
        eyebrow="Cotação com fornecedores"
        title="Solicitações de orçamento"
        description="Envie pedidos de cotação aos fornecedores credenciados e acompanhe os prazos."
        actionLabel="Nova solicitação"
        onAction={() => setMostrarFormSolicitacao(true)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Solicitações enviadas"
          value={solicitacoes.length}
          description="Total de pedidos criados"
          icon={Send}
          tone="blue"
        />
        <MetricCard
          title="Aguardando resposta"
          value={solicitacoes.filter((item) => item.status === "Enviado").length}
          description="Fornecedores ainda não responderam"
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          title="Com proposta"
          value={new Set(propostas.map((item) => item.solicitacaoId)).size}
          description="Solicitações que receberam cotação"
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      {mostrarFormSolicitacao && (
        <Card className="mt-6">
          <CardHeader
            title="Nova solicitação de orçamento"
            description="Selecione a demanda e o fornecedor destinatário."
          />
          <form onSubmit={salvarSolicitacao} className="grid gap-4 p-5 md:grid-cols-2">
            <Select
              label="Demanda *"
              value={novaSolicitacao.demandaId}
              onChange={(event) =>
                setNovaSolicitacao({
                  ...novaSolicitacao,
                  demandaId: event.target.value,
                })
              }
            >
              <option value="">Selecione uma demanda</option>
              {demandas.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.numeroDemanda} - {item.objeto}
                </option>
              ))}
            </Select>

            <Select
              label="Fornecedor *"
              value={novaSolicitacao.fornecedorId}
              onChange={(event) =>
                setNovaSolicitacao({
                  ...novaSolicitacao,
                  fornecedorId: event.target.value,
                })
              }
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores
                .filter((item) => item.status === "Ativo")
                .map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.empresa}
                  </option>
                ))}
            </Select>

            <Input
              label="Prazo para resposta"
              type="date"
              value={novaSolicitacao.prazo}
              onChange={(event) =>
                setNovaSolicitacao({
                  ...novaSolicitacao,
                  prazo: event.target.value,
                })
              }
            />

            <Textarea
              label="Observações"
              rows="3"
              value={novaSolicitacao.observacao}
              onChange={(event) =>
                setNovaSolicitacao({
                  ...novaSolicitacao,
                  observacao: event.target.value,
                })
              }
            />

            <div className="flex gap-3 md:col-span-2 md:justify-end">
              <button
                type="button"
                onClick={() => setMostrarFormSolicitacao(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Send size={17} />
                Enviar solicitação
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Solicitações cadastradas"
          description={`${solicitacoes.length} registro(s) encontrado(s).`}
        />

        {solicitacoes.length === 0 ? (
          <EmptyState
            icon={Send}
            title="Nenhuma solicitação enviada"
            description="Crie uma solicitação para encaminhar a demanda a um fornecedor."
            actionLabel="Nova solicitação"
            onAction={() => setMostrarFormSolicitacao(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Nº</th>
                  <th className="px-5 py-3.5">Demanda</th>
                  <th className="px-5 py-3.5">Fornecedor</th>
                  <th className="px-5 py-3.5">Prazo</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Criada em</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solicitacoes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {item.numero}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.demanda}
                      </p>
                      <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                        {item.objeto}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">{item.fornecedor}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatarData(item.prazo)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatarData(item.criadaEm)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton title="Visualizar" icon={Eye} />
                        <ActionButton title="Copiar link" icon={Copy} tone="blue" />
                        <ActionButton
                          title="Excluir"
                          icon={Trash2}
                          tone="red"
                          onClick={() =>
                            setSolicitacoes((old) =>
                              old.filter((solicitacao) => solicitacao.id !== item.id)
                            )
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )

  const FornecedoresPage = (
    <>
      <PageHeader
        eyebrow="Cadastro externo"
        title="Fornecedores credenciados"
        description="Cadastre e acompanhe as empresas aptas a receber solicitações."
        actionLabel="Cadastrar fornecedor"
        onAction={() => {
          setFornecedorEditando(null)
          setMostrarFormFornecedor(true)
        }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total de fornecedores"
          value={fornecedores.length}
          description="Empresas cadastradas"
          icon={Truck}
          tone="blue"
        />
        <MetricCard
          title="Fornecedores ativos"
          value={fornecedores.filter((item) => item.status === "Ativo").length}
          description="Aptos a receber solicitações"
          icon={CheckCircle2}
          tone="emerald"
        />
        <MetricCard
          title="Pendentes ou inativos"
          value={fornecedores.filter((item) => item.status !== "Ativo").length}
          description="Cadastros que exigem atenção"
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      {mostrarFormFornecedor && (
        <Card className="mt-6">
          <CardHeader
            title={fornecedorEditando ? "Editar fornecedor" : "Novo fornecedor"}
            description="Preencha os dados da empresa."
          />
          <form
            key={fornecedorEditando?._id || "novo-fornecedor"}
            onSubmit={salvarFornecedor}
            className="grid gap-4 p-5 md:grid-cols-2"
          >
            <Input
              label="Empresa"
              name="empresa"
              defaultValue={fornecedorEditando?.empresa || ""}
              placeholder="Razão social ou nome fantasia"
              required
            />
            <Input
              label="CNPJ"
              name="cnpj"
              defaultValue={fornecedorEditando?.cnpj || ""}
              placeholder="00.000.000/0000-00"
              required
            />
            <Input
              label="Responsável"
              name="responsavel"
              defaultValue={fornecedorEditando?.responsavel || ""}
              placeholder="Nome do responsável"
              required
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              defaultValue={fornecedorEditando?.email || ""}
              placeholder="empresa@email.com"
              required
            />
            <Input
              label="Telefone"
              name="telefone"
              defaultValue={fornecedorEditando?.telefone || ""}
              placeholder="(42) 99999-9999"
            />
            <Input
              label="Cidade/UF"
              name="cidade"
              defaultValue={fornecedorEditando?.cidade || ""}
              placeholder="General Carneiro/PR"
            />
            <Input
              label="Materiais que fornece"
              name="materiais"
              defaultValue={fornecedorEditando?.materiais || ""}
              placeholder="Ex.: cimento, areia, tubos..."
            />
            <Select
              label="Status"
              name="status"
              defaultValue={fornecedorEditando?.status || "Ativo"}
            >
              <option>Ativo</option>
              <option>Pendente</option>
              <option>Inativo</option>
            </Select>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 md:col-span-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setFornecedorEditando(null)
                  setMostrarFormFornecedor(false)
                }}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Save size={17} />
                Salvar fornecedor
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Fornecedores cadastrados"
          description={`${fornecedoresFiltrados.length} registro(s) encontrado(s).`}
        />
        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={buscaFornecedor}
              onChange={(event) => setBuscaFornecedor(event.target.value)}
              placeholder="Buscar por empresa, CNPJ, responsável ou material..."
              className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {fornecedoresFiltrados.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="Nenhum fornecedor encontrado"
            description="Cadastre um novo fornecedor ou altere o termo pesquisado."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Empresa</th>
                  <th className="px-5 py-3.5">CNPJ</th>
                  <th className="px-5 py-3.5">Responsável</th>
                  <th className="px-5 py-3.5">Contato</th>
                  <th className="px-5 py-3.5">Materiais</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fornecedoresFiltrados.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {item.empresa}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.cnpj}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.responsavel}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <p>{item.email}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.telefone || "-"} · {item.cidade || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.materiais || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          title="Editar"
                          icon={Pencil}
                          tone="blue"
                          onClick={() => {
                            setFornecedorEditando(item)
                            setMostrarFormFornecedor(true)
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }}
                        />
                        <ActionButton
                          title="Excluir"
                          icon={Trash2}
                          tone="red"
                          onClick={() => excluirFornecedor(item._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )

  const PropostasPage = (
    <>
      <PageHeader
        eyebrow="Recebimento das cotações"
        title="Propostas dos fornecedores"
        description="Registre, compare e acompanhe as propostas recebidas."
        actionLabel="Registrar proposta"
        onAction={() => setMostrarFormProposta(true)}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard
          title="Propostas recebidas"
          value={propostas.length}
          description="Total registrado"
          icon={ClipboardList}
          tone="blue"
        />
        <MetricCard
          title="Em análise"
          value={propostas.filter((item) => item.status === "Em análise").length}
          description="Aguardando julgamento"
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          title="Aprovadas"
          value={propostas.filter((item) => item.status === "Aprovado").length}
          description="Propostas habilitadas"
          icon={CheckCircle2}
          tone="emerald"
        />
        <MetricCard
          title="Menor proposta"
          value={menorProposta ? formatarMoeda(menorProposta.valor) : "R$ 0,00"}
          description="Menor valor registrado"
          icon={CircleDollarSign}
          tone="violet"
        />
      </div>

      {mostrarFormProposta && (
        <Card className="mt-6">
          <CardHeader
            title="Registrar proposta"
            description="Informe os dados apresentados pelo fornecedor."
          />
          <form onSubmit={salvarProposta} className="grid gap-4 p-5 md:grid-cols-2">
            <Select
              label="Solicitação *"
              value={novaProposta.solicitacaoId}
              onChange={(event) =>
                setNovaProposta({
                  ...novaProposta,
                  solicitacaoId: event.target.value,
                })
              }
            >
              <option value="">Selecione uma solicitação</option>
              {solicitacoes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.numero} - {item.fornecedor}
                </option>
              ))}
            </Select>

            <Input
              label="Valor total da proposta *"
              type="number"
              min="0"
              step="0.01"
              value={novaProposta.valor}
              onChange={(event) =>
                setNovaProposta({
                  ...novaProposta,
                  valor: event.target.value,
                })
              }
              placeholder="0,00"
            />

            <Input
              label="Validade da proposta (dias)"
              type="number"
              min="1"
              value={novaProposta.validade}
              onChange={(event) =>
                setNovaProposta({
                  ...novaProposta,
                  validade: event.target.value,
                })
              }
            />

            <Input
              label="Prazo de entrega"
              value={novaProposta.prazoEntrega}
              onChange={(event) =>
                setNovaProposta({
                  ...novaProposta,
                  prazoEntrega: event.target.value,
                })
              }
              placeholder="Ex.: 10 dias úteis"
            />

            <Textarea
              label="Observações"
              className="md:col-span-2"
              rows="3"
              value={novaProposta.observacao}
              onChange={(event) =>
                setNovaProposta({
                  ...novaProposta,
                  observacao: event.target.value,
                })
              }
            />

            <div className="flex gap-3 md:col-span-2 md:justify-end">
              <button
                type="button"
                onClick={() => setMostrarFormProposta(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Save size={17} />
                Salvar proposta
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Propostas registradas"
          description={`${propostas.length} proposta(s) recebida(s).`}
        />

        {propostas.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma proposta registrada"
            description="Registre a primeira proposta recebida de um fornecedor."
            actionLabel="Registrar proposta"
            onAction={() => setMostrarFormProposta(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Nº</th>
                  <th className="px-5 py-3.5">Fornecedor</th>
                  <th className="px-5 py-3.5">Demanda</th>
                  <th className="px-5 py-3.5">Valor</th>
                  <th className="px-5 py-3.5">Validade</th>
                  <th className="px-5 py-3.5">Entrega</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {propostasOrdenadas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {item.numero}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {item.fornecedor}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.demanda}
                      </p>
                      <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                        {item.objeto}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">
                      {formatarMoeda(item.valor)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.validade} dias
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.prazoEntrega || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton title="Visualizar" icon={Eye} />
                        <ActionButton
                          title="Excluir"
                          icon={Trash2}
                          tone="red"
                          onClick={() =>
                            setPropostas((old) =>
                              old.filter((proposta) => proposta.id !== item.id)
                            )
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )

  const JulgamentoPage = (
    <>
      <PageHeader
        eyebrow="Análise e classificação"
        title="Julgamento das propostas"
        description="Analise os valores, habilite propostas e defina a classificação."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Propostas para análise"
          value={propostas.filter((item) => item.status === "Em análise").length}
          description="Aguardando decisão"
          icon={Scale}
          tone="amber"
        />
        <MetricCard
          title="Propostas habilitadas"
          value={propostas.filter((item) => item.status === "Aprovado").length}
          description="Aprovadas para classificação"
          icon={BadgeCheck}
          tone="emerald"
        />
        <MetricCard
          title="Propostas reprovadas"
          value={propostas.filter((item) => item.status === "Reprovado").length}
          description="Desclassificadas no julgamento"
          icon={CircleX}
          tone="red"
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Quadro comparativo"
          description="As propostas estão ordenadas do menor para o maior valor."
        />

        {propostas.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="Nenhuma proposta para julgamento"
            description="Registre propostas para iniciar a análise e classificação."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Classificação</th>
                  <th className="px-5 py-3.5">Fornecedor</th>
                  <th className="px-5 py-3.5">Demanda</th>
                  <th className="px-5 py-3.5">Valor</th>
                  <th className="px-5 py-3.5">Diferença</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Decisão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {propostasOrdenadas.map((item, index) => {
                  const diferenca =
                    index === 0 ? 0 : item.valor - propostasOrdenadas[0].valor

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                            index === 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {index + 1}º
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {item.fornecedor}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.demanda}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {formatarMoeda(item.valor)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {diferenca === 0 ? "-" : `+ ${formatarMoeda(diferenca)}`}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => alterarStatusProposta(item.id, "Aprovado")}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <CheckCircle2 size={15} />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => alterarStatusProposta(item.id, "Reprovado")}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            <CircleX size={15} />
                            Reprovar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )

  const ResultadoPage = (
    <>
      <PageHeader
        eyebrow="Conclusão do processo"
        title="Resultado e classificação"
        description="Consulte os vencedores, valores homologados e o resumo final."
        secondaryAction={
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download size={17} />
            Exportar relatório
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Fornecedor vencedor"
          value={vencedora?.fornecedor || "Não definido"}
          description="Proposta aprovada para contratação"
          icon={Award}
          tone="emerald"
        />
        <MetricCard
          title="Valor vencedor"
          value={vencedora ? formatarMoeda(vencedora.valor) : "R$ 0,00"}
          description="Valor final homologado"
          icon={CircleDollarSign}
          tone="blue"
        />
        <MetricCard
          title="Economia estimada"
          value={
            propostas.length > 1 && vencedora
              ? formatarMoeda(
                  Math.max(...propostas.map((item) => item.valor)) - vencedora.valor
                )
              : "R$ 0,00"
          }
          description="Diferença em relação à maior proposta"
          icon={BarChart3}
          tone="violet"
        />
      </div>

      {vencedora ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader
              title="Resultado homologado"
              description="Resumo da proposta vencedora."
            />
            <div className="p-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-3 inline-flex rounded-xl bg-emerald-600 p-3 text-white">
                      <Trophy size={24} />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                      Proposta vencedora
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-emerald-950">
                      {vencedora.fornecedor}
                    </h3>
                    <p className="mt-2 text-sm text-emerald-800">
                      Demanda {vencedora.demanda}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-5 text-right shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Valor final
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">
                      {formatarMoeda(vencedora.valor)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Validade</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {vencedora.validade} dias
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Entrega</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {vencedora.prazoEntrega || "-"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <div className="mt-2">
                    <StatusBadge status="Vencedor" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Próximas ações"
              description="Etapas após o resultado."
            />
            <div className="space-y-3 p-5">
              {[
                ["Gerar relatório final", FileCheck2],
                ["Comunicar fornecedor", Mail],
                ["Anexar documentos", Paperclip],
                ["Arquivar processo", Archive],
              ].map(([label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <Icon size={18} className="text-blue-600" />
                    {label}
                  </span>
                  <ChevronRight size={17} className="text-slate-400" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="mt-6">
          <EmptyState
            icon={Trophy}
            title="Resultado ainda não definido"
            description="Aprove uma proposta na tela de julgamento para gerar o resultado final."
          />
        </Card>
      )}
    </>
  )

  const ArquivosPage = (
    <>
      <PageHeader
        eyebrow="Documentação do processo"
        title="Central de arquivos"
        description="Organize documentos, propostas, relatórios e anexos do credenciamento."
        actionLabel="Adicionar arquivo"
        onAction={() => setMostrarFormArquivo(true)}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard
          title="Total de arquivos"
          value={arquivos.length}
          description="Documentos cadastrados"
          icon={FolderOpen}
          tone="blue"
        />
        <MetricCard
          title="Documentos"
          value={arquivos.filter((item) => item.tipo === "Documento").length}
          description="Documentos administrativos"
          icon={FileText}
          tone="violet"
        />
        <MetricCard
          title="Propostas"
          value={arquivos.filter((item) => item.tipo === "Proposta").length}
          description="Arquivos enviados por fornecedores"
          icon={ClipboardList}
          tone="amber"
        />
        <MetricCard
          title="Relatórios"
          value={arquivos.filter((item) => item.tipo === "Relatório").length}
          description="Relatórios e resultados"
          icon={BarChart3}
          tone="emerald"
        />
      </div>

      {mostrarFormArquivo && (
        <Card className="mt-6">
          <CardHeader
            title="Adicionar arquivo"
            description="Cadastre os dados do documento no processo."
          />
          <form onSubmit={salvarArquivo} className="grid gap-4 p-5 md:grid-cols-2">
            <Input
              label="Nome do arquivo *"
              value={novoArquivo.nome}
              onChange={(event) =>
                setNovoArquivo({ ...novoArquivo, nome: event.target.value })
              }
              placeholder="Ex.: Proposta Comercial - Empresa X.pdf"
            />

            <Select
              label="Tipo"
              value={novoArquivo.tipo}
              onChange={(event) =>
                setNovoArquivo({ ...novoArquivo, tipo: event.target.value })
              }
            >
              <option>Documento</option>
              <option>Proposta</option>
              <option>Relatório</option>
              <option>Certidão</option>
              <option>Contrato</option>
              <option>Outro</option>
            </Select>

            <Input
              label="Processo/Demanda"
              value={novoArquivo.processo}
              onChange={(event) =>
                setNovoArquivo({ ...novoArquivo, processo: event.target.value })
              }
              placeholder="Ex.: 004/2026"
            />

            <Textarea
              label="Observação"
              rows="3"
              value={novoArquivo.observacao}
              onChange={(event) =>
                setNovoArquivo({ ...novoArquivo, observacao: event.target.value })
              }
            />

            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center md:col-span-2">
              <Upload className="mx-auto text-slate-400" size={28} />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Selecione ou arraste o arquivo
              </p>
              <p className="mt-1 text-xs text-slate-500">
                PDF, DOCX, XLSX, PNG ou JPG
              </p>
              <input type="file" className="mt-4 text-sm text-slate-600" />
            </div>

            <div className="flex gap-3 md:col-span-2 md:justify-end">
              <button
                type="button"
                onClick={() => setMostrarFormArquivo(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Upload size={17} />
                Salvar arquivo
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Arquivos do processo"
          description={`${arquivos.length} arquivo(s) cadastrado(s).`}
        />

        {arquivos.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Nenhum arquivo cadastrado"
            description="Adicione documentos, propostas ou relatórios ao processo."
            actionLabel="Adicionar arquivo"
            onAction={() => setMostrarFormArquivo(true)}
          />
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {arquivos.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <FileText size={22} />
                  </div>
                  <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <h3 className="mt-4 line-clamp-2 text-sm font-semibold text-slate-900">
                  {item.nome}
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  {item.tipo} · {item.processo || "Sem processo"}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    {formatarData(item.criadoEm)}
                  </span>
                  <div className="flex gap-2">
                    <ActionButton title="Baixar" icon={Download} tone="blue" />
                    <ActionButton
                      title="Excluir"
                      icon={Trash2}
                      tone="red"
                      onClick={() =>
                        setArquivos((old) =>
                          old.filter((arquivo) => arquivo.id !== item.id)
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold">
              GC
            </div>
            <div>
              <h2 className="font-semibold">Sistema de Compras</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Prefeitura de General Carneiro
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Navegação
          </p>

          <div className="space-y-1">
            {menu.map(({ id, nome, icon: Icon }) => {
              const active = telaAtual === id

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => abrirTela(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {nome}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="text-xs text-slate-400">Usuário conectado</p>
            <p className="mt-1 truncate text-sm font-semibold">
              {user?.nome || "Administrador"}
            </p>
          </div>

          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Prefeitura de General Carneiro - PR
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Gestão de demandas e credenciamento de fornecedores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {carregando && (
              <Loader2 size={18} className="animate-spin text-blue-600" />
            )}

            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
              {(user?.nome || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {telaAtual === "painel" && PainelPage}
          {telaAtual === "secretarias" && SecretariasPage}
          {telaAtual === "demanda" && NovaDemandaPage}
          {telaAtual === "orcamento" && OrcamentoPage}
          {telaAtual === "solicitacao" && SolicitacoesPage}
          {telaAtual === "fornecedores" && FornecedoresPage}
          {telaAtual === "propostas" && PropostasPage}
          {telaAtual === "julgamento" && JulgamentoPage}
          {telaAtual === "resultado" && ResultadoPage}
          {telaAtual === "arquivos" && ArquivosPage}
        </main>
      </div>
    </div>
  )
}