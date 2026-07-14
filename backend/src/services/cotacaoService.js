import Cotacao from "../models/Cotacao.js"
import Proposta from "../models/Proposta.js"

export async function finalizarCotacao(cotacaoId) {
  const cotacao = await Cotacao.findById(cotacaoId)

  if (!cotacao) {
    throw new Error("Cotação não encontrada.")
  }

  if (cotacao.status === "Finalizada" || cotacao.status === "Cancelada") {
    return cotacao
  }

  const propostasValidas = await Proposta.find({
    cotacao: cotacao._id,
    status: {
      $in: ["Recebida", "Classificada", "Vencedora"],
    },
  }).sort({
    valorTotal: 1,
    recebidaEm: 1,
  })

  await Proposta.updateMany(
    {
      cotacao: cotacao._id,
      status: "Vencedora",
    },
    {
      status: "Classificada",
    }
  )

  if (propostasValidas.length === 0) {
    cotacao.status = "Encerrada"
    cotacao.propostaVencedora = null
    cotacao.finalizadaEm = new Date()
    await cotacao.save()
    return cotacao
  }

  const vencedora = propostasValidas[0]
  vencedora.status = "Vencedora"
  vencedora.julgadaEm = new Date()
  await vencedora.save()

  await Proposta.updateMany(
    {
      cotacao: cotacao._id,
      _id: {
        $ne: vencedora._id,
      },
      status: {
        $in: ["Recebida", "Classificada"],
      },
    },
    {
      status: "Classificada",
    }
  )

  cotacao.status = "Finalizada"
  cotacao.propostaVencedora = vencedora._id
  cotacao.finalizadaEm = new Date()
  await cotacao.save()

  return cotacao
}

export async function finalizarCotacoesExpiradas() {
  const agora = new Date()

  const cotacoes = await Cotacao.find({
    status: "Aberta",
    encerraEm: {
      $lte: agora,
    },
  }).select("_id")

  for (const cotacao of cotacoes) {
    try {
      await finalizarCotacao(cotacao._id)
    } catch (error) {
      console.error(
        `Erro ao finalizar cotação ${cotacao._id}:`,
        error.message
      )
    }
  }

  return cotacoes.length
}
