import { useEffect, useState } from "react"
import { LogOut, MessageCircle, ReceiptText, Trophy } from "lucide-react"
import { useNavigate } from "react-router-dom"
import ResultadoChatModal from "../components/ResultadoChatModal"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function headers(contentType = false) {
  return {
    ...(contentType ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${localStorage.getItem("fornecedorToken")}`,
  }
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export default function FornecedorPortal() {
  const navigate = useNavigate()
  const fornecedor = JSON.parse(localStorage.getItem("fornecedor") || "{}")
  const [empenhos, setEmpenhos] = useState([])
  const [resultados, setResultados] = useState([])
  const [chat, setChat] = useState(null)

  async function carregar() {
    const [empenhosResponse, resultadosResponse] = await Promise.all([
      fetch(`${API_URL}/fornecedor/empenhos`, { headers: headers() }),
      fetch(`${API_URL}/fornecedor/resultados`, { headers: headers() }),
    ])

    if (empenhosResponse.status === 401 || resultadosResponse.status === 401) {
      sair()
      return
    }

    const empenhosData = await empenhosResponse.json()
    const resultadosData = await resultadosResponse.json()

    setEmpenhos(Array.isArray(empenhosData) ? empenhosData : [])
    setResultados(Array.isArray(resultadosData) ? resultadosData : [])
  }

  useEffect(() => {
    carregar()
  }, [])

  function sair() {
    localStorage.removeItem("fornecedorToken")
    localStorage.removeItem("fornecedor")
    navigate("/fornecedor/login")
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="font-bold text-slate-950">Portal do fornecedor</p>
            <p className="text-sm text-slate-500">{fornecedor.empresa}</p>
          </div>

          <button onClick={sair} className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 px-5 py-8">
        <section>
          <h1 className="text-2xl font-bold text-slate-950">Resultados vencidos</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cotações em que sua empresa foi declarada vencedora.
          </p>

          <div className="mt-5 grid gap-4">
            {resultados.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700">{item.numero}</p>
                    <h2 className="mt-1 font-bold text-slate-950">
                      {item.demanda?.objeto}
                    </h2>
                    <p className="mt-2 text-xl font-bold text-emerald-700">
                      {moeda(item.propostaVencedora?.valorTotal)}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setChat({
                        cotacaoId: item._id,
                        numero: item.numero,
                      })
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <MessageCircle size={17} />
                    Abrir chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950">Empenhos recebidos</h2>
          <p className="mt-2 text-sm text-slate-500">
            Documentos enviados pela Prefeitura após o resultado.
          </p>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[850px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Empenho</th>
                  <th className="px-5 py-3.5">Cotação</th>
                  <th className="px-5 py-3.5">Valor</th>
                  <th className="px-5 py-3.5">Descrição</th>
                  <th className="px-5 py-3.5">Documento</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {empenhos.map((item) => (
                  <tr key={item._id}>
                    <td className="px-5 py-4 font-semibold">{item.numero}</td>
                    <td className="px-5 py-4">{item.cotacao?.numero}</td>
                    <td className="px-5 py-4 font-bold">{moeda(item.valor)}</td>
                    <td className="px-5 py-4">{item.descricao || "-"}</td>
                    <td className="px-5 py-4">
                      {item.documentoUrl ? (
                        <a
                          href={item.documentoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-semibold text-blue-700"
                        >
                          <ReceiptText size={17} />
                          Abrir
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {chat && (
        <ResultadoChatModal
          apiUrl={API_URL}
          authHeaders={headers}
          cotacaoId={chat.cotacaoId}
          titulo={`Chat do resultado ${chat.numero}`}
          subtitulo="Prefeitura Municipal de General Carneiro"
          onClose={() => setChat(null)}
        />
      )}
    </main>
  )
}
