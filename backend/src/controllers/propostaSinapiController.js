import Cotacao from "../models/Cotacao.js"
import Proposta from "../models/Proposta.js"

export async function enviarPropostaSinapi(req, res) {
  try {
    const { token } = req.params
    const { percentualDesconto, valorProposto, prazoEntrega, validadeDias, observacao } = req.body

    const cotacao = await Cotacao.findOne({
      "participantes.token": token,
      status: "Aberta",
      encerraEm: { $gt: new Date() },
    }).populate("demanda")

    if (!cotacao) {
      return res.status(404).json({ erro: "Cotação inválida ou encerrada." })
    }

    const participante = cotacao.participantes.find((item) => item.token === token)

    if (!participante) {
      return res.status(404).json({ erro: "Fornecedor não encontrado na cotação." })
    }

    const existente = await Proposta.findOne({
      cotacao: cotacao._id,
      fornecedor: participante.fornecedor,
    })

    if (existente) {
      return res.status(409).json({ erro: "Este fornecedor já enviou uma proposta." })
    }

    const valorReferenciaSinapi = (cotacao.demanda?.materiais || []).reduce(
      (total, item) =>
        total +
        Number(item.quantidade || 0) * Number(item.valorSinapi || 0),
      0
    )

    if (valorReferenciaSinapi <= 0) {
      return res.status(400).json({
        erro: "A demanda não possui valor de referência SINAPI válido.",
      })
    }

    const desconto = Number(percentualDesconto || 0)
    const valorCalculado =
      valorProposto !== undefined && valorProposto !== ""
        ? Number(valorProposto)
        : valorReferenciaSinapi * (1 - desconto / 100)

    if (!Number.isFinite(valorCalculado) || valorCalculado <= 0) {
      return res.status(400).json({ erro: "Valor proposto inválido." })
    }

    const proposta = await Proposta.create({
      cotacao: cotacao._id,
      fornecedor: participante.fornecedor,
      valorReferenciaSinapi,
      percentualDesconto: desconto,
      valorTotal: valorCalculado,
      prazoEntrega,
      validadeDias,
      observacao,
      status: "Recebida",
    })

    participante.respondidoEm = new Date()
    await cotacao.save()

    return res.status(201).json({
      mensagem: "Proposta enviada com sucesso.",
      proposta,
    })
  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao enviar proposta.",
      detalhe: error.message,
    })
  }
}
