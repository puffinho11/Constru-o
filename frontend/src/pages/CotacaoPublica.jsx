import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ShieldCheck,
} from "lucide-react"

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function calcularTempoRestante(dataFinal) {
  const diferenca = new Date(dataFinal).getTime() - Date.now()

  if (diferenca <= 0) {
    return {
      encerrado: true,
      texto: "Prazo encerrado",
    }
  }

  const horas = Math.floor(diferenca / (1000 * 60 * 60))
  const minutos = Math.floor(
    (diferenca % (1000 * 60 * 60)) / (1000 * 60)
  )
  const segundos = Math.floor(
    (diferenca % (1000 * 60)) / 1000
  )

  return {
    encerrado: false,
    texto: `${String(horas).padStart(2, "0")}h ${String(
      minutos
    ).padStart(2, "0")}m ${String(segundos).padStart(2, "0")}s`,
  }
}

export default function CotacaoPublica() {
  const { token } = useParams()

  const [dados, setDados] = useState(null)
  const [itens, setItens] = useState([])
  const [prazoEntrega, setPrazoEntrega] = useState("")
  const [validadeDias, setValidadeDias] = useState(60)
  const [observacao, setObservacao] = useState("")
  const [tempoRestante, setTempoRestante] = useState({
    encerrado: false,
    texto: "Carregando...",
  })
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

  useEffect(() => {
    carregarCotacao()
  }, [token])

  useEffect(() => {
    if (!dados?.cotacao?.encerraEm) return

    const atualizarTempo = () => {
      setTempoRestante(
        calcularTempoRestante(dados.cotacao.encerraEm)
      )
    }

    atualizarTempo()

    const timer = setInterval(atualizarTempo, 1000)

    return () => clearInterval(timer)
  }, [dados])

  async function carregarCotacao() {
    setCarregando(true)
    setErro("")

    try {
      const response = await fetch(
        `${API_URL}/cotacoes/publica/${token}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erro || "Não foi possível abrir a cotação."
        )
      }

      setDados(data)

      setItens(
        (data.demanda?.materiais || []).map((item) => ({
          item: item.item || item.material || "",
          quantidade: Number(item.quantidade || 0),
          unidade: item.unidade || "",
          observacao: item.observacao || "",
          valorUnitario: "",
        }))
      )
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  const valorTotal = useMemo(() => {
    return itens.reduce((total, item) => {
      return (
        total +
        Number(item.quantidade || 0) *
          Number(item.valorUnitario || 0)
      )
    }, 0)
  }, [itens])

  function alterarValor(index, valor) {
    setItens((itensAtuais) =>
      itensAtuais.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              valorUnitario: valor,
            }
          : item
      )
    )
  }

  async function enviarProposta(event) {
    event.preventDefault()

    setErro("")
    setSucesso("")

    if (
      itens.some(
        (item) =>
          item.valorUnitario === "" ||
          Number(item.valorUnitario) < 0
      )
    ) {
      setErro("Preencha o valor unitário de todos os itens.")
      return
    }

    if (!prazoEntrega.trim()) {
      setErro("Informe o prazo de entrega.")
      return
    }

    if (
      !Number.isFinite(Number(validadeDias)) ||
      Number(validadeDias) < 1
    ) {
      setErro("Informe uma validade de proposta válida.")
      return
    }

    setEnviando(true)

    try {
      const response = await fetch(
        `${API_URL}/cotacoes/publica/${token}/proposta`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itens: itens.map((item) => ({
              valorUnitario: Number(item.valorUnitario),
            })),
            prazoEntrega: prazoEntrega.trim(),
            validadeDias: Number(validadeDias),
            observacao: observacao.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.erro || "Não foi possível enviar a proposta."
        )
      }

      setSucesso(
        `Proposta ${data.proposta?.numero || ""} enviada com sucesso. Valor total: ${formatarMoeda(
          data.proposta?.valorTotal || valorTotal
        )}`
      )

      setDados((dadosAtuais) => ({
        ...dadosAtuais,
        propostaEnviada: true,
        podeResponder: false,
      }))
    } catch (error) {
      setErro(error.message)
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-blue-700"
          />
          <p className="mt-4 text-sm text-slate-500">
            Carregando cotação...
          </p>
        </div>
      </main>
    )
  }

  if (erro && !dados) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle
            size={40}
            className="mx-auto text-red-600"
          />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Não foi possível abrir a cotação
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-700">
            {erro}
          </p>
        </div>
      </main>
    )
  }

  const bloqueado =
    !dados?.podeResponder ||
    tempoRestante.encerrado ||
    dados?.propostaEnviada

  return (
    <main className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-6 rounded-2xl bg-blue-950 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <Building2 size={24} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Prefeitura Municipal de General Carneiro - PR
                  </p>

                  <p className="mt-1 text-xs text-blue-200">
                    Sistema de Cotação Eletrônica
                  </p>
                </div>
              </div>

              <h1 className="mt-6 text-2xl font-bold">
                Cotação {dados.cotacao.numero}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                {dados.demanda.objeto}
              </p>
            </div>

            <div
              className={`rounded-xl border px-5 py-4 text-center ${
                tempoRestante.encerrado
                  ? "border-red-300/30 bg-red-500/15"
                  : "border-white/15 bg-white/10"
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wide text-blue-100">
                <Clock3 size={16} />
                Prazo restante
              </div>

              <p className="mt-2 text-xl font-bold">
                {tempoRestante.texto}
              </p>
            </div>
          </div>
        </header>

        {sucesso && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <CheckCircle2
              className="shrink-0"
              size={22}
            />

            <p className="text-sm font-medium">
              {sucesso}
            </p>
          </div>
        )}

        {erro && dados && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <form
            onSubmit={enviarProposta}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">
                Itens da cotação
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informe o valor unitário de cada item.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Item</th>
                    <th className="px-5 py-3.5">Descrição</th>
                    <th className="px-5 py-3.5">Quantidade</th>
                    <th className="px-5 py-3.5">Valor unitário</th>
                    <th className="px-5 py-3.5">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {itens.map((item, index) => {
                    const totalItem =
                      Number(item.quantidade || 0) *
                      Number(item.valorUnitario || 0)

                    return (
                      <tr key={`${item.item}-${index}`}>
                        <td className="px-5 py-4 text-sm font-semibold">
                          {index + 1}
                        </td>

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
                          {item.quantidade} {item.unidade}
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={bloqueado}
                            value={item.valorUnitario}
                            onChange={(event) =>
                              alterarValor(
                                index,
                                event.target.value
                              )
                            }
                            placeholder="0,00"
                            className="h-11 w-36 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                          />
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-slate-900">
                          {formatarMoeda(totalItem)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Prazo de entrega *
                <input
                  disabled={bloqueado}
                  value={prazoEntrega}
                  onChange={(event) =>
                    setPrazoEntrega(event.target.value)
                  }
                  placeholder="Ex.: 10 dias úteis"
                  className="h-11 rounded-xl border border-slate-300 px-3.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Validade da proposta *
                <input
                  type="number"
                  min="1"
                  disabled={bloqueado}
                  value={validadeDias}
                  onChange={(event) =>
                    setValidadeDias(event.target.value)
                  }
                  className="h-11 rounded-xl border border-slate-300 px-3.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                Observações
                <textarea
                  rows="4"
                  disabled={bloqueado}
                  value={observacao}
                  onChange={(event) =>
                    setObservacao(event.target.value)
                  }
                  placeholder="Informe marca, condições, frete ou outras observações."
                  className="rounded-xl border border-slate-300 p-3.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </label>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Valor total da proposta
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-800">
                  {formatarMoeda(valorTotal)}
                </p>
              </div>

              <button
                type="submit"
                disabled={bloqueado || enviando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Enviar proposta
                  </>
                )}
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Dados do fornecedor
              </h2>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                {dados.fornecedor.empresa}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {dados.fornecedor.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Informações da demanda
              </h2>

              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Número
                  </p>

                  <p className="mt-1 font-medium">
                    {dados.demanda.numeroDemanda || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Secretaria
                  </p>

                  <p className="mt-1 font-medium">
                    {dados.demanda.secretaria || "-"}
                  </p>
                </div>

                {dados.cotacao.observacao && (
                  <div>
                    <p className="text-xs uppercase text-slate-500">
                      Observações
                    </p>

                    <p className="mt-1 leading-6 text-slate-700">
                      {dados.cotacao.observacao}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex gap-3">
                <ShieldCheck
                  className="shrink-0 text-blue-700"
                  size={21}
                />

                <p className="text-xs leading-5 text-blue-800">
                  Este link é exclusivo para sua empresa. A proposta será
                  registrada com data e horário de envio.
                </p>
              </div>
            </div>

            {dados.propostaEnviada && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex gap-3">
                  <CheckCircle2
                    className="shrink-0 text-emerald-700"
                    size={21}
                  />

                  <p className="text-sm font-medium text-emerald-800">
                    Sua proposta já foi enviada.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}