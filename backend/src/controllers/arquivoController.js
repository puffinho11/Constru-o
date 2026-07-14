import Arquivo from "../models/Arquivo.js"

export async function listarArquivos(req, res) {
  try {
    const filtro = {}

    if (req.query.processo) {
      filtro.processo = req.query.processo
    }

    if (req.query.tipo) {
      filtro.tipo = req.query.tipo
    }

    const arquivos = await Arquivo.find(filtro)
      .populate("criadoPor", "nome email")
      .sort({ createdAt: -1 })

    return res.json(arquivos)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao listar arquivos." })
  }
}

export async function buscarArquivoPorId(req, res) {
  try {
    const arquivo = await Arquivo.findById(req.params.id)
      .populate("criadoPor", "nome email")

    if (!arquivo) {
      return res.status(404).json({ erro: "Arquivo não encontrado." })
    }

    return res.json(arquivo)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao buscar arquivo." })
  }
}

export async function criarArquivo(req, res) {
  try {
    const {
      nome,
      tipo,
      processo,
      observacao,
      url,
      caminho,
      mimeType,
      tamanho,
      nomeOriginal,
    } = req.body

    if (!nome) {
      return res.status(400).json({ erro: "Nome do arquivo é obrigatório." })
    }

    const arquivo = await Arquivo.create({
      nome,
      nomeOriginal: nomeOriginal || "",
      tipo: tipo || "Documento",
      processo: processo || "",
      observacao: observacao || "",
      url: url || "",
      caminho: caminho || "",
      mimeType: mimeType || "",
      tamanho: Number(tamanho || 0),
      criadoPor: req.user?._id || req.user?.id || null,
    })

    return res.status(201).json(arquivo)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao cadastrar arquivo." })
  }
}

export async function atualizarArquivo(req, res) {
  try {
    const arquivo = await Arquivo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!arquivo) {
      return res.status(404).json({ erro: "Arquivo não encontrado." })
    }

    return res.json(arquivo)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao atualizar arquivo." })
  }
}

export async function excluirArquivo(req, res) {
  try {
    const arquivo = await Arquivo.findByIdAndDelete(req.params.id)

    if (!arquivo) {
      return res.status(404).json({ erro: "Arquivo não encontrado." })
    }

    return res.json({ mensagem: "Arquivo excluído com sucesso." })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: "Erro ao excluir arquivo." })
  }
}
