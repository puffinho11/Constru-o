import Orcamento from "../models/Orcamento.js"
import Demanda from "../models/Demanda.js"

export async function criarOrcamento(req, res) {
  try {
    const demanda = await Demanda.findById(req.body.demanda)

    if (!demanda) {
      return res.status(404).json({
        erro: "Demanda não encontrada",
      })
    }

    const orcamento = await Orcamento.create({
      demanda: demanda._id,
      numeroDemanda: demanda.numeroDemanda,
      secretaria: demanda.secretaria,
      itens: req.body.itens || [],
      valorTotalEstimado: req.body.valorTotalEstimado || 0,
      status: req.body.status || "Em elaboração",
    })

    res.status(201).json(orcamento)
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao criar orçamento",
      detalhe: error.message,
    })
  }
}

export async function listarOrcamentos(req, res) {
  try {
    const orcamentos = await Orcamento.find()
      .populate("demanda")
      .sort({ createdAt: -1 })

    res.json(orcamentos)
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao listar orçamentos",
      detalhe: error.message,
    })
  }
}

export async function buscarOrcamentoPorDemanda(req, res) {
  try {
    const orcamento = await Orcamento.findOne({
      demanda: req.params.demandaId,
    }).populate("demanda")

    res.json(orcamento)
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao buscar orçamento",
      detalhe: error.message,
    })
  }
}

export async function atualizarOrcamento(req, res) {
  try {
    const orcamento = await Orcamento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!orcamento) {
      return res.status(404).json({
        erro: "Orçamento não encontrado",
      })
    }

    res.json(orcamento)
  } catch (error) {
    console.log("ERRO AO CRIAR ORÇAMENTO:", error)

    res.status(500).json({
      erro: "Erro ao criar orçamento",
      detalhe: error.message,
    })
  }
}

export async function excluirOrcamento(req, res) {
  try {
    const orcamento = await Orcamento.findByIdAndDelete(req.params.id)

    if (!orcamento) {
      return res.status(404).json({
        erro: "Orçamento não encontrado",
      })
    }

    res.json({
      mensagem: "Orçamento excluído com sucesso",
    })
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao excluir orçamento",
      detalhe: error.message,
    })
  }
}