import Cotacao from "../models/Cotacao.js"
import Proposta from "../models/Proposta.js"

import { finalizarCotacao } from "../services/cotacaoService.js"

async function gerarNumeroProposta() {
  const ano = new Date().getFullYear()

  const total = await Proposta.countDocuments({
    createdAt: {
      $gte: new Date(`${ano}-01-01T00:00:00.000Z`),
      $lte: new Date(`${ano}-12-31T23:59:59.999Z`),
    },
  })

  return `PROP-${String(total + 1).padStart(3, "0")}/${ano}`
}

export async function enviarPropostaPublica(req, res) {
  try {
    const cotacao = await Cotacao.findOne({
      "participantes.token": req.params.token,
    }).populate("demanda")

    if (!cotacao) {
      return res.status(404).json({
        erro: "Link de cotação inválido.",
      })
    }

    if (
      cotacao.status !== "Aberta" ||
      new Date() >= new Date(cotacao.encerraEm)
    ) {
      if (cotacao.status === "Aberta") {
        await finalizarCotacao(cotacao._id)
      }

      return res.status(400).json({
        erro: "O prazo para envio da proposta foi encerrado.",
      })
    }

    const participante = cotacao.participantes.find(
      (item) => item.token === req.params.token
    )

    if (!participante) {
      return res.status(404).json({
        erro: "Fornecedor participante não encontrado.",
      })
    }

    const propostaExistente = await Proposta.findOne({
      cotacao: cotacao._id,
      fornecedor: participante.fornecedor,
    })

    if (propostaExistente) {
      return res.status(409).json({
        erro: "Sua empresa já enviou uma proposta para esta cotação.",
      })
    }

    const {
      itens,
      prazoEntrega,
      validadeDias,
      observacao,
    } = req.body

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "Informe os valores dos itens.",
      })
    }

    const materiaisDemanda = cotacao.demanda?.materiais || []

    if (itens.length !== materiaisDemanda.length) {
      return res.status(400).json({
        erro: "A quantidade de itens enviados não corresponde à demanda.",
      })
    }

    const itensTratados = materiaisDemanda.map((material, index) => {
      const valorUnitario = Number(itens[index]?.valorUnitario)

      if (!Number.isFinite(valorUnitario) || valorUnitario < 0) {
        throw new Error(
          `Valor unitário inválido no item ${index + 1}.`
        )
      }

      const quantidade = Number(material.quantidade || 0)

      return {
        material: material.item || material.material,
        quantidade,
        unidade: material.unidade,
        observacao: material.observacao || "",
        valorUnitario,
        valorTotal: Number(
          (quantidade * valorUnitario).toFixed(2)
        ),
      }
    })

    const valorTotal = Number(
      itensTratados
        .reduce((total, item) => total + item.valorTotal, 0)
        .toFixed(2)
    )

    const proposta = await Proposta.create({
      numero: await gerarNumeroProposta(),
      cotacao: cotacao._id,
      demanda: cotacao.demanda._id,
      fornecedor: participante.fornecedor,
      participanteToken: req.params.token,
      itens: itensTratados,
      valorTotal,
      prazoEntrega: prazoEntrega || "",
      validadeDias: Number(validadeDias || 60),
      observacao: observacao || "",
      status: "Recebida",
    })

    participante.respondeuEm = new Date()
    await cotacao.save()

    return res.status(201).json({
      mensagem: "Proposta enviada com sucesso.",
      proposta: {
        numero: proposta.numero,
        valorTotal: proposta.valorTotal,
        recebidaEm: proposta.recebidaEm,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      erro: error.message || "Erro ao enviar a proposta.",
    })
  }
}

export async function listarPropostas(req, res) {
  try {
    const filtro = {}

    if (req.query.cotacaoId) {
      filtro.cotacao = req.query.cotacaoId
    }

    const propostas = await Proposta.find(filtro)
      .populate("cotacao")
      .populate("demanda")
      .populate("fornecedor")
      .populate("julgadaPor", "nome email")
      .sort({
        valorTotal: 1,
        recebidaEm: 1,
      })

    return res.json(propostas)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      erro: "Erro ao listar propostas.",
    })
  }
}

export async function julgarProposta(req, res) {
  try {
    const {
      status,
      justificativa,
    } = req.body

    const statusPermitidos = [
      "Classificada",
      "Desclassificada",
      "Vencedora",
    ]

    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({
        erro: "Status de julgamento inválido.",
      })
    }

    const proposta = await Proposta.findById(req.params.id)

    if (!proposta) {
      return res.status(404).json({
        erro: "Proposta não encontrada.",
      })
    }

    if (status === "Vencedora") {
      await Proposta.updateMany(
        {
          cotacao: proposta.cotacao,
          _id: {
            $ne: proposta._id,
          },
          status: "Vencedora",
        },
        {
          status: "Classificada",
        }
      )

      await Cotacao.findByIdAndUpdate(proposta.cotacao, {
        propostaVencedora: proposta._id,
        status: "Finalizada",
        finalizadaEm: new Date(),
      })
    }

    proposta.status = status
    proposta.justificativaJulgamento = justificativa || ""
    proposta.julgadaEm = new Date()
    proposta.julgadaPor = req.user?._id || req.user?.id || null

    await proposta.save()

    return res.json({
      mensagem: "Julgamento salvo.",
      proposta,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      erro: "Erro ao julgar proposta.",
    })
  }
}

export async function excluirProposta(req, res) {
  try {
    const proposta = await Proposta.findByIdAndDelete(req.params.id)

    if (!proposta) {
      return res.status(404).json({
        erro: "Proposta não encontrada.",
      })
    }

    return res.json({
      mensagem: "Proposta excluída.",
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      erro: "Erro ao excluir proposta.",
    })
  }
}
