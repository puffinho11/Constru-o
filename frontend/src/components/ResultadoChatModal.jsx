import { useEffect, useRef, useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"

export default function ResultadoChatModal({
  apiUrl,
  authHeaders,
  cotacaoId,
  titulo,
  subtitulo,
  onClose,
}) {
  const [mensagens, setMensagens] = useState([])
  const [texto, setTexto] = useState("")
  const finalRef = useRef(null)

  async function carregar() {
    const response = await fetch(`${apiUrl}/chats/${cotacaoId}`, {
      headers: authHeaders(),
    })

    const data = await response.json()

    if (response.ok) {
      setMensagens(Array.isArray(data) ? data : [])
    }
  }

  useEffect(() => {
    carregar()
    const timer = setInterval(carregar, 5000)
    return () => clearInterval(timer)
  }, [cotacaoId])

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens])

  async function enviar(event) {
    event.preventDefault()

    if (!texto.trim()) return

    const response = await fetch(`${apiUrl}/chats/${cotacaoId}`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ mensagem: texto.trim() }),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.erro || "Erro ao enviar mensagem.")
      return
    }

    setTexto("")
    await carregar()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="flex h-[78vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="font-bold text-slate-900">{titulo}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
          {mensagens.map((item) => (
            <div
              key={item._id}
              className={`max-w-[80%] rounded-2xl p-4 ${
                item.autorTipo === "Fornecedor"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-white text-slate-800 shadow-sm"
              }`}
            >
              <p className="text-xs font-semibold opacity-70">
                {item.autorNome}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{item.mensagem}</p>
              <p className="mt-2 text-[11px] opacity-60">
                {new Date(item.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
          <div ref={finalRef} />
        </div>

        <form onSubmit={enviar} className="flex gap-3 border-t border-slate-200 p-4">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite uma mensagem ao fornecedor vencedor..."
            className="h-11 flex-1 rounded-xl border border-slate-300 px-4"
          />

          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white">
            <Send size={17} />
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
