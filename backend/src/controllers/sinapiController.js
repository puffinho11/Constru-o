import SinapiItem from "../models/SinapiItem.js"

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function escaparRegex(valor = "") {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export async function pesquisarSinapi(req, res) {
  try {
    const buscaOriginal = String(req.query.busca || "").trim()
    const tipo = String(req.query.tipo || "").trim().toUpperCase()
    const referencia = String(req.query.referencia || "05/2026").trim()
    const limiteSolicitado = Number(req.query.limite || 20)
    const limite = Math.min(Math.max(limiteSolicitado, 1), 50)

    if (buscaOriginal.length < 2) {
      return res.status(200).json({
        itens: [],
        total: 0,
        referencia,
        uf: "PR",
      })
    }

    const busca = normalizarTexto(buscaOriginal)
    const termos = busca.split(" ").filter(Boolean).slice(0, 8)
    const filtros = {
      ativo: true,
      uf: "PR",
      referencia,
    }

    if (["INSUMO", "COMPOSICAO"].includes(tipo)) {
      filtros.tipo = tipo
    }

    const somenteCodigo = /^\d+$/.test(buscaOriginal)

    if (somenteCodigo) {
      filtros.codigo = {
        $regex: `^${escaparRegex(buscaOriginal)}`,
        $options: "i",
      }
    } else {
      filtros.$and = termos.map((termo) => ({
        descricaoBusca: {
          $regex: escaparRegex(termo),
          $options: "i",
        },
      }))
    }

    const itens = await SinapiItem.find(filtros)
      .select(
        "codigo descricao unidade preco tipo grupo origemPreco uf localidade referencia regime fonte"
      )
      .sort({ tipo: 1, codigo: 1 })
      .limit(limite)
      .lean()

    return res.status(200).json({
      itens,
      total: itens.length,
      referencia,
      uf: "PR",
    })
  } catch (error) {
    console.error("Erro ao pesquisar SINAPI:", error)

    return res.status(500).json({
      erro: "Erro ao pesquisar a tabela SINAPI.",
      detalhe: error.message,
    })
  }
}

export async function buscarSinapiPorCodigo(req, res) {
  try {
    const codigo = String(req.params.codigo || "").trim()
    const tipo = String(req.query.tipo || "").trim().toUpperCase()
    const referencia = String(req.query.referencia || "05/2026").trim()

    const filtro = {
      codigo,
      uf: "PR",
      referencia,
      ativo: true,
    }

    if (["INSUMO", "COMPOSICAO"].includes(tipo)) {
      filtro.tipo = tipo
    }

    const item = await SinapiItem.findOne(filtro).lean()

    if (!item) {
      return res.status(404).json({
        erro: "Item SINAPI não encontrado.",
      })
    }

    return res.status(200).json(item)
  } catch (error) {
    console.error("Erro ao buscar item SINAPI:", error)

    return res.status(500).json({
      erro: "Erro ao buscar item SINAPI.",
      detalhe: error.message,
    })
  }
}

export async function resumoSinapi(req, res) {
  try {
    const referencia = String(req.query.referencia || "05/2026").trim()

    const [total, insumos, composicoes] = await Promise.all([
      SinapiItem.countDocuments({ ativo: true, uf: "PR", referencia }),
      SinapiItem.countDocuments({
        ativo: true,
        uf: "PR",
        referencia,
        tipo: "INSUMO",
      }),
      SinapiItem.countDocuments({
        ativo: true,
        uf: "PR",
        referencia,
        tipo: "COMPOSICAO",
      }),
    ])

    return res.status(200).json({
      total,
      insumos,
      composicoes,
      uf: "PR",
      localidade: "CURITIBA",
      referencia,
      regime: "SEM ENCARGOS SOCIAIS",
      fonte: "SINAPI",
    })
  } catch (error) {
    console.error("Erro ao consultar resumo SINAPI:", error)

    return res.status(500).json({
      erro: "Erro ao consultar resumo SINAPI.",
      detalhe: error.message,
    })
  }
}
