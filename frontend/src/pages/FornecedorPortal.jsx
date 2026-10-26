import { useEffect, useState } from "react"
import { Eye, Trophy, CheckCircle, XCircle } from "lucide-react"

export default function JulgamentoModal({ apiUrl, authHeaders, cotacaoId, onClose }) {
  const [propostas, setPropostas] = useState([])
  
  // Identifica se o usuário atual é um fornecedor logado
  const isFornecedor = Boolean(localStorage.getItem("fornecedorToken"))

  async function carregarPropostas() {
    try {
      const response = await fetch(`${apiUrl}/cotacoes/${cotacaoId}/propostas`, {
        headers: authHeaders(true),
      })
      const data = await response.json()
      setPropostas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao carregar propostas", error)
    }
  }

  useEffect(() => {
    if (cotacaoId) {
      carregarPropostas()
    }
  }, [cotacaoId])

  async function handleAcao(acao, propostaId) {
    // Se for fornecedor, bloqueia qualquer execução por segurança
    if (isFornecedor) return

    try {
      await fetch(`${apiUrl}/propostas/${propostaId}/${acao}`, {
        method: "PATCH",
        headers: authHeaders(true),
      })
      carregarPropostas()
    } catch (error) {
      console.error(`Erro ao executar ${acao}`, error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-slate-950">Julgamento das Propostas</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 font-bold">
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {propostas.map((item) => (
            <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-slate-200 p-4 gap-4">
              <div>
                <p className="font-semibold text-slate-900">{item.fornecedor?.empresa || "Fornecedor"}</p>
                <p className="text-lg font-bold text-emerald-700">
                  {Number(item.valorTotal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  {item.situacao || "Recebida"}
                </span>
              </div>

              {/* Botões de Ação Administrativa: EXIBIDOS APENAS SE NÃO FOR FORNECEDOR */}
              {!isFornecedor && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleAcao("classificar", item._id)}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-600 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    <CheckCircle size={14} />
                    Classificar
                  </button>

                  <button
                    onClick={() => handleAcao("desclassificar", item._id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-600 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <XCircle size={14} />
                    Desclassificar
                  </button>

                  <button
                    onClick={() => handleAcao("declarar-vencedora", item._id)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                  >
                    <Trophy size={14} />
                    Declarar vencedora
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
