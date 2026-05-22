import Fornecedor from "../models/Fornecedor.js"

export async function criarFornecedor(req, res) {
  try {
    const fornecedor = await Fornecedor.create(req.body)

    res.status(201).json(fornecedor)
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao criar fornecedor",
      detalhe: error.message,
    })
  }
}

export async function listarFornecedores(req, res) {
  try {
    const fornecedores = await Fornecedor.find().sort({
      createdAt: -1,
    })

    res.json(fornecedores)
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao listar fornecedores",
    })
  }
}

export async function atualizarFornecedor(req, res) {
  try {
    const fornecedor = await Fornecedor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    )

    res.json(fornecedor)
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao atualizar fornecedor",
    })
  }
}

export async function excluirFornecedor(req, res) {
  try {
    await Fornecedor.findByIdAndDelete(req.params.id)

    res.json({
      mensagem: "Fornecedor excluído com sucesso",
    })
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao excluir fornecedor",
    })
  }
}