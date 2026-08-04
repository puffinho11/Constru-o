import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
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
  UserCog,
  ReceiptText,
  MessageCircle,
} from "lucide-react"

import AdminUsuariosPage from "../components/AdminUsuariosPage"

function dataHora(valor) {
  if (!valor) return ""
  return new Date(valor).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function nomeArquivo(url = "") {
  try {
    return decodeURIComponent(url.split("/").pop() || "arquivo")
  } catch {
    return "arquivo"
  }
}

function ResultadoChatModal({
  cotacaoId,
  titulo = "Chat da cotação",
  subtitulo = "",
  onClose,
}) {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")
    } catch {
      return {}
    }
  }, [])

  const fornecedorLogado =
    String(usuario?.role || "").toLowerCase() === "fornecedor" ||
    String(usuario?.tipo || "").toLowerCase() === "fornecedor" ||
    String(usuario?.perfil || "").toLowerCase() === "fornecedor"

  const [fornecedores, setFornecedores] = useState([])
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("")
  const [tipoChat, setTipoChat] = useState("privado")
  const [mensagens, setMensagens] = useState([])
  const [texto, setTexto] = useState("")
  const [arquivo, setArquivo] = useState(null)
  const [busca, setBusca] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const fimRef = useRef(null)

  const fornecedoresFiltrados = fornecedores.filter((item) =>
    String(
      item.empresa ||
        item.razaoSocial ||
        item.nomeFantasia ||
        item.responsavel ||
        item.email ||
        ""
    )
      .toLowerCase()
      .includes(busca.toLowerCase().trim())
  )

  useEffect(() => {
    carregarFornecedores()
  }, [cotacaoId])

  useEffect(() => {
    if (
      tipoChat === "privado" &&
      !fornecedorSelecionado &&
      !fornecedorLogado
    ) {
      return
    }

    carregarMensagens()

    const timer = setInterval(carregarMensagens, 5000)
    return () => clearInterval(timer)
  }, [cotacaoId, fornecedorSelecionado, tipoChat])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens])

  async function carregarFornecedores() {
    setCarregando(true)

    try {
      const response = await fetch(
        `${API_URL}/cotacoes/${cotacaoId}/chat/fornecedores`,
        { headers: authHeaders() }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar fornecedores.")
      }

      const lista = Array.isArray(data) ? data : []

      setFornecedores(lista)

      if (fornecedorLogado) {
        setFornecedorSelecionado(
          usuario?.fornecedorId || lista[0]?._id || ""
        )
      } else if (lista.length > 0) {
        setFornecedorSelecionado((atual) => atual || lista[0]._id)
      }
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setCarregando(false)
    }
  }

  async function carregarMensagens() {
    try {
      const parametros = new URLSearchParams({
        tipoChat,
      })

      if (tipoChat === "privado" && !fornecedorLogado) {
        parametros.set("fornecedorId", fornecedorSelecionado)
      }

      const response = await fetch(
        `${API_URL}/cotacoes/${cotacaoId}/chat?${parametros.toString()}`,
        { headers: authHeaders() }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar mensagens.")
      }

      setMensagens(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    }
  }

  async function enviarMensagem(event) {
    event.preventDefault()

    if (!texto.trim() && !arquivo) {
      return
    }

    if (
      tipoChat === "privado" &&
      !fornecedorLogado &&
      !fornecedorSelecionado
    ) {
      alert("Selecione um fornecedor.")
      return
    }

    setEnviando(true)

    try {
      const formData = new FormData()
      formData.append("mensagem", texto.trim())
      formData.append("tipoChat", tipoChat)

      if (
        tipoChat === "privado" &&
        !fornecedorLogado
      ) {
        formData.append("fornecedorId", fornecedorSelecionado)
      }

      if (arquivo) {
        formData.append("arquivo", arquivo)
      }

      const response = await fetch(
        `${API_URL}/cotacoes/${cotacaoId}/chat`,
        {
          method: "POST",
          headers: authHeaders(),
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao enviar mensagem.")
      }

      setTexto("")
      setArquivo(null)
      await carregarMensagens()
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setEnviando(false)
    }
  }

  const fornecedorAtual = fornecedores.find(
    (item) => String(item._id) === String(fornecedorSelecionado)
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {!fornecedorLogado && (
          <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-slate-50 md:flex md:flex-col">
            <div className="border-b border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Fornecedores
              </p>

              <div className="relative mt-3">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Pesquisar fornecedor"
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <button
                type="button"
                onClick={() => {
                  setTipoChat("grupo")
                  setFornecedorSelecionado("")
                }}
                className={`mb-2 w-full rounded-xl p-3 text-left transition ${
                  tipoChat === "grupo"
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <p className="text-sm font-semibold">
                  Grupo geral
                </p>
                <p
                  className={`mt-1 text-xs ${
                    tipoChat === "grupo"
                      ? "text-emerald-100"
                      : "text-emerald-700"
                  }`}
                >
                  Todas as empresas participantes
                </p>
              </button>

              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Conversas privadas
              </p>

              {fornecedoresFiltrados.map((item) => {
                const nome =
                  item.empresa ||
                  item.razaoSocial ||
                  item.nomeFantasia ||
                  item.responsavel ||
                  "Fornecedor"

                const ativo =
                  tipoChat === "privado" &&
                  String(item._id) === String(fornecedorSelecionado)

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => {
                      setTipoChat("privado")
                      setFornecedorSelecionado(item._id)
                    }}
                    className={`mb-1 w-full rounded-xl p-3 text-left transition ${
                      ativo
                        ? "bg-blue-600 text-white"
                        : "hover:bg-white"
                    }`}
                  >
                    <p className="truncate text-sm font-semibold">{nome}</p>
                    <p
                      className={`mt-1 truncate text-xs ${
                        ativo ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {item.email || "Sem e-mail"}
                    </p>
                  </button>
                )
              })}
            </div>
          </aside>
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <MessageCircle size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-slate-950">
                    {titulo}
                  </h2>
                  <p className="truncate text-xs text-slate-500">
                    {tipoChat === "grupo"
                      ? "Grupo geral com todas as empresas"
                      : fornecedorLogado
                        ? subtitulo || "Conversa privada com o Setor de Compras"
                        : fornecedorAtual
                          ? fornecedorAtual.empresa ||
                            fornecedorAtual.razaoSocial ||
                            fornecedorAtual.nomeFantasia ||
                            fornecedorAtual.responsavel
                          : "Selecione um fornecedor"}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </header>

          {fornecedorLogado && (
            <div className="flex gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setTipoChat("privado")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  tipoChat === "privado"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Conversa privada
              </button>

              <button
                type="button"
                onClick={() => setTipoChat("grupo")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  tipoChat === "grupo"
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Grupo geral
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-5">
            {tipoChat === "grupo" && (
              <div className="mx-auto mb-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                As mensagens e os arquivos enviados aqui serão visíveis para todas as empresas participantes desta cotação. Não envie proposta comercial, preço ou documento sigiloso no grupo.
              </div>
            )}

            {carregando ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : mensagens.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-white p-4 text-slate-400 shadow-sm">
                  <MessageCircle size={32} />
                </div>
                <p className="mt-4 font-semibold text-slate-700">
                  Nenhuma mensagem ainda
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Inicie a conversa sobre esta cotação.
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-3">
                {mensagens.map((item) => {
                  const minha =
                    String(item.remetenteId || "") ===
                      String(usuario.id || usuario._id || "") ||
                    String(item.remetenteTipo || "").toLowerCase() ===
                      (fornecedorLogado ? "fornecedor" : "interno")

                  return (
                    <div
                      key={item._id}
                      className={`flex ${minha ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          minha
                            ? "rounded-br-md bg-blue-600 text-white"
                            : "rounded-bl-md bg-white text-slate-800"
                        }`}
                      >
                        <p
                          className={`mb-1 text-xs font-semibold ${
                            minha ? "text-blue-100" : "text-blue-700"
                          }`}
                        >
                          {item.remetenteNome || "Usuário"}
                        </p>

                        {item.mensagem && (
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {item.mensagem}
                          </p>
                        )}

                        {item.arquivoUrl && (
                          <a
                            href={`${API_URL.replace("/api", "")}${item.arquivoUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-2 flex items-center gap-3 rounded-xl border p-3 ${
                              minha
                                ? "border-blue-400 bg-blue-500"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <FileText size={20} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">
                                {item.arquivoNome ||
                                  nomeArquivo(item.arquivoUrl)}
                              </p>
                              <p
                                className={`text-xs ${
                                  minha ? "text-blue-100" : "text-slate-500"
                                }`}
                              >
                                Clique para abrir ou baixar
                              </p>
                            </div>
                            <Download size={18} />
                          </a>
                        )}

                        <p
                          className={`mt-2 text-right text-[11px] ${
                            minha ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          {dataHora(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={fimRef} />
              </div>
            )}
          </div>

          {arquivo && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
              <span className="truncate">
                Arquivo: <strong>{arquivo.name}</strong>
              </span>
              <button type="button" onClick={() => setArquivo(null)}>
                <X size={17} />
              </button>
            </div>
          )}

          <form
            onSubmit={enviarMensagem}
            className="flex items-end gap-2 border-t border-slate-200 bg-white p-3 sm:p-4"
          >
            <label className="cursor-pointer rounded-xl border border-slate-300 p-3 text-slate-600 transition hover:bg-slate-50">
              <Paperclip size={20} />
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                onChange={(event) =>
                  setArquivo(event.target.files?.[0] || null)
                }
              />
            </label>

            <textarea
              rows="1"
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder="Digite uma mensagem..."
              className="max-h-32 min-h-[46px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={
                enviando ||
                (!texto.trim() && !arquivo) ||
                (
                  tipoChat === "privado" &&
                  !fornecedorLogado &&
                  !fornecedorSelecionado
                )
              }
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}



const API_URL = `${
  import.meta.env.VITE_API_URL || "https://constru-o.onrender.com"
}/api`

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


function SinapiSelector({ material, onSelect, onManualChange }) {
  const [busca, setBusca] = useState(
    material.codigoSinapi
      ? `${material.codigoSinapi} - ${material.item}`
      : material.item || ""
  )
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    setBusca(
      material.codigoSinapi
        ? `${material.codigoSinapi} - ${material.item}`
        : material.item || ""
    )
  }, [material.codigoSinapi, material.item])

  useEffect(() => {
    const termo = busca.trim()

    if (termo.length < 2 || material.codigoSinapi) {
      setResultados([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setBuscando(true)

      try {
        const response = await fetch(
          `${API_URL}/sinapi?busca=${encodeURIComponent(termo)}&limite=20`,
          {
            headers: authHeaders(),
            signal: controller.signal,
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.erro || "Erro ao pesquisar itens SINAPI.")
        }

        setResultados(Array.isArray(data.itens) ? data.itens : [])
        setAberto(true)
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Erro ao pesquisar SINAPI:", error)
          setResultados([])
        }
      } finally {
        setBuscando(false)
      }
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [busca, material.codigoSinapi])

  function alterarBusca(valor) {
    setBusca(valor)
    setAberto(true)

    if (material.codigoSinapi) {
      onManualChange(valor)
    } else {
      onManualChange(valor)
    }
  }

  return (
    <label className="relative grid gap-2 text-sm font-medium text-slate-700">
      Item SINAPI ou descrição manual *

      <div className="relative">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={busca}
          onChange={(event) => alterarBusca(event.target.value)}
          onFocus={() => setAberto(true)}
          placeholder="Digite o código ou descrição SINAPI"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        {buscando && (
          <Loader2
            size={17}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
          />
        )}
      </div>

      {aberto && resultados.length > 0 && (
        <div className="absolute left-0 right-0 top-[74px] z-50 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {resultados.map((item) => (
            <button
              key={item._id || `${item.tipo}-${item.codigo}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(item)
                setAberto(false)
                setResultados([])
              }}
              className="block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-blue-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    {item.tipo === "COMPOSICAO" ? "Composição" : "Insumo"} · {item.codigo}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">
                    {item.descricao}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Unidade: {item.unidade} · PR · Referência {item.referencia}
                  </p>
                </div>

                <strong className="shrink-0 text-sm text-emerald-700">
                  {formatarMoeda(item.preco)}
                </strong>
              </div>
            </button>
          ))}
        </div>
      )}

      {material.codigoSinapi && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <strong>SINAPI {material.codigoSinapi}</strong> · {material.tipoSinapi} ·
          preço PR {formatarMoeda(material.valorSinapi)} por {material.unidade}
        </div>
      )}
    </label>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  let user = {}

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}")
  } catch {
    user = {}
  }

  const fornecedorLogado =
    String(user?.role || "").toLowerCase() === "fornecedor" ||
    String(user?.tipo || "").toLowerCase() === "fornecedor" ||
    String(user?.perfil || "").toLowerCase() === "fornecedor"

  const telasPermitidasFornecedor = [
    "propostas",
    "julgamento",
    "resultado",
  ]

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [telaAtual, setTelaAtual] = useState(
    fornecedorLogado ? "propostas" : "painel"
  )
  const [carregando, setCarregando] = useState(false)

  const [secretarias, setSecretarias] = useState([])
  const [demandas, setDemandas] = useState([])
  const [fornecedores, setFornecedores] = useState([])

  const [solicitacoes, setSolicitacoes] = useState([])
  const [cotacoes, setCotacoes] = useState([])
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

  const [mostrarFormCotacao, setMostrarFormCotacao] = useState(false)
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState(null)
  const [mostrarDetalhesCotacao, setMostrarDetalhesCotacao] = useState(false)
  const [abaCotacao, setAbaCotacao] = useState("visao")
  const [novaCotacao, setNovaCotacao] = useState({
    demandaId: "",
    fornecedorIds: [],
    prazoHoras: 24,
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
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null)
  const formularioArquivoRef = useRef(null)
  const [chatResultado, setChatResultado] = useState(null)
  const [novoArquivo, setNovoArquivo] = useState({
    nome: "",
    tipo: "Documento",
    processo: "",
    observacao: "",
  })
  const [buscaArquivo, setBuscaArquivo] = useState("")
  const [modoArquivos, setModoArquivos] = useState("grade")
  const [pastaArquivo, setPastaArquivo] = useState("Todos")

  const [pastaEmpenhoAtiva, setPastaEmpenhoAtiva] = useState("Todas")
  const [mostrarFormEmpenho, setMostrarFormEmpenho] = useState(false)
  const [empenhosLocais, setEmpenhosLocais] = useState([])
  const [novoEmpenhoLocal, setNovoEmpenhoLocal] = useState({
    secretaria: "",
    numero: "",
    fornecedor: "",
    valor: "",
    descricao: "",
    arquivo: null,
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
      valorManual: "",
      imagemNome: "",
      imagemPreview: "",
      codigoSinapi: "",
      tipoSinapi: "",
      valorSinapi: 0,
      referenciaSinapi: "",
      fonteSinapi: "",
    },
  ])

  const menuCompleto = [
    { id: "painel", nome: "Dashboard", icon: LayoutDashboard },
    { id: "secretarias", nome: "Secretarias", icon: Building2 },
    { id: "demanda", nome: "Nova Demanda", icon: FilePlus2 },
    { id: "orcamento", nome: "Orçamentos", icon: Calculator },
    { id: "solicitacao", nome: "Cotações", icon: Send },
    { id: "fornecedores", nome: "Fornecedores", icon: Truck },
    { id: "propostas", nome: "Propostas", icon: ClipboardList },
    { id: "julgamento", nome: "Julgamento", icon: Scale },
    { id: "resultado", nome: "Resultados", icon: Trophy },
    { id: "empenhos", nome: "Empenhos", icon: ReceiptText },
    { id: "administracao", nome: "Administração", icon: UserCog },
    { id: "arquivos", nome: "Arquivos", icon: FolderOpen },
  ]

  const menu = fornecedorLogado
    ? menuCompleto.filter((item) =>
        telasPermitidasFornecedor.includes(item.id)
      )
    : menuCompleto

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)

    try {
      if (fornecedorLogado) {
        await Promise.all([
          carregarCotacoes(),
          carregarPropostas(),
        ])
      } else {
        await Promise.all([
          carregarSecretarias(),
          carregarDemandas(),
          carregarFornecedores(),
          carregarCotacoes(),
          carregarPropostas(),
        ])
      }
    } finally {
      setCarregando(false)
    }
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

  async function carregarCotacoes() {
    try {
      const response = await fetch(`${API_URL}/cotacoes`, {
        headers: authHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar cotações.")
      }

      setCotacoes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao carregar cotações:", error)
      setCotacoes([])
    }
  }

  async function carregarPropostas() {
    try {
      const response = await fetch(`${API_URL}/propostas`, {
        headers: authHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar propostas.")
      }

      setPropostas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao carregar propostas:", error)
      setPropostas([])
    }
  }

  function alternarFornecedorCotacao(fornecedorId) {
    setNovaCotacao((atual) => {
      const selecionado = atual.fornecedorIds.includes(fornecedorId)

      return {
        ...atual,
        fornecedorIds: selecionado
          ? atual.fornecedorIds.filter((id) => id !== fornecedorId)
          : [...atual.fornecedorIds, fornecedorId],
      }
    })
  }

  function selecionarTodosFornecedoresCotacao() {
    const idsAtivos = fornecedores
      .filter((item) => item.status === "Ativo" && item.email)
      .map((item) => item._id)

    setNovaCotacao((atual) => ({
      ...atual,
      fornecedorIds:
        atual.fornecedorIds.length === idsAtivos.length ? [] : idsAtivos,
    }))
  }

  async function salvarCotacao(event) {
    event.preventDefault()

    if (!novaCotacao.demandaId) {
      alert("Selecione uma demanda.")
      return
    }

    const horas = Number(novaCotacao.prazoHoras)

    if (!Number.isFinite(horas) || horas < 1 || horas > 720) {
      alert("Informe um prazo entre 1 e 720 horas.")
      return
    }

    setCarregando(true)

    try {
      const response = await fetch(`${API_URL}/cotacoes`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          demandaId: novaCotacao.demandaId,
          fornecedorIds: novaCotacao.fornecedorIds,
          prazoHoras: horas,
          observacao: novaCotacao.observacao,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao criar cotação.")
      }

      alert(data.mensagem || "Cotação criada com sucesso.")

      setNovaCotacao({
        demandaId: "",
        fornecedorIds: [],
        prazoHoras: 24,
        observacao: "",
      })
      setMostrarFormCotacao(false)

      await carregarCotacoes()
    } catch (error) {
      console.error(error)
      alert(error.message || "Erro ao criar cotação.")
    } finally {
      setCarregando(false)
    }
  }

  async function executarAcaoCotacao(cotacaoId, acao) {
    const mensagens = {
      reenviar: "Deseja reenviar os e-mails desta cotação?",
      encerrar:
        "Deseja encerrar a cotação agora e calcular automaticamente o menor valor?",
      cancelar: "Deseja cancelar esta cotação?",
    }

    if (mensagens[acao] && !confirm(mensagens[acao])) {
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      alert("Sua sessão expirou. Entre novamente no sistema.")
      sair()
      return
    }

    setCarregando(true)

    try {
      const endpoint = `/cotacoes/${cotacaoId}/${acao}`
      const response =
        acao === "cancelar"
          ? await api.patch(endpoint, {})
          : await api.post(endpoint, {})

      const data = response.data || {}

      alert(data.mensagem || "Ação realizada com sucesso.")

      await Promise.all([
        carregarCotacoes(),
        carregarPropostas(),
      ])

      if (cotacaoSelecionada?.cotacao?._id === cotacaoId) {
        await abrirDetalhesCotacao(cotacaoId)
      }
    } catch (error) {
      console.error("Erro ao executar ação da cotação:", error)

      if (error?.response?.status === 401) {
        alert("Sua sessão expirou. Entre novamente no sistema.")
        sair()
        return
      }

      alert(
        error?.response?.data?.erro ||
          error?.response?.data?.message ||
          error.message ||
          "Erro ao executar a ação."
      )
    } finally {
      setCarregando(false)
    }
  }

  async function excluirCotacao(cotacaoId, numeroCotacao = "") {
    const identificacao = numeroCotacao ? ` ${numeroCotacao}` : ""

    const confirmado = window.confirm(
      `Deseja realmente excluir a cotação${identificacao}?\n\n` +
        "Todas as propostas vinculadas também serão excluídas. " +
        "Esta ação não poderá ser desfeita."
    )

    if (!confirmado) return

    setCarregando(true)

    try {
      const response = await fetch(`${API_URL}/cotacoes/${cotacaoId}`, {
        method: "DELETE",
        headers: authHeaders(),
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json")
        ? await response.json()
        : {
            erro: await response.text(),
          }

      if (!response.ok) {
        throw new Error(
          data.erro ||
            data.message ||
            "Erro ao excluir a cotação."
        )
      }

      if (cotacaoSelecionada?.cotacao?._id === cotacaoId) {
        setMostrarDetalhesCotacao(false)
        setCotacaoSelecionada(null)
      }

      await Promise.all([
        carregarCotacoes(),
        carregarPropostas(),
      ])

      alert(
        data.mensagem ||
          data.message ||
          "Cotação excluída com sucesso."
      )
    } catch (error) {
      console.error("Erro ao excluir cotação:", error)
      alert(error.message || "Erro ao excluir a cotação.")
    } finally {
      setCarregando(false)
    }
  }

  async function abrirDetalhesCotacao(cotacaoId) {
    setCarregando(true)

    try {
      const response = await fetch(`${API_URL}/cotacoes/${cotacaoId}`, {
        headers: authHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar os detalhes.")
      }

      setCotacaoSelecionada(data)
      setAbaCotacao("visao")
      setMostrarDetalhesCotacao(true)
    } catch (error) {
      console.error(error)
      alert(error.message || "Erro ao carregar os detalhes da cotação.")
    } finally {
      setCarregando(false)
    }
  }

  async function julgarPropostaCotacao(
    propostaId,
    status,
    justificativa = ""
  ) {
    if (!propostaId) return

    if (
      status === "Vencedora" &&
      !confirm("Deseja declarar esta proposta como vencedora?")
    ) {
      return
    }

    setCarregando(true)

    try {
      const response = await fetch(
        `${API_URL}/propostas/${propostaId}/julgamento`,
        {
          method: "PATCH",
          headers: authHeaders(true),
          body: JSON.stringify({
            status,
            justificativa,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao julgar proposta.")
      }

      const cotacaoId = cotacaoSelecionada?.cotacao?._id

      if (cotacaoId) {
        const detalhesResponse = await fetch(
          `${API_URL}/cotacoes/${cotacaoId}`,
          {
            headers: authHeaders(),
          }
        )

        const detalhes = await detalhesResponse.json()

        if (!detalhesResponse.ok) {
          throw new Error(
            detalhes.erro || "Erro ao atualizar os detalhes da cotação."
          )
        }

        setCotacaoSelecionada(detalhes)
      }

      await Promise.all([carregarCotacoes(), carregarPropostas()])
      alert("Julgamento salvo com sucesso.")
    } catch (error) {
      console.error(error)
      alert(error.message || "Erro ao julgar proposta.")
    } finally {
      setCarregando(false)
    }
  }

  async function abrirCotacaoNaAba(cotacaoId, aba = "visao") {
    if (!cotacaoId) {
      alert("Cotação não identificada.")
      return
    }

    setCarregando(true)

    try {
      const response = await fetch(`${API_URL}/cotacoes/${cotacaoId}`, {
        headers: authHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar a cotação.")
      }

      setCotacaoSelecionada(data)
      setAbaCotacao(aba)
      setMostrarDetalhesCotacao(true)
    } catch (error) {
      console.error(error)
      alert(error.message || "Erro ao abrir a cotação.")
    } finally {
      setCarregando(false)
    }
  }

  async function abrirResultadoCotacao(cotacaoId) {
    if (!cotacaoId) {
      alert("Cotação não identificada.")
      return
    }

    // O modal de detalhes pertence à tela de Cotações.
    // Por isso, primeiro abrimos essa tela e depois carregamos a aba Resultado.
    setTelaAtual("solicitacao")
    setSidebarOpen(false)
    await abrirCotacaoNaAba(cotacaoId, "resultado")
  }

  async function gerarRelatorioLances(cotacaoId) {
    if (!cotacaoId) {
      alert("Cotação não identificada.")
      return
    }

    const escaparHtml = (valor = "") =>
      String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")

    setCarregando(true)

    try {
      const response = await fetch(`${API_URL}/cotacoes/${cotacaoId}`, {
        headers: authHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao carregar os dados do relatório.")
      }

      const cotacao = data.cotacao || {}
      const demanda = cotacao.demanda || {}
      const propostasRelatorio = Array.isArray(data.propostas)
        ? [...data.propostas].sort(
            (a, b) =>
              new Date(a.createdAt || 0).getTime() -
              new Date(b.createdAt || 0).getTime()
          )
        : []

      const materiais = Array.isArray(demanda.materiais)
        ? demanda.materiais
        : []

      const linhasPorItem = materiais
        .map((material, indiceItem) => {
          const descricao =
            material.item || material.material || `Item ${indiceItem + 1}`

          const linhas = propostasRelatorio
            .map((proposta) => {
              const itemProposta = proposta.itens?.[indiceItem] || {}
              const nomeEmpresa =
                proposta.empresa ||
                proposta.fornecedor?.empresa ||
                proposta.fornecedor?.razaoSocial ||
                proposta.fornecedor?.responsavel ||
                "Fornecedor não identificado"

              const valorUnitario = Number(itemProposta.valorUnitario || 0)
              const status = proposta.status || "Recebida"

              return `
                <tr>
                  <td>${escaparHtml(dataHora(proposta.createdAt) || "-")}</td>
                  <td>${escaparHtml(nomeEmpresa)}</td>
                  <td>${escaparHtml(status.toUpperCase())}</td>
                  <td class="valor">${escaparHtml(formatarMoeda(valorUnitario))}</td>
                </tr>
              `
            })
            .join("")

          return `
            <section class="lote">
              <h3>ITEM ${indiceItem + 1} - ${escaparHtml(descricao)}</h3>
              <p class="detalhe">Quantidade: ${escaparHtml(
                material.quantidade || 0
              )} ${escaparHtml(material.unidade || "")}</p>
              <table>
                <thead>
                  <tr>
                    <th>DATA/HORA</th>
                    <th>EMPRESA</th>
                    <th>SITUAÇÃO</th>
                    <th>VALOR UNITÁRIO</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    linhas ||
                    '<tr><td colspan="4" class="vazio">Nenhuma proposta recebida para este item.</td></tr>'
                  }
                </tbody>
              </table>
            </section>
          `
        })
        .join("")

      const resumoPropostas = propostasRelatorio
        .map((proposta, indice) => {
          const nomeEmpresa =
            proposta.empresa ||
            proposta.fornecedor?.empresa ||
            proposta.fornecedor?.razaoSocial ||
            proposta.fornecedor?.responsavel ||
            "Fornecedor não identificado"

          return `
            <tr>
              <td>${indice + 1}º</td>
              <td>${escaparHtml(nomeEmpresa)}</td>
              <td>${escaparHtml(proposta.cnpj || "-")}</td>
              <td>${escaparHtml(proposta.prazoEntrega || "-")}</td>
              <td>${escaparHtml(proposta.status || "Recebida")}</td>
              <td class="valor">${escaparHtml(
                formatarMoeda(proposta.valorTotal || 0)
              )}</td>
            </tr>
          `
        })
        .join("")

      const janela = window.open("", "_blank", "width=1000,height=800")

      if (!janela) {
        throw new Error(
          "O navegador bloqueou a abertura do relatório. Permita pop-ups e tente novamente."
        )
      }

      janela.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8" />
            <title>Relatório de Lances - ${escaparHtml(
              cotacao.numero || "Cotação"
            )}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              * { box-sizing: border-box; }
              body {
                margin: 0;
                font-family: Arial, Helvetica, sans-serif;
                color: #111827;
                font-size: 11px;
              }
              .cabecalho {
                text-align: center;
                border-bottom: 2px solid #111827;
                padding-bottom: 12px;
                margin-bottom: 16px;
              }
              .cabecalho h1 { margin: 0 0 8px; font-size: 20px; }
              .cabecalho h2 { margin: 0; font-size: 15px; }
              .cabecalho p { margin: 5px 0 0; }
              .dados {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px 20px;
                margin-bottom: 18px;
              }
              .dados div { border-bottom: 1px solid #d1d5db; padding: 5px 0; }
              .lote { margin: 18px 0; break-inside: avoid; }
              .lote h3 {
                margin: 0;
                padding: 8px;
                background: #e5e7eb;
                border: 1px solid #9ca3af;
                font-size: 12px;
              }
              .detalhe { margin: 6px 0; color: #4b5563; }
              table { width: 100%; border-collapse: collapse; margin-top: 7px; }
              th, td { border: 1px solid #9ca3af; padding: 7px; vertical-align: top; }
              th { background: #f3f4f6; font-size: 10px; text-align: left; }
              .valor { text-align: right; white-space: nowrap; font-weight: 700; }
              .vazio { text-align: center; color: #6b7280; }
              .resumo { margin-top: 22px; break-inside: avoid; }
              .resumo h3 { margin-bottom: 8px; font-size: 13px; }
              .rodape {
                margin-top: 22px;
                padding-top: 8px;
                border-top: 1px solid #9ca3af;
                display: flex;
                justify-content: space-between;
                color: #4b5563;
                font-size: 9px;
              }
              .acoes { margin-bottom: 16px; text-align: right; }
              .acoes button {
                border: 0;
                border-radius: 6px;
                padding: 9px 14px;
                background: #1d4ed8;
                color: white;
                font-weight: bold;
                cursor: pointer;
              }
              @media print { .acoes { display: none; } }
            </style>
          </head>
          <body>
            <div class="acoes">
              <button onclick="window.print()">Imprimir / Salvar em PDF</button>
            </div>

            <div class="cabecalho">
              <h1>RELATÓRIO DE LANCES</h1>
              <h2>COTAÇÃO ELETRÔNICA Nº ${escaparHtml(
                cotacao.numero || "-"
              )}</h2>
              <p>MUNICÍPIO DE GENERAL CARNEIRO - PR</p>
            </div>

            <div class="dados">
              <div><strong>Demanda:</strong> ${escaparHtml(
                demanda.numeroDemanda || "-"
              )}</div>
              <div><strong>Status:</strong> ${escaparHtml(
                cotacao.status || "-"
              )}</div>
              <div><strong>Objeto:</strong> ${escaparHtml(
                demanda.objeto || "-"
              )}</div>
              <div><strong>Encerramento:</strong> ${escaparHtml(
                dataHora(cotacao.encerraEm) || "-"
              )}</div>
              <div><strong>Secretaria:</strong> ${escaparHtml(
                demanda.secretaria || "-"
              )}</div>
              <div><strong>Propostas recebidas:</strong> ${propostasRelatorio.length}</div>
            </div>

            ${linhasPorItem || '<p class="vazio">Nenhum item encontrado.</p>'}

            <section class="resumo">
              <h3>CLASSIFICAÇÃO FINAL DAS PROPOSTAS</h3>
              <table>
                <thead>
                  <tr>
                    <th>CLASSIFICAÇÃO</th>
                    <th>EMPRESA</th>
                    <th>CNPJ</th>
                    <th>ENTREGA</th>
                    <th>STATUS</th>
                    <th>VALOR TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    resumoPropostas ||
                    '<tr><td colspan="6" class="vazio">Nenhuma proposta recebida.</td></tr>'
                  }
                </tbody>
              </table>
            </section>

            <div class="rodape">
              <span>Gerado em: ${escaparHtml(new Date().toLocaleString("pt-BR"))}</span>
              <span>Sistema de Compras - Prefeitura de General Carneiro/PR</span>
            </div>
          </body>
        </html>
      `)

      janela.document.close()
      janela.focus()
    } catch (error) {
      console.error("Erro ao gerar relatório de lances:", error)
      alert(error.message || "Erro ao gerar o relatório de lances.")
    } finally {
      setCarregando(false)
    }
  }

  async function copiarLinkCotacao(token) {
    const link = `${window.location.origin}/cotacao/${token}`

    try {
      await navigator.clipboard.writeText(link)
      alert("Link copiado.")
    } catch (error) {
      console.error(error)
      window.prompt("Copie o link abaixo:", link)
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
        codigoSinapi: "",
        tipoSinapi: "",
        valorSinapi: 0,
        referenciaSinapi: "",
        fonteSinapi: "",
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


  function alterarImagemItem(id, arquivo) {
    if (!arquivo) {
      alterarItem(id, "imagemNome", "")
      alterarItem(id, "imagemPreview", "")
      return
    }

    if (!arquivo.type?.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.")
      return
    }

    const leitor = new FileReader()
    leitor.onload = () => {
      setMateriais((old) =>
        old.map((item) =>
          item.id === id
            ? {
                ...item,
                imagemNome: arquivo.name,
                imagemPreview: String(leitor.result || ""),
              }
            : item
        )
      )
    }
    leitor.readAsDataURL(arquivo)
  }

  function selecionarItemSinapi(id, itemSinapi) {
    setMateriais((old) =>
      old.map((item) =>
        item.id === id
          ? {
              ...item,
              item: itemSinapi.descricao,
              unidade: itemSinapi.unidade,
              codigoSinapi: itemSinapi.codigo,
              tipoSinapi: itemSinapi.tipo,
              valorSinapi: Number(itemSinapi.preco || 0),
              referenciaSinapi: itemSinapi.referencia || "05/2026",
              fonteSinapi: "SINAPI",
            }
          : item
      )
    )
  }

  function alterarDescricaoManualSinapi(id, valor) {
    setMateriais((old) =>
      old.map((item) =>
        item.id === id
          ? {
              ...item,
              item: valor,
              codigoSinapi: "",
              tipoSinapi: "",
              valorSinapi: 0,
              referenciaSinapi: "",
              fonteSinapi: "",
            }
          : item
      )
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
        {
          id: 1,
          item: "",
          quantidade: "",
          unidade: "",
          observacao: "",
          codigoSinapi: "",
          tipoSinapi: "",
          valorSinapi: 0,
          referenciaSinapi: "",
          fonteSinapi: "",
        },
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

  function abrirFormularioArquivo() {
    setMostrarFormArquivo(true)
    window.setTimeout(() => {
      formularioArquivoRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 80)
  }

  function salvarArquivo(event) {
    event.preventDefault()

    if (!novoArquivo.nome.trim()) {
      alert("Informe o nome do arquivo.")
      return
    }

    if (!arquivoSelecionado) {
      alert("Selecione um arquivo para continuar.")
      return
    }

    const urlLocal = URL.createObjectURL(arquivoSelecionado)

    setArquivos((old) => [
      {
        id: crypto.randomUUID(),
        ...novoArquivo,
        nome: novoArquivo.nome.trim(),
        arquivoNome: arquivoSelecionado.name,
        arquivoUrl: urlLocal,
        tamanho: `${(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB`,
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
    setArquivoSelecionado(null)
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

  const totalReferenciaSinapi = materiais.reduce(
    (total, item) =>
      total +
      Number(item.quantidade || 0) *
        Number(item.valorManual || item.valorSinapi || 0),
    0
  )

  const propostasOrdenadas = [...propostas].sort(
    (a, b) =>
      Number(a.valorTotal || a.valor || 0) -
      Number(b.valorTotal || b.valor || 0)
  )
  const vencedora = propostasOrdenadas.find(
    (item) =>
      item.status === "Aprovado" ||
      item.status === "Vencedor" ||
      item.status === "Vencedora"
  )
  const menorProposta = propostasOrdenadas[0]

  function abrirTela(id) {
    if (
      fornecedorLogado &&
      !telasPermitidasFornecedor.includes(id)
    ) {
      setTelaAtual("propostas")
      setSidebarOpen(false)
      return
    }

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
          title="Cotações enviadas"
          value={cotacoes.length}
          description="Cotações enviadas aos fornecedores"
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
                    <SinapiSelector
                      material={material}
                      onSelect={(itemSinapi) =>
                        selecionarItemSinapi(material.id, itemSinapi)
                      }
                      onManualChange={(valor) =>
                        alterarDescricaoManualSinapi(material.id, valor)
                      }
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
                      <option value="UN">UN - Unidade</option>
                      <option value="KG">KG - Quilograma</option>
                      <option value="G">G - Grama</option>
                      <option value="T">T - Tonelada</option>
                      <option value="L">L - Litro</option>
                      <option value="ML">ML - Mililitro</option>
                      <option value="M">M - Metro</option>
                      <option value="M2">M2 - Metro quadrado</option>
                      <option value="M3">M3 - Metro cúbico</option>
                      <option value="KM">KM - Quilômetro</option>
                      <option value="H">H - Hora</option>
                      <option value="H/DIA">H/DIA - Hora por dia</option>
                      <option value="MES">MES - Mês</option>
                      <option value="DIA">DIA - Dia</option>
                      <option value="CHI">CHI - Custo horário improdutivo</option>
                      <option value="CHP">CHP - Custo horário produtivo</option>
                      <option value="CJ">CJ - Conjunto</option>
                      <option value="PAR">PAR - Par</option>
                      <option value="JG">JG - Jogo</option>
                      <option value="KIT">KIT - Kit</option>
                      <option value="PCT">PCT - Pacote</option>
                      <option value="SC">SC - Saco</option>
                      <option value="CX">CX - Caixa</option>
                      <option value="GL">GL - Galão</option>
                      <option value="BD">BD - Balde</option>
                      <option value="RL">RL - Rolo</option>
                      <option value="FL">FL - Folha</option>
                      <option value="BR">BR - Barra</option>
                      <option value="PÇ">PÇ - Peça</option>
                      <option value="MIL">MIL - Milheiro</option>
                      <option value="CENTO">CENTO - Cento</option>
                    </Select>
                    <Input
                      label="Observação"
                      value={material.observacao}
                      onChange={(event) =>
                        alterarItem(material.id, "observacao", event.target.value)
                      }
                      placeholder="Detalhes técnicos do item"
                    />
                    <Input
                      label="Valor unitário manual (R$)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={material.valorManual || ""}
                      onChange={(event) =>
                        alterarItem(material.id, "valorManual", event.target.value)
                      }
                      placeholder="0,00"
                    />

                    <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                      Imagem do item
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          {material.imagemPreview ? (
                            <img
                              src={material.imagemPreview}
                              alt={`Imagem do item ${index + 1}`}
                              className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <Upload size={28} />
                            </div>
                          )}

                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={(event) =>
                                alterarImagemItem(
                                  material.id,
                                  event.target.files?.[0] || null
                                )
                              }
                              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                              PNG, JPG ou WEBP. A imagem será vinculada ao item.
                            </p>
                            {material.imagemNome && (
                              <p className="mt-1 truncate text-xs font-medium text-slate-700">
                                {material.imagemNome}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>

                  {material.codigoSinapi && (
                    <div className="mt-4 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase text-emerald-700">Preço unitário SINAPI</p>
                        <p className="mt-1 font-bold text-emerald-900">
                          {formatarMoeda(material.valorSinapi)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-emerald-700">Quantidade</p>
                        <p className="mt-1 font-bold text-emerald-900">
                          {Number(material.quantidade || 0)} {material.unidade}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-emerald-700">Total de referência</p>
                        <p className="mt-1 font-bold text-emerald-900">
                          {formatarMoeda(
                            Number(material.quantidade || 0) *
                              Number(material.valorSinapi || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  )}
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

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Total de referência SINAPI PR
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-800">
                {formatarMoeda(totalReferenciaSinapi)}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Referência 05/2026 · sem encargos sociais
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
        eyebrow="Cotação eletrônica"
        title="Cotações com fornecedores"
        description="Selecione uma demanda, convide vários fornecedores e defina o prazo máximo para o envio das propostas."
        actionLabel="Nova cotação"
        onAction={() => setMostrarFormCotacao(true)}
        secondaryAction={
          <button
            type="button"
            onClick={carregarCotacoes}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Atualizar
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Cotações cadastradas"
          value={cotacoes.length}
          description="Total de processos criados"
          icon={Send}
          tone="blue"
        />

        <MetricCard
          title="Cotações abertas"
          value={cotacoes.filter((item) => item.status === "Aberta").length}
          description="Ainda recebendo propostas"
          icon={Clock3}
          tone="amber"
        />

        <MetricCard
          title="Fornecedores convidados"
          value={cotacoes.reduce(
            (total, item) => total + (item.participantes?.length || 0),
            0
          )}
          description="Convites enviados por e-mail"
          icon={Users}
          tone="violet"
        />

        <MetricCard
          title="Cotações finalizadas"
          value={cotacoes.filter((item) => item.status === "Finalizada").length}
          description="Com resultado calculado"
          icon={Trophy}
          tone="emerald"
        />
      </div>

      {mostrarFormCotacao && (
        <Card className="mt-6">
          <CardHeader
            title="Nova cotação eletrônica"
            description="A mesma demanda será enviada para todos os fornecedores selecionados."
            action={
              <button
                type="button"
                onClick={() => setMostrarFormCotacao(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            }
          />

          <form onSubmit={salvarCotacao}>
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <Select
                label="Demanda *"
                value={novaCotacao.demandaId}
                onChange={(event) =>
                  setNovaCotacao((atual) => ({
                    ...atual,
                    demandaId: event.target.value,
                  }))
                }
              >
                <option value="">Selecione uma demanda</option>

                {demandas.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.numeroDemanda} - {item.objeto}
                  </option>
                ))}
              </Select>

              <Input
                label="Prazo máximo em horas *"
                type="number"
                min="1"
                max="720"
                value={novaCotacao.prazoHoras}
                onChange={(event) =>
                  setNovaCotacao((atual) => ({
                    ...atual,
                    prazoHoras: event.target.value,
                  }))
                }
              />

              <div className="lg:col-span-2">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Fornecedores participantes *
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Apenas fornecedores ativos e com e-mail podem participar.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={selecionarTodosFornecedoresCotacao}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <ListChecks size={16} />
                    {novaCotacao.fornecedorIds.length ===
                    fornecedores.filter(
                      (item) => item.status === "Ativo" && item.email
                    ).length
                      ? "Limpar seleção"
                      : "Selecionar todos"}
                  </button>
                </div>

                <div className="grid max-h-80 gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {fornecedores
                    .filter((item) => item.status === "Ativo" && item.email)
                    .map((item) => {
                      const selecionado =
                        novaCotacao.fornecedorIds.includes(item._id)

                      return (
                        <label
                          key={item._id}
                          className={`cursor-pointer rounded-xl border p-4 transition ${
                            selecionado
                              ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 bg-white hover:border-blue-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selecionado}
                              onChange={() =>
                                alternarFornecedorCotacao(item._id)
                              }
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {item.empresa}
                              </p>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {item.email}
                              </p>
                              <p className="mt-1 truncate text-xs text-slate-400">
                                {item.cnpj || "CNPJ não informado"}
                              </p>
                            </div>
                          </div>
                        </label>
                      )
                    })}

                  {fornecedores.filter(
                    (item) => item.status === "Ativo" && item.email
                  ).length === 0 && (
                    <div className="py-8 text-center md:col-span-2 xl:col-span-3">
                      <Truck className="mx-auto text-slate-400" size={28} />
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Nenhum fornecedor disponível
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Cadastre um fornecedor ativo com e-mail.
                      </p>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-sm font-semibold text-blue-700">
                  {novaCotacao.fornecedorIds.length} fornecedor(es) selecionado(s) — opcional
                </p>
              </div>

              <Textarea
                label="Observações para os fornecedores"
                className="lg:col-span-2"
                rows="4"
                value={novaCotacao.observacao}
                onChange={(event) =>
                  setNovaCotacao((atual) => ({
                    ...atual,
                    observacao: event.target.value,
                  }))
                }
                placeholder="Ex.: informar marca, frete, prazo de entrega e validade da proposta."
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMostrarFormCotacao(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={carregando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Criando e enviando...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Criar e enviar cotação
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Cotações cadastradas"
          description={`${cotacoes.length} registro(s) encontrado(s).`}
        />

        {cotacoes.length === 0 ? (
          <EmptyState
            icon={Send}
            title="Nenhuma cotação cadastrada"
            description="Crie uma cotação para enviar a demanda a vários fornecedores."
            actionLabel="Nova cotação"
            onAction={() => setMostrarFormCotacao(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Cotação</th>
                  <th className="px-5 py-3.5">Demanda</th>
                  <th className="px-5 py-3.5">Fornecedores</th>
                  <th className="px-5 py-3.5">E-mails</th>
                  <th className="px-5 py-3.5">Respostas</th>
                  <th className="px-5 py-3.5">Encerramento</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Vencedor</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {cotacoes.map((item) => {
                  const participantes = item.participantes || []
                  const emailsEnviados = participantes.filter(
                    (participante) => participante.emailEnviado
                  ).length
                  const respostas = participantes.filter(
                    (participante) => participante.respondeuEm
                  ).length
                  const vencedoraCotacao = item.propostaVencedora

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.numero}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Prazo: {item.prazoHoras}h
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.demanda?.numeroDemanda || "-"}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {item.demanda?.objeto || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {participantes.length}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            emailsEnviados === participantes.length
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          {emailsEnviados}/{participantes.length}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-blue-700">
                          {respostas}/{participantes.length}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.encerraEm
                          ? new Date(item.encerraEm).toLocaleString("pt-BR")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-5 py-4">
                        {vencedoraCotacao ? (
                          <div>
                            <p className="max-w-[180px] truncate text-sm font-semibold text-emerald-700">
                              {vencedoraCotacao.fornecedor?.empresa ||
                                vencedoraCotacao.fornecedor?.razaoSocial ||
                                "Fornecedor vencedor"}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {formatarMoeda(
                                vencedoraCotacao.valorTotal ||
                                  vencedoraCotacao.valor
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Aguardando</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            title="Visualizar detalhes"
                            icon={Eye}
                            onClick={() => abrirDetalhesCotacao(item._id)}
                          />

                          <ActionButton
                            title="Copiar link público da cotação"
                            icon={Copy}
                            tone="blue"
                            onClick={() =>
                              copiarLinkCotacao(item.tokenPublico)
                            }
                          />

                          <ActionButton
                            title="Conversar com fornecedores"
                            icon={MessageCircle}
                            tone="emerald"
                            onClick={() =>
                              setChatResultado({
                                cotacaoId: item._id,
                                numero:
                                  item.numero ||
                                  item.numeroCotacao ||
                                  item._id,
                                fornecedor: "",
                              })
                            }
                          />

                          {item.status === "Aberta" && (
                            <>
                              <ActionButton
                                title="Copiar link público"
                                icon={Copy}
                                tone="blue"
                                onClick={() =>
                                  copiarLinkCotacao(item.tokenPublico)
                                }
                              />

                              <ActionButton
                                title="Encerrar e calcular vencedor"
                                icon={Trophy}
                                tone="emerald"
                                onClick={() =>
                                  executarAcaoCotacao(item._id, "encerrar")
                                }
                              />

                              <ActionButton
                                title="Cancelar cotação"
                                icon={CircleX}
                                tone="red"
                                onClick={() =>
                                  executarAcaoCotacao(item._id, "cancelar")
                                }
                              />
                            </>
                          )}

                          <ActionButton
                            title="Excluir cotação definitivamente"
                            icon={Trash2}
                            tone="red"
                            onClick={() =>
                              excluirCotacao(item._id, item.numero)
                            }
                          />
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

      {mostrarDetalhesCotacao && cotacaoSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {cotacaoSelecionada.cotacao?.numero || "Detalhes da cotação"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Propostas, julgamento e resultado da cotação.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMostrarDetalhesCotacao(false)
                  setCotacaoSelecionada(null)
                  setAbaCotacao("visao")
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="sticky top-[73px] z-10 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-5">
              {[
                ["visao", "Visão geral", Eye],
                ["propostas", "Propostas", ClipboardList],
                ["julgamento", "Julgamento", Gavel],
                ["resultado", "Resultado", Trophy],
              ].map(([id, nome, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAbaCotacao(id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    abaCotacao === id
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon size={16} />
                  {nome}
                </button>
              ))}
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Demanda
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {cotacaoSelecionada.cotacao?.demanda?.numeroDemanda || "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Propostas recebidas
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {(cotacaoSelecionada.propostas || []).length}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Encerramento
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {cotacaoSelecionada.cotacao?.encerraEm
                      ? new Date(
                          cotacaoSelecionada.cotacao.encerraEm
                        ).toLocaleString("pt-BR")
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge
                      status={cotacaoSelecionada.cotacao?.status || "Aberta"}
                    />
                  </div>
                </div>
              </div>

              {abaCotacao === "visao" && (
                <Card>
                  <CardHeader
                    title="Fornecedores convidados"
                    description="Situação do envio, visualização e resposta."
                  />

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3.5">Fornecedor</th>
                          <th className="px-5 py-3.5">E-mail</th>
                          <th className="px-5 py-3.5">Envio</th>
                          <th className="px-5 py-3.5">Visualização</th>
                          <th className="px-5 py-3.5">Resposta</th>
                          <th className="px-5 py-3.5 text-right">Link</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {(
                          cotacaoSelecionada.cotacao?.participantes || []
                        ).map((participante) => (
                          <tr key={participante._id || participante.token}>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                              {participante.fornecedor?.empresa ||
                                participante.fornecedor?.razaoSocial ||
                                "Fornecedor"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {participante.email ||
                                participante.fornecedor?.email ||
                                "-"}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  participante.emailEnviado
                                    ? "Enviado"
                                    : "Pendente"
                                }
                              />
                              {participante.erroEmail && (
                                <p className="mt-2 max-w-xs text-xs text-red-600">
                                  {participante.erroEmail}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {participante.visualizadoEm
                                ? new Date(
                                    participante.visualizadoEm
                                  ).toLocaleString("pt-BR")
                                : "Não visualizado"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {participante.respondeuEm
                                ? new Date(
                                    participante.respondeuEm
                                  ).toLocaleString("pt-BR")
                                : "Aguardando"}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end">
                                <ActionButton
                                  title="Copiar link do fornecedor"
                                  icon={Copy}
                                  tone="blue"
                                  onClick={() =>
                                    copiarLinkCotacao(participante.token)
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {abaCotacao === "propostas" && (
                <Card>
                  <CardHeader
                    title="Propostas recebidas"
                    description="Propostas enviadas diretamente pelos fornecedores."
                  />

                  {(cotacaoSelecionada.propostas || []).length === 0 ? (
                    <EmptyState
                      icon={ClipboardList}
                      title="Nenhuma proposta recebida"
                      description="Os fornecedores ainda não enviaram valores para esta cotação."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[980px]">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-5 py-3.5">Classificação</th>
                            <th className="px-5 py-3.5">Fornecedor</th>
                            <th className="px-5 py-3.5">Valor total</th>
                            <th className="px-5 py-3.5">Entrega</th>
                            <th className="px-5 py-3.5">Validade</th>
                            <th className="px-5 py-3.5">Recebida em</th>
                            <th className="px-5 py-3.5">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {(cotacaoSelecionada.propostas || []).map(
                            (proposta, index) => (
                              <tr key={proposta._id}>
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
                                  {proposta.fornecedor?.empresa ||
                                    proposta.fornecedor?.razaoSocial ||
                                    "Fornecedor"}
                                </td>

                                <td className="px-5 py-4 text-sm font-bold text-slate-900">
                                  {formatarMoeda(
                                    proposta.valorTotal || proposta.valor
                                  )}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {proposta.prazoEntrega || "-"}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {proposta.validadeDias ||
                                    proposta.validade ||
                                    60}{" "}
                                  dias
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {proposta.recebidaEm || proposta.createdAt
                                    ? new Date(
                                        proposta.recebidaEm ||
                                          proposta.createdAt
                                      ).toLocaleString("pt-BR")
                                    : "-"}
                                </td>

                                <td className="px-5 py-4">
                                  <StatusBadge status={proposta.status} />
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}

              {abaCotacao === "julgamento" && (
                <Card>
                  <CardHeader
                    title="Julgamento das propostas"
                    description="Classifique, desclassifique ou declare a proposta vencedora."
                  />

                  {(cotacaoSelecionada.propostas || []).length === 0 ? (
                    <EmptyState
                      icon={Gavel}
                      title="Nenhuma proposta para julgar"
                      description="Aguarde o recebimento das propostas dos fornecedores."
                    />
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {(cotacaoSelecionada.propostas || []).map(
                        (proposta, index) => (
                          <div
                            key={proposta._id}
                            className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                  index === 0
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {index + 1}º
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {proposta.fornecedor?.empresa ||
                                    proposta.fornecedor?.razaoSocial ||
                                    "Fornecedor"}
                                </p>
                                <p className="mt-1 text-xl font-bold text-slate-900">
                                  {formatarMoeda(
                                    proposta.valorTotal || proposta.valor
                                  )}
                                </p>
                                <div className="mt-2">
                                  <StatusBadge status={proposta.status} />
                                </div>
                                {proposta.justificativaJulgamento && (
                                  <p className="mt-2 max-w-2xl text-sm text-red-600">
                                    {proposta.justificativaJulgamento}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={carregando}
                                onClick={() =>
                                  julgarPropostaCotacao(
                                    proposta._id,
                                    "Classificada"
                                  )
                                }
                                className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                              >
                                Classificar
                              </button>

                              <button
                                type="button"
                                disabled={carregando}
                                onClick={() => {
                                  const motivo = prompt(
                                    "Informe o motivo da desclassificação:"
                                  )

                                  if (motivo?.trim()) {
                                    julgarPropostaCotacao(
                                      proposta._id,
                                      "Desclassificada",
                                      motivo.trim()
                                    )
                                  }
                                }}
                                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                Desclassificar
                              </button>

                              <button
                                type="button"
                                disabled={
                                  carregando ||
                                  proposta.status === "Desclassificada"
                                }
                                onClick={() =>
                                  julgarPropostaCotacao(
                                    proposta._id,
                                    "Vencedora"
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trophy size={16} />
                                Declarar vencedora
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </Card>
              )}

              {abaCotacao === "resultado" && (
                <Card>
                  <CardHeader
                    title="Resultado da cotação"
                    description="Resultado final definido no julgamento."
                  />

                  {!cotacaoSelecionada.cotacao?.propostaVencedora ? (
                    <EmptyState
                      icon={Trophy}
                      title="Resultado ainda não definido"
                      description="Abra a aba Julgamento e declare uma proposta vencedora."
                    />
                  ) : (
                    <div className="p-6">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                          <div className="w-fit rounded-xl bg-emerald-600 p-3 text-white">
                            <Trophy size={26} />
                          </div>

                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                              Proposta vencedora
                            </p>

                            <h3 className="mt-2 text-xl font-bold text-emerald-950">
                              {cotacaoSelecionada.cotacao.propostaVencedora
                                .fornecedor?.empresa ||
                                cotacaoSelecionada.cotacao.propostaVencedora
                                  .fornecedor?.razaoSocial ||
                                "Fornecedor vencedor"}
                            </h3>

                            <p className="mt-3 text-3xl font-bold text-emerald-700">
                              {formatarMoeda(
                                cotacaoSelecionada.cotacao
                                  .propostaVencedora.valorTotal ||
                                  cotacaoSelecionada.cotacao
                                    .propostaVencedora.valor
                              )}
                            </p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-xl bg-white/70 p-4">
                                <p className="text-xs uppercase text-emerald-700">
                                  Cotação
                                </p>
                                <p className="mt-1 font-semibold text-emerald-950">
                                  {cotacaoSelecionada.cotacao.numero}
                                </p>
                              </div>

                              <div className="rounded-xl bg-white/70 p-4">
                                <p className="text-xs uppercase text-emerald-700">
                                  Entrega
                                </p>
                                <p className="mt-1 font-semibold text-emerald-950">
                                  {cotacaoSelecionada.cotacao.propostaVencedora
                                    .prazoEntrega || "-"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-white/70 p-4">
                                <p className="text-xs uppercase text-emerald-700">
                                  Validade
                                </p>
                                <p className="mt-1 font-semibold text-emerald-950">
                                  {cotacaoSelecionada.cotacao.propostaVencedora
                                    .validadeDias || 60}{" "}
                                  dias
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

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
        eyebrow="Recepção de propostas"
        title="Propostas eletrônicas"
        description="Acompanhe as propostas enviadas pelos fornecedores, seus valores e a situação de cada participação."
        secondaryAction={
          <button
            type="button"
            onClick={carregarPropostas}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Atualizar propostas
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Propostas recebidas"
          value={propostas.length}
          description="Enviadas pelo portal do fornecedor"
          icon={ClipboardList}
          tone="blue"
        />

        <MetricCard
          title="Em análise"
          value={
            propostas.filter((item) =>
              ["Recebida", "Em análise", "Pendente"].includes(item.status)
            ).length
          }
          description="Aguardando decisão administrativa"
          icon={Clock3}
          tone="amber"
        />

        <MetricCard
          title="Classificadas"
          value={
            propostas.filter((item) =>
              ["Classificada", "Aprovado", "Vencedora", "Vencedor"].includes(
                item.status
              )
            ).length
          }
          description="Aptas para o resultado"
          icon={BadgeCheck}
          tone="emerald"
        />

        <MetricCard
          title="Menor valor"
          value={
            menorProposta
              ? formatarMoeda(
                  menorProposta.valorTotal || menorProposta.valor
                )
              : "R$ 0,00"
          }
          description="Menor proposta recebida"
          icon={CircleDollarSign}
          tone="violet"
        />
      </div>

      <Card className="mt-6">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Painel de propostas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Propostas ordenadas pelo menor valor total.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Recebida
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Classificada
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                Desclassificada
              </span>
            </div>
          </div>
        </div>

        {propostas.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma proposta recebida"
            description="As propostas enviadas pelos fornecedores pelo link da cotação aparecerão automaticamente nesta tela."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Posição</th>
                  <th className="px-5 py-3.5">Cotação</th>
                  <th className="px-5 py-3.5">Fornecedor</th>
                  <th className="px-5 py-3.5">Valor total</th>
                  <th className="px-5 py-3.5">Entrega</th>
                  <th className="px-5 py-3.5">Validade</th>
                  <th className="px-5 py-3.5">Recebida em</th>
                  <th className="px-5 py-3.5">Situação</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {propostasOrdenadas.map((item, index) => {
                  const fornecedorNome =
                    item.fornecedor?.empresa ||
                    item.fornecedor?.razaoSocial ||
                    item.fornecedor?.responsavel ||
                    item.fornecedor ||
                    "Fornecedor"

                  const cotacaoId =
                    item.cotacao?._id ||
                    item.cotacao ||
                    item.cotacaoId

                  const numeroCotacao =
                    item.cotacao?.numero ||
                    item.numeroCotacao ||
                    "-"

                  return (
                    <tr key={item._id || item.id} className="hover:bg-slate-50/70">
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

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {numeroCotacao}
                        </p>
                        <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                          {item.cotacao?.demanda?.objeto ||
                            item.objeto ||
                            "Cotação eletrônica"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {fornecedorNome}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.fornecedor?.email || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-950">
                        {formatarMoeda(item.valorTotal || item.valor)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.prazoEntrega || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.validadeDias || item.validade || 60} dias
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.recebidaEm || item.createdAt
                          ? new Date(
                              item.recebidaEm || item.createdAt
                            ).toLocaleString("pt-BR")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={item.status || "Recebida"} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            title="Abrir cotação e visualizar proposta"
                            icon={Eye}
                            tone="blue"
                            onClick={() =>
                              abrirCotacaoNaAba(cotacaoId, "propostas")
                            }
                          />

                          <ActionButton
                            title="Abrir julgamento"
                            icon={Gavel}
                            tone="emerald"
                            onClick={() =>
                              abrirCotacaoNaAba(cotacaoId, "julgamento")
                            }
                          />
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

  const JulgamentoPage = (
    <>
      <PageHeader
        eyebrow="Julgamento e classificação"
        title="Sessão de julgamento"
        description="Analise as propostas por cotação, compare valores e registre a decisão administrativa."
        secondaryAction={
          <button
            type="button"
            onClick={carregarDados}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Atualizar painel
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Cotações com propostas"
          value={
            cotacoes.filter((cotacao) =>
              propostas.some(
                (proposta) =>
                  String(proposta.cotacao?._id || proposta.cotacao) ===
                  String(cotacao._id)
              )
            ).length
          }
          description="Processos disponíveis para análise"
          icon={Gavel}
          tone="blue"
        />

        <MetricCard
          title="Aguardando julgamento"
          value={
            propostas.filter((item) =>
              ["Recebida", "Em análise", "Pendente"].includes(item.status)
            ).length
          }
          description="Propostas sem decisão"
          icon={Clock3}
          tone="amber"
        />

        <MetricCard
          title="Classificadas"
          value={
            propostas.filter((item) =>
              ["Classificada", "Aprovado"].includes(item.status)
            ).length
          }
          description="Propostas habilitadas"
          icon={CheckCircle2}
          tone="emerald"
        />

        <MetricCard
          title="Desclassificadas"
          value={
            propostas.filter((item) =>
              ["Desclassificada", "Reprovado"].includes(item.status)
            ).length
          }
          description="Propostas afastadas"
          icon={CircleX}
          tone="red"
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Processos para julgamento"
          description="Selecione uma cotação para abrir o quadro comparativo completo."
        />

        {cotacoes.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="Nenhuma cotação disponível"
            description="Crie uma cotação e aguarde o recebimento das propostas."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {cotacoes.map((cotacao) => {
              const propostasCotacao = propostas
                .filter(
                  (proposta) =>
                    String(proposta.cotacao?._id || proposta.cotacao) ===
                    String(cotacao._id)
                )
                .sort(
                  (a, b) =>
                    Number(a.valorTotal || a.valor || 0) -
                    Number(b.valorTotal || b.valor || 0)
                )

              const menor = propostasCotacao[0]
              const vencedoraCotacao =
                cotacao.propostaVencedora ||
                propostasCotacao.find((item) =>
                  ["Vencedora", "Vencedor"].includes(item.status)
                )

              return (
                <div key={cotacao._id} className="p-5 hover:bg-slate-50/60">
                  <div className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr_0.8fr_auto] xl:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {cotacao.numero}
                        </h3>
                        <StatusBadge status={cotacao.status || "Aberta"} />
                      </div>

                      <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        {cotacao.demanda?.objeto || "Objeto não informado"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>
                          Demanda:{" "}
                          <strong className="text-slate-700">
                            {cotacao.demanda?.numeroDemanda || "-"}
                          </strong>
                        </span>
                        <span>
                          Participantes:{" "}
                          <strong className="text-slate-700">
                            {cotacao.participantes?.length || 0}
                          </strong>
                        </span>
                        <span>
                          Respostas:{" "}
                          <strong className="text-slate-700">
                            {propostasCotacao.length}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Menor proposta
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-950">
                        {menor
                          ? formatarMoeda(menor.valorTotal || menor.valor)
                          : "R$ 0,00"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Situação
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {vencedoraCotacao
                          ? "Vencedor definido"
                          : propostasCotacao.length
                          ? "Em julgamento"
                          : "Aguardando propostas"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={propostasCotacao.length === 0}
                      onClick={() =>
                        abrirCotacaoNaAba(cotacao._id, "julgamento")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Gavel size={17} />
                      Abrir julgamento
                    </button>
                  </div>

                  {propostasCotacao.length > 0 && (
                    <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full min-w-[850px]">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Posição</th>
                            <th className="px-4 py-3">Fornecedor</th>
                            <th className="px-4 py-3">Valor</th>
                            <th className="px-4 py-3">Diferença</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {propostasCotacao.slice(0, 3).map((proposta, index) => {
                            const valor = Number(
                              proposta.valorTotal || proposta.valor || 0
                            )
                            const menorValor = Number(
                              menor?.valorTotal || menor?.valor || 0
                            )

                            return (
                              <tr key={proposta._id || proposta.id}>
                                <td className="px-4 py-3 text-sm font-semibold">
                                  {index + 1}º
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {proposta.fornecedor?.empresa ||
                                    proposta.fornecedor?.razaoSocial ||
                                    proposta.fornecedor ||
                                    "Fornecedor"}
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-slate-900">
                                  {formatarMoeda(valor)}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {index === 0
                                    ? "-"
                                    : `+ ${formatarMoeda(valor - menorValor)}`}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge
                                    status={proposta.status || "Recebida"}
                                  />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </>
  )

  const ResultadoPage = (
    <>
      <PageHeader
        eyebrow="Resultados dos processos"
        title="Resultados e vencedores"
        description="Consulte as cotações concluídas, fornecedores vencedores e valores finais."
        secondaryAction={
          <button
            type="button"
            onClick={carregarDados}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Atualizar resultados
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Resultados definidos"
          value={
            cotacoes.filter((item) => item.propostaVencedora).length
          }
          description="Cotações com vencedor"
          icon={Trophy}
          tone="emerald"
        />

        <MetricCard
          title="Em julgamento"
          value={
            cotacoes.filter(
              (item) =>
                !item.propostaVencedora &&
                propostas.some(
                  (proposta) =>
                    String(proposta.cotacao?._id || proposta.cotacao) ===
                    String(item._id)
                )
            ).length
          }
          description="Processos com propostas recebidas"
          icon={Scale}
          tone="amber"
        />

        <MetricCard
          title="Valor homologado"
          value={formatarMoeda(
            cotacoes.reduce(
              (total, item) =>
                total +
                Number(
                  item.propostaVencedora?.valorTotal ||
                    item.propostaVencedora?.valor ||
                    0
                ),
              0
            )
          )}
          description="Soma dos resultados definidos"
          icon={CircleDollarSign}
          tone="blue"
        />

        <MetricCard
          title="Processos sem resultado"
          value={
            cotacoes.filter((item) => !item.propostaVencedora).length
          }
          description="Aguardando conclusão"
          icon={AlertTriangle}
          tone="violet"
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Mapa de resultados"
          description="Resumo final das cotações e suas respectivas empresas vencedoras."
        />

        {cotacoes.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Nenhum processo encontrado"
            description="Os resultados serão exibidos após a conclusão do julgamento."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Cotação</th>
                  <th className="px-5 py-3.5">Objeto</th>
                  <th className="px-5 py-3.5">Vencedor</th>
                  <th className="px-5 py-3.5">Valor final</th>
                  <th className="px-5 py-3.5">Entrega</th>
                  <th className="px-5 py-3.5">Situação</th>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {cotacoes.map((cotacao) => {
                  const propostaVencedora = cotacao.propostaVencedora

                  const fornecedorVencedor =
                    propostaVencedora?.empresa ||
                    propostaVencedora?.fornecedor?.empresa ||
                    propostaVencedora?.fornecedor?.razaoSocial ||
                    propostaVencedora?.fornecedor?.responsavel ||
                    "Não definido"

                  return (
                    <tr key={cotacao._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {cotacao.numero}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Demanda {cotacao.demanda?.numeroDemanda || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-md truncate text-sm text-slate-700">
                          {cotacao.demanda?.objeto || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className={`text-sm font-semibold ${
                            propostaVencedora
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }`}
                        >
                          {fornecedorVencedor}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-950">
                        {propostaVencedora
                          ? formatarMoeda(
                              propostaVencedora.valorTotal ||
                                propostaVencedora.valor
                            )
                          : "R$ 0,00"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {propostaVencedora?.prazoEntrega || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            propostaVencedora
                              ? "Resultado definido"
                              : cotacao.status || "Em andamento"
                          }
                        />
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatarData(
                          cotacao.finalizadaEm ||
                            cotacao.updatedAt ||
                            cotacao.createdAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            title="Visualizar resultado"
                            icon={Eye}
                            tone="blue"
                            onClick={() =>
                              abrirResultadoCotacao(cotacao._id)
                            }
                          />


                          <ActionButton
                            title="Gerar relatório de lances"
                            icon={Download}
                            onClick={() =>
                              gerarRelatorioLances(cotacao._id)
                            }
                          />

                          {propostaVencedora && (
                            <ActionButton
                              title="Abrir chat do resultado"
                              icon={MessageCircle}
                              tone="emerald"
                              onClick={() =>
                                setChatResultado({
                                  cotacaoId: cotacao._id,
                                  numero: cotacao.numero,
                                  fornecedor: fornecedorVencedor,
                                })
                              }
                            />
                          )}

                          {!propostaVencedora && (
                            <ActionButton
                              title="Abrir julgamento"
                              icon={Gavel}
                              tone="emerald"
                              onClick={() =>
                                abrirCotacaoNaAba(
                                  cotacao._id,
                                  "julgamento"
                                )
                              }
                            />
                          )}
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

  const pastasArquivos = [
    { nome: "Todos", icon: FolderOpen, quantidade: arquivos.length },
    {
      nome: "Documentos",
      icon: FileText,
      quantidade: arquivos.filter((item) => item.tipo === "Documento").length,
    },
    {
      nome: "Propostas",
      icon: ClipboardList,
      quantidade: arquivos.filter((item) => item.tipo === "Proposta").length,
    },
    {
      nome: "Relatórios",
      icon: BarChart3,
      quantidade: arquivos.filter((item) => item.tipo === "Relatório").length,
    },
    {
      nome: "Certidões",
      icon: BadgeCheck,
      quantidade: arquivos.filter((item) => item.tipo === "Certidão").length,
    },
    {
      nome: "Contratos",
      icon: FileCheck2,
      quantidade: arquivos.filter((item) => item.tipo === "Contrato").length,
    },
  ]

  const arquivosFiltrados = arquivos.filter((item) => {
    const termo = buscaArquivo.trim().toLowerCase()
    const correspondePasta =
      pastaArquivo === "Todos" ||
      item.tipo === pastaArquivo.replace("ões", "ão").replace("os", "o") ||
      (pastaArquivo === "Documentos" && item.tipo === "Documento") ||
      (pastaArquivo === "Propostas" && item.tipo === "Proposta") ||
      (pastaArquivo === "Relatórios" && item.tipo === "Relatório") ||
      (pastaArquivo === "Certidões" && item.tipo === "Certidão") ||
      (pastaArquivo === "Contratos" && item.tipo === "Contrato")

    const correspondeBusca = [
      item.nome,
      item.tipo,
      item.processo,
      item.observacao,
      item.responsavel,
    ]
      .join(" ")
      .toLowerCase()
      .includes(termo)

    return correspondePasta && correspondeBusca
  })

  const secretariasEmpenho = Array.from(
    new Set([
      ...secretarias.map((item) => item.nome).filter(Boolean),
      ...empenhosLocais.map((item) => item.secretaria).filter(Boolean),
    ])
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const empenhosFiltrados = empenhosLocais.filter(
    (item) =>
      pastaEmpenhoAtiva === "Todas" ||
      item.secretaria === pastaEmpenhoAtiva
  )

  function salvarEmpenhoLocal(event) {
    event.preventDefault()

    if (!novoEmpenhoLocal.secretaria || !novoEmpenhoLocal.numero) {
      alert("Informe a secretaria e o número do empenho.")
      return
    }

    const arquivo = novoEmpenhoLocal.arquivo

    setEmpenhosLocais((old) => [
      {
        id: crypto.randomUUID(),
        ...novoEmpenhoLocal,
        valor: Number(novoEmpenhoLocal.valor || 0),
        arquivoNome: arquivo?.name || "",
        arquivoUrl: arquivo ? URL.createObjectURL(arquivo) : "",
        criadoEm: new Date().toISOString(),
      },
      ...old,
    ])

    setNovoEmpenhoLocal({
      secretaria: "",
      numero: "",
      fornecedor: "",
      valor: "",
      descricao: "",
      arquivo: null,
    })
    setMostrarFormEmpenho(false)
  }

  const EmpenhosPastasPage = (
    <>
      <PageHeader
        eyebrow="Execução da contratação"
        title="Arquivo de empenhos"
        description="Organize os empenhos em pastas por secretaria e mantenha os documentos centralizados."
        actionLabel="Novo empenho"
        onAction={() => setMostrarFormEmpenho(true)}
      />

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader
            title="Pastas por secretaria"
            description="Selecione uma pasta para visualizar os empenhos."
          />
          <div className="space-y-2 p-4">
            <button
              type="button"
              onClick={() => setPastaEmpenhoAtiva("Todas")}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                pastaEmpenhoAtiva === "Todas"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-blue-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderOpen size={18} /> Todas as secretarias
              </span>
              <span>{empenhosLocais.length}</span>
            </button>

            {secretariasEmpenho.map((secretaria) => {
              const quantidade = empenhosLocais.filter(
                (item) => item.secretaria === secretaria
              ).length
              const ativa = pastaEmpenhoAtiva === secretaria

              return (
                <button
                  key={secretaria}
                  type="button"
                  onClick={() => setPastaEmpenhoAtiva(secretaria)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    ativa
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FolderOpen size={18} className="shrink-0" />
                    <span className="truncate">{secretaria}</span>
                  </span>
                  <span>{quantidade}</span>
                </button>
              )
            })}

            {secretariasEmpenho.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Cadastre secretarias para criar as pastas automaticamente.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          {mostrarFormEmpenho && (
            <Card>
              <CardHeader
                title="Cadastrar empenho"
                description="Escolha a secretaria e anexe o documento do empenho."
              />
              <form
                onSubmit={salvarEmpenhoLocal}
                className="grid gap-4 p-5 md:grid-cols-2"
              >
                <Select
                  label="Secretaria *"
                  value={novoEmpenhoLocal.secretaria}
                  onChange={(event) =>
                    setNovoEmpenhoLocal({
                      ...novoEmpenhoLocal,
                      secretaria: event.target.value,
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {secretariasEmpenho.map((secretaria) => (
                    <option key={secretaria} value={secretaria}>
                      {secretaria}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Número do empenho *"
                  value={novoEmpenhoLocal.numero}
                  onChange={(event) =>
                    setNovoEmpenhoLocal({
                      ...novoEmpenhoLocal,
                      numero: event.target.value,
                    })
                  }
                  placeholder="Ex.: 1234/2026"
                />

                <Input
                  label="Fornecedor"
                  value={novoEmpenhoLocal.fornecedor}
                  onChange={(event) =>
                    setNovoEmpenhoLocal({
                      ...novoEmpenhoLocal,
                      fornecedor: event.target.value,
                    })
                  }
                  placeholder="Nome do fornecedor"
                />

                <Input
                  label="Valor do empenho (R$)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={novoEmpenhoLocal.valor}
                  onChange={(event) =>
                    setNovoEmpenhoLocal({
                      ...novoEmpenhoLocal,
                      valor: event.target.value,
                    })
                  }
                  placeholder="0,00"
                />

                <Textarea
                  label="Descrição"
                  className="md:col-span-2"
                  rows="3"
                  value={novoEmpenhoLocal.descricao}
                  onChange={(event) =>
                    setNovoEmpenhoLocal({
                      ...novoEmpenhoLocal,
                      descricao: event.target.value,
                    })
                  }
                  placeholder="Informe o objeto ou observações do empenho."
                />

                <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                  Documento do empenho
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(event) =>
                      setNovoEmpenhoLocal({
                        ...novoEmpenhoLocal,
                        arquivo: event.target.files?.[0] || null,
                      })
                    }
                    className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"
                  />
                </label>

                <div className="flex gap-3 md:col-span-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => setMostrarFormEmpenho(false)}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Save size={17} /> Salvar empenho
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <CardHeader
              title={
                pastaEmpenhoAtiva === "Todas"
                  ? "Todos os empenhos"
                  : pastaEmpenhoAtiva
              }
              description={`${empenhosFiltrados.length} empenho(s) arquivado(s).`}
              action={
                <button
                  type="button"
                  onClick={() => setMostrarFormEmpenho(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <Plus size={16} /> Novo empenho
                </button>
              }
            />

            {empenhosFiltrados.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="Nenhum empenho nesta pasta"
                description="Cadastre um empenho e selecione a secretaria correspondente."
                actionLabel="Cadastrar empenho"
                onAction={() => setMostrarFormEmpenho(true)}
              />
            ) : (
              <div className="grid gap-4 p-5 md:grid-cols-2">
                {empenhosFiltrados.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                        <ReceiptText size={22} />
                      </div>
                      <StatusBadge status="Arquivado" />
                    </div>
                    <h3 className="mt-4 font-bold text-slate-900">
                      Empenho {item.numero}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.secretaria}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Fornecedor</p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {item.fornecedor || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Valor</p>
                        <p className="mt-1 font-semibold text-emerald-700">
                          {formatarMoeda(item.valor)}
                        </p>
                      </div>
                    </div>
                    {item.descricao && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {item.descricao}
                      </p>
                    )}
                    {item.arquivoUrl && (
                      <a
                        href={item.arquivoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Download size={17} /> Abrir documento
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )

  const ArquivosPage = (
    <>
      <PageHeader
        eyebrow="Documentação do processo"
        title="Central de arquivos"
        description="Organize pastas, documentos, propostas, relatórios e anexos dos processos."
        actionLabel="Adicionar arquivo"
        onAction={abrirFormularioArquivo}
      />

      <Card>
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={buscaArquivo}
                onChange={(event) => setBuscaArquivo(event.target.value)}
                placeholder="O que você está buscando?"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModoArquivos("grade")}
                className={`rounded-xl border p-3 transition ${
                  modoArquivos === "grade"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
                title="Visualização em grade"
              >
                <Boxes size={18} />
              </button>
              <button
                type="button"
                onClick={() => setModoArquivos("lista")}
                className={`rounded-xl border p-3 transition ${
                  modoArquivos === "lista"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
                title="Visualização em lista"
              >
                <ListChecks size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Pastas</h2>
              <p className="mt-1 text-xs text-slate-500">
                Selecione uma pasta para filtrar os arquivos.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {pastasArquivos.map(({ nome, icon: Icon, quantidade }) => {
              const ativa = pastaArquivo === nome
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => setPastaArquivo(nome)}
                  className={`group flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    ativa
                      ? "border-blue-300 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`rounded-lg p-2.5 ${
                      ativa
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700"
                    }`}
                  >
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {nome}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {quantidade} arquivo(s)
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {mostrarFormArquivo && (
        <div ref={formularioArquivoRef} className="scroll-mt-6">
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

            <label className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-300 hover:bg-blue-50/50 md:col-span-2">
              <Upload className="mx-auto text-slate-400 group-hover:text-blue-600" size={30} />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Selecione ou arraste o arquivo
              </p>
              <p className="mt-1 text-xs text-slate-500">
                PDF, DOCX, XLSX, PNG ou JPG
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={(event) =>
                  setArquivoSelecionado(event.target.files?.[0] || null)
                }
                className="mt-4 text-sm text-slate-600"
              />
              {arquivoSelecionado && (
                <p className="mt-3 text-xs font-semibold text-blue-700">
                  Selecionado: {arquivoSelecionado.name}
                </p>
              )}
            </label>

            <div className="flex gap-3 md:col-span-2 md:justify-end">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormArquivo(false)
                  setArquivoSelecionado(null)
                }}
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
        </div>
      )}

      <Card className="mt-6">
        <CardHeader
          title={pastaArquivo === "Todos" ? "Documentos" : pastaArquivo}
          description={`${arquivosFiltrados.length} arquivo(s) encontrado(s).`}
          action={
            <button
              type="button"
              onClick={abrirFormularioArquivo}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <Plus size={16} />
              Novo arquivo
            </button>
          }
        />

        {arquivosFiltrados.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Ainda não há documentos por aqui"
            description="Adicione documentos utilizando o botão acima."
            actionLabel="Adicionar arquivo"
            onAction={abrirFormularioArquivo}
          />
        ) : modoArquivos === "grade" ? (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {arquivosFiltrados.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
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
                {item.arquivoUrl && (
                  <a
                    href={item.arquivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <ExternalLink size={16} /> Abrir arquivo
                  </a>
                )}
                {item.observacao && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                    {item.observacao}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    {formatarData(item.criadoEm)}
                  </span>
                  <div className="flex gap-2">
                    <ActionButton title="Visualizar" icon={Eye} />
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Nome</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Processo</th>
                  <th className="px-5 py-3.5">Responsável</th>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {arquivosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          <FileText size={18} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.tipo}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.processo || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.responsavel || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatarData(item.criadoEm)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton title="Visualizar" icon={Eye} />
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
              {user?.nome || (fornecedorLogado ? "Fornecedor" : "Administrador")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {fornecedorLogado ? "Acesso de fornecedor" : user?.perfil || user?.role || ""}
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

          {carregando && (
            <Loader2 size={18} className="animate-spin text-blue-600" />
          )}
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {!fornecedorLogado && telaAtual === "painel" && PainelPage}
          {!fornecedorLogado && telaAtual === "secretarias" && SecretariasPage}
          {!fornecedorLogado && telaAtual === "demanda" && NovaDemandaPage}
          {!fornecedorLogado && telaAtual === "orcamento" && OrcamentoPage}
          {!fornecedorLogado && telaAtual === "solicitacao" && SolicitacoesPage}
          {!fornecedorLogado && telaAtual === "fornecedores" && FornecedoresPage}
          {telaAtual === "propostas" && PropostasPage}
          {telaAtual === "julgamento" && JulgamentoPage}
          {telaAtual === "resultado" && ResultadoPage}
          {!fornecedorLogado && telaAtual === "empenhos" && EmpenhosPastasPage}
          {!fornecedorLogado && telaAtual === "administracao" && (
            <AdminUsuariosPage
              apiUrl={API_URL}
              authHeaders={authHeaders}
              fornecedores={fornecedores}
            />
          )}
          {!fornecedorLogado && telaAtual === "arquivos" && ArquivosPage}
        </main>
      </div>

      {chatResultado && (
  <ResultadoChatModal
    apiUrl={API_URL}
    authHeaders={authHeaders}
    cotacaoId={chatResultado.cotacaoId}
    titulo={`Chat da cotação ${chatResultado.numero}`}
    subtitulo={chatResultado.fornecedor}
    onClose={() => setChatResultado(null)}
  />
)}
    </div>
  )
}