import Demanda from "../models/Demanda.js"

export async function criarDemanda(req, res) {
  try {
    const demanda = await Demanda.create({
      ...req.body,
      criadoPor: req.user.id,
    })

    res.status(201).json(demanda)
  } catch (error) {
    res.status(500).json({
      message: "Erro ao criar demanda",
      error: error.message,
    })
  }
}

export async function listarDemandas(req, res) {
  try {
    const demandas = await Demanda.find()
      .sort({ createdAt: -1 })

    res.json(demandas)
  } catch (error) {
    res.status(500).json({
      message: "Erro ao listar demandas",
    })
  }
}

export async function buscarDemanda(req, res) {
  try {
    const demanda = await Demanda.findById(
      req.params.id
    )

    if (!demanda) {
      return res.status(404).json({
        message: "Demanda não encontrada",
      })
    }

    res.json(demanda)
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar demanda",
    })
  }
}

export async function atualizarDemanda(req, res) {
  try {
    const demanda =
      await Demanda.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      )

    res.json(demanda)
  } catch (error) {
    res.status(500).json({
      message: "Erro ao atualizar demanda",
    })
  }
}

export async function excluirDemanda(req, res) {
  try {
    await Demanda.findByIdAndDelete(
      req.params.id
    )

    res.json({
      message: "Demanda removida",
    })
  } catch (error) {
    res.status(500).json({
      message: "Erro ao excluir demanda",
    })
  }
}