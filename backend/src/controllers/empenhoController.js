import Cotacao from "../models/Cotacao.js"
import Empenho from "../models/Empenho.js"

export async function listarEmpenhos(req, res) {
  const empenhos = await Empenho.find()
    .populate("cotacao", "numero demanda")
    .populate("fornecedor", "empresa razaoSocial email cnpj")
    .populate("proposta", "numero valorTotal")
    .sort({ createdAt: -1 })

  return res.json(empenhos)
}

export async function criarEmpenho(req, res) {
  try {
    const { cotacaoId, numero, valor, descricao, documentoUrl } = req.body

    const cotacao = await Cotacao.findById(cotacaoId).populate({
      path: "propostaVencedora",
      populate: { path: "fornecedor" },
    })

    if (!cotacao || !cotacao.propostaVencedora) {
      return res.status(400).json({
        erro: "A cotação precisa possuir uma proposta vencedora.",
      })
    }

    const empenho = await Empenho.create({
      numero,
      cotacao: cotacao._id,
      proposta: cotacao.propostaVencedora._id,
      fornecedor: cotacao.propostaVencedora.fornecedor._id,
      valor,
      descricao,
      documentoUrl,
      criadoPor: req.user?.id || req.user?._id || null,
    })

    return res.status(201).json(empenho)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao criar empenho.", detalhe: error.message })
  }
}

export async function excluirEmpenho(req, res) {
  await Empenho.findByIdAndDelete(req.params.id)
  return res.json({ mensagem: "Empenho excluído." })
}

export async function listarEmpenhosFornecedor(req, res) {
  const empenhos = await Empenho.find({
    fornecedor: req.fornecedorAuth.fornecedorId,
  })
    .populate("cotacao", "numero demanda")
    .sort({ createdAt: -1 })

  return res.json(empenhos)
}

export async function listarResultadosFornecedor(req, res) {
  const resultados = await Cotacao.find({
    propostaVencedora: { $ne: null },
  })
    .populate("demanda", "numeroDemanda objeto secretaria")
    .populate({
      path: "propostaVencedora",
      match: { fornecedor: req.fornecedorAuth.fornecedorId },
      populate: { path: "fornecedor", select: "empresa razaoSocial" },
    })
    .sort({ finalizadaEm: -1 })

  return res.json(resultados.filter((item) => item.propostaVencedora))
}
