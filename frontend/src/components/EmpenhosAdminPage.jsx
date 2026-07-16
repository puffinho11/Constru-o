import { useEffect, useState } from "react"
import { Plus, ReceiptText, Save, Trash2, MessageCircle } from "lucide-react"

export default function EmpenhosAdminPage({
  apiUrl,
  authHeaders,
  cotacoes = [],
  formatarMoeda,
  formatarData,
  StatusBadge,
}) {
  const [empenhos, setEmpenhos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({
    cotacaoId: "",
    numero: "",
    valor: "",
    descricao: "",
    documentoUrl: "",
  })

  async function carregar() {
    const response = await fetch(`${apiUrl}/empenhos`, {
      headers: authHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.erro || "Erro ao carregar empenhos.")
      return
    }

    setEmpenhos(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvar(event) {
    event.preventDefault()

    const response = await fetch(`${apiUrl}/empenhos`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({
        ...form,
        valor: Number(form.valor),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.erro || "Erro ao criar empenho.")
      return
    }

    setForm({
      cotacaoId: "",
      numero: "",
      valor: "",
      descricao: "",
      documentoUrl: "",
    })
    setMostrarForm(false)
    await carregar()
  }

  async function excluir(id) {
    if (!confirm("Deseja excluir este empenho?")) return

    const response = await fetch(`${apiUrl}/empenhos/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })

    if (response.ok) {
      await carregar()
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Execução da contratação
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Empenhos</h1>
          <p className="mt-2 text-sm text-slate-500">
            Envie empenhos somente ao fornecedor vencedor de cada cotação.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          Novo empenho
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={salvar}
          className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        >
          <select
            value={form.cotacaoId}
            onChange={(e) =>
              setForm({ ...form, cotacaoId: e.target.value })
            }
            className="h-11 rounded-xl border border-slate-300 px-3.5"
            required
          >
            <option value="">Selecione uma cotação com vencedor</option>
            {cotacoes
              .filter((item) => item.propostaVencedora)
              .map((item) => (
                <option key={item._id} value={item._id}>
                  {item.numero} - {item.demanda?.objeto}
                </option>
              ))}
          </select>

          <input
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            placeholder="Número do empenho"
            className="h-11 rounded-xl border border-slate-300 px-3.5"
            required
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            placeholder="Valor do empenho"
            className="h-11 rounded-xl border border-slate-300 px-3.5"
            required
          />

          <input
            value={form.documentoUrl}
            onChange={(e) =>
              setForm({ ...form, documentoUrl: e.target.value })
            }
            placeholder="Link do documento do empenho"
            className="h-11 rounded-xl border border-slate-300 px-3.5"
          />

          <textarea
            value={form.descricao}
            onChange={(e) =>
              setForm({ ...form, descricao: e.target.value })
            }
            placeholder="Descrição do empenho"
            className="rounded-xl border border-slate-300 p-3.5 md:col-span-2"
            rows="4"
          />

          <div className="flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5"
            >
              Cancelar
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white">
              <Save size={17} />
              Salvar empenho
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Empenho</th>
              <th className="px-5 py-3.5">Cotação</th>
              <th className="px-5 py-3.5">Fornecedor</th>
              <th className="px-5 py-3.5">Valor</th>
              <th className="px-5 py-3.5">Data</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {empenhos.map((item) => (
              <tr key={item._id}>
                <td className="px-5 py-4 font-semibold">{item.numero}</td>
                <td className="px-5 py-4">{item.cotacao?.numero || "-"}</td>
                <td className="px-5 py-4">
                  {item.fornecedor?.empresa || "-"}
                </td>
                <td className="px-5 py-4 font-bold">
                  {formatarMoeda(item.valor)}
                </td>
                <td className="px-5 py-4">{formatarData(item.createdAt)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {item.documentoUrl && (
                      <a
                        href={item.documentoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-blue-200 p-2 text-blue-600"
                      >
                        <ReceiptText size={17} />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => excluir(item._id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
