import Demanda from "../models/Demanda.js"

export async function criarDemanda(req, res) {
  try {
    const demanda = await Demanda.create(req.body)

    res.status(201).json(demanda)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      erro: "Erro ao criar demanda",
    })
  }
}

export async function listarDemandas(req, res) {
  try {
    const demandas = await Demanda.find().sort({
      createdAt: -1,
    })

    res.json(demandas)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      erro: "Erro ao listar demandas",
    })
  }
}

export async function buscarDemanda(req, res) {
  try {
    const demanda = await Demanda.findById(req.params.id)

    if (!demanda) {
      return res.status(404).json({
        erro: "Demanda não encontrada",
      })
    }

    res.json(demanda)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      erro: "Erro ao buscar demanda",
    })
  }
}

export async function atualizarDemanda(req, res) {
  try {
    const demanda = await Demanda.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    )

    res.json(demanda)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      erro: "Erro ao atualizar demanda",
    })
  }
}

export async function excluirDemanda(req, res) {
  try {
    await Demanda.findByIdAndDelete(req.params.id)

    res.json({
      mensagem: "Demanda removida",
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      erro: "Erro ao excluir demanda",
    })
  }
}