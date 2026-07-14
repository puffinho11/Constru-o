import Solicitacao from "../models/Solicitacao.js"
import Demanda from "../models/Demanda.js"
import Fornecedor from "../models/Fornecedor.js"

async function gerarNumeroSolicitacao() {
  const ano = new Date().getFullYear()
  const total = await Solicitacao.countDocuments({
    createdAt: {
      $gte: new Date(`${ano}-01-01T00:00:00.000Z`),
      $lte: new Date(`${ano}-12-31T23:59:59.999Z`),
    },
  })

  return `SOL-${String(total + 1).padStart(3, "0")}/${ano}`
}

export async function listarSolicitacoes(req, res) {
  try {
    const solicitacoes = await Solicitacao.find()
      .populate("demanda")
      .populate("fornecedor")
      .populate("criadoPor", "nome email")
      .sort({ createdAt: -1 })

    return res.json(solicitacoes)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao listar solicitações." })
  }
}

export async function buscarSolicitacaoPorId(req, res) {
  try {
    const solicitacao = await Solicitacao.findById(req.params.id)
      .populate("demanda")
      .populate("fornecedor")
      .populate("criadoPor", "nome email")

    if (!solicitacao) {
      return res.status(404).json({ erro: "Solicitação não encontrada." })
    }

    return res.json(solicitacao)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao buscar solicitação." })
  }
}

export async function criarSolicitacao(req, res) {
  try {
    const { demandaId, fornecedorId, prazo, observacao } = req.body

    if (!demandaId || !fornecedorId) {
      return res.status(400).json({
        erro: "Demanda e fornecedor são obrigatórios.",
      })
    }

    const [demanda, fornecedor] = await Promise.all([
      Demanda.findById(demandaId),
      Fornecedor.findById(fornecedorId),
    ])

    if (!demanda) {
      return res.status(404).json({ erro: "Demanda não encontrada." })
    }

    if (!fornecedor) {
      return res.status(404).json({ erro: "Fornecedor não encontrado." })
    }

    const solicitacao = await Solicitacao.create({
      numero: await gerarNumeroSolicitacao(),
      demanda: demandaId,
      fornecedor: fornecedorId,
      prazo: prazo || null,
      observacao: observacao || "",
      status: "Enviado",
      criadoPor: req.user?._id || req.user?.id || null,
    })

    const solicitacaoCompleta = await Solicitacao.findById(solicitacao._id)
      .populate("demanda")
      .populate("fornecedor")

    return res.status(201).json(solicitacaoCompleta)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao criar solicitação." })
  }
}

export async function atualizarSolicitacao(req, res) {
  try {
    const dadosPermitidos = {
      prazo: req.body.prazo,
      observacao: req.body.observacao,
      status: req.body.status,
    }

    Object.keys(dadosPermitidos).forEach((chave) => {
      if (dadosPermitidos[chave] === undefined) {
        delete dadosPermitidos[chave]
      }
    })

    const solicitacao = await Solicitacao.findByIdAndUpdate(
      req.params.id,
      dadosPermitidos,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("demanda")
      .populate("fornecedor")

    if (!solicitacao) {
      return res.status(404).json({ erro: "Solicitação não encontrada." })
    }

    return res.json(solicitacao)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao atualizar solicitação." })
  }
}

export async function excluirSolicitacao(req, res) {
  try {
    const solicitacao = await Solicitacao.findByIdAndDelete(req.params.id)

    if (!solicitacao) {
      return res.status(404).json({ erro: "Solicitação não encontrada." })
    }

    return res.json({ mensagem: "Solicitação excluída com sucesso." })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao excluir solicitação." })
  }
}
