import crypto from "crypto"

import Cotacao from "../models/Cotacao.js"
import Demanda from "../models/Demanda.js"
import Proposta from "../models/Proposta.js"

async function gerarNumeroCotacao() {
  const ano = new Date().getFullYear()

  const inicioAno = new Date(
    `${ano}-01-01T00:00:00.000Z`
  )

  const fimAno = new Date(
    `${ano}-12-31T23:59:59.999Z`
  )

  const total = await Cotacao.countDocuments({
    createdAt: {
      $gte: inicioAno,
      $lte: fimAno,
    },
  })

  return `COT-${String(total + 1).padStart(
    3,
    "0"
  )}/${ano}`
}

function criarTokenPublico() {
  return crypto
    .randomBytes(32)
    .toString("hex")
}

function cotacaoEstaEncerrada(cotacao) {
  return (
    cotacao.status !== "Aberta" ||
    new Date(cotacao.encerraEm).getTime() <=
      Date.now()
  )
}

export async function listarCotacoes(
  req,
  res
) {
  try {
    const cotacoes =
      await Cotacao.find()
        .populate({
          path: "demanda",
          select:
            "numeroDemanda objeto secretaria materiais",
        })
        .populate({
          path: "propostaVencedora",
          populate: {
            path: "fornecedor",
            select:
              "empresa razaoSocial email cnpj",
          },
        })
        .sort({
          createdAt: -1,
        })

    return res.status(200).json(
      cotacoes
    )
  } catch (error) {
    console.error(
      "Erro ao listar cotações:",
      error
    )

    return res.status(500).json({
      erro:
        "Erro ao listar cotações.",
      detalhe:
        error.message,
    })
  }
}

export async function buscarCotacao(
  req,
  res
) {
  try {
    const cotacao =
      await Cotacao.findById(
        req.params.id
      )
        .populate({
          path: "demanda",
          select:
            "numeroDemanda objeto secretaria justificativa materiais",
        })
        .populate({
          path: "propostaVencedora",
          populate: {
            path: "fornecedor",
            select:
              "empresa razaoSocial email cnpj responsavel",
          },
        })

    if (!cotacao) {
      return res.status(404).json({
        erro:
          "Cotação não encontrada.",
      })
    }

    const propostas =
      await Proposta.find({
        cotacao:
          cotacao._id,
      })
        .populate({
          path: "fornecedor",
          select:
            "empresa razaoSocial email cnpj responsavel telefone cidade",
        })
        .sort({
          valorTotal: 1,
          createdAt: 1,
        })

    return res.status(200).json({
      cotacao,
      propostas,
    })
  } catch (error) {
    console.error(
      "Erro ao buscar cotação:",
      error
    )

    return res.status(500).json({
      erro:
        "Erro ao buscar cotação.",
      detalhe:
        error.message,
    })
  }
}
export async function criarCotacao(
  req,
  res
) {
  try {
    const {
      demandaId,
      prazoHoras,
      observacao,
    } = req.body

    if (!demandaId) {
      return res.status(400).json({
        erro:
          "Selecione uma demanda.",
      })
    }

    const horas = Number(
      prazoHoras
    )

    if (
      !Number.isFinite(horas) ||
      horas < 1 ||
      horas > 720
    ) {
      return res.status(400).json({
        erro:
          "Informe um prazo entre 1 e 720 horas.",
      })
    }

    const demanda =
      await Demanda.findById(
        demandaId
      )

    if (!demanda) {
      return res.status(404).json({
        erro:
          "Demanda não encontrada.",
      })
    }

    const agora = new Date()

    const encerraEm =
      new Date(
        agora.getTime() +
          horas *
            60 *
            60 *
            1000
      )

    const cotacao =
      await Cotacao.create({
        numero:
          await gerarNumeroCotacao(),

        demanda:
          demanda._id,

        tokenPublico:
          criarTokenPublico(),

        participantes: [],

        inicioEm:
          agora,

        prazoHoras:
          horas,

        encerraEm,

        observacao:
          observacao || "",

        status:
          "Aberta",

        propostaVencedora:
          null,

        criadaPor:
          req.user?.id ||
          req.user?._id ||
          null,
      })

    const cotacaoCompleta =
      await Cotacao.findById(
        cotacao._id
      ).populate({
        path:
          "demanda",

        select:
          "numeroDemanda objeto secretaria materiais",
      })

    return res.status(201).json({
      mensagem:
        "Cotação criada com sucesso. Copie o link público e compartilhe com as empresas.",

      cotacao:
        cotacaoCompleta,

      tokenPublico:
        cotacaoCompleta.tokenPublico,
    })
  } catch (error) {
    console.error(
      "Erro ao criar cotação:",
      error
    )

    return res.status(500).json({
      erro:
        "Erro ao criar cotação.",

      detalhe:
        error.message,
    })
  }
}

export async function encerrarCotacao(
  req,
  res
) {
  try {
    const cotacao =
      await Cotacao.findById(
        req.params.id
      )

    if (!cotacao) {
      return res.status(404).json({
        erro:
          "Cotação não encontrada.",
      })
    }

    const propostas =
      await Proposta.find({
        cotacao:
          cotacao._id,

        status: {
          $nin: [
            "Desclassificada",
            "Reprovado",
          ],
        },
      }).sort({
        valorTotal: 1,
        createdAt: 1,
      })

    if (
      propostas.length === 0
    ) {
      cotacao.status =
        "Finalizada"

      cotacao.finalizadaEm =
        new Date()

      cotacao.propostaVencedora =
        null

      await cotacao.save()

      return res.status(200).json({
        mensagem:
          "Cotação encerrada sem propostas válidas.",

        cotacao,
      })
    }

    await Proposta.updateMany(
      {
        cotacao:
          cotacao._id,
      },
      {
        $set: {
          status:
            "Classificada",
        },
      }
    )

    const vencedora =
      propostas[0]

    vencedora.status =
      "Vencedora"

    vencedora.julgadaEm =
      new Date()

    vencedora.julgadaPor =
      req.user?.id ||
      req.user?._id ||
      null

    await vencedora.save()

    cotacao.status =
      "Finalizada"

    cotacao.finalizadaEm =
      new Date()

    cotacao.propostaVencedora =
      vencedora._id

    await cotacao.save()

    const resultado =
      await Cotacao.findById(
        cotacao._id
      )
        .populate({
          path:
            "propostaVencedora",

          populate: {
            path:
              "fornecedor",

            select:
              "empresa razaoSocial email cnpj responsavel",
          },
        })
        .populate({
          path:
            "demanda",

          select:
            "numeroDemanda objeto secretaria",
        })

    return res.status(200).json({
      mensagem:
        "Cotação encerrada e vencedor calculado.",

      cotacao:
        resultado,
    })
  } catch (error) {
    console.error(
      "Erro ao encerrar cotação:",
      error
    )

    return res.status(500).json({
      erro:
        "Erro ao encerrar cotação.",

      detalhe:
        error.message,
    })
  }
}
export async function cancelarCotacao(
  req,
  res
) {
  try {
    const cotacao =
      await Cotacao.findById(
        req.params.id
      )

    if (!cotacao) {
      return res.status(404).json({
        erro:
          "Cotação não encontrada.",
      })
    }

    cotacao.status =
      "Cancelada"

    cotacao.canceladaEm =
      new Date()

    await cotacao.save()

    return res.status(200).json({
      mensagem:
        "Cotação cancelada com sucesso.",

      cotacao,
    })
  } catch (error) {
    console.error(
      "Erro ao cancelar cotação:",
      error
    )

    return res.status(500).json({
      erro:
        "Erro ao cancelar cotação.",

      detalhe:
        error.message,
    })
  }
}

export async function excluirCotacao(
  req,
  res
) {
  try {
    const cotacao =
      await Cotacao.findById(
        req.params.id
      )

    if (!cotacao) {
      return res.status(404).json({
        erro:
          "Cotação não encontrada.",
      })
    }

    const resultadoPropostas =
      await Proposta.deleteMany({
        cotacao:
          cotacao._id,
      })

    await Cotacao.findByIdAndDelete(
      cotacao._id
    )

    return res.status(200).json({
      mensagem:
        "Cotação excluída com sucesso.",

      cotacaoId:
        cotacao._id,

      propostasExcluidas:
        resultadoPropostas.deletedCount ||
        0,
    })
  } catch (error) {
    console.error(
      "Erro ao excluir cotação:",
      error
    )

    return res.status(500).json({
      erro:
        "Erro ao excluir cotação.",

      detalhe:
        error.message,
    })
  }
}
export async function acessarCotacaoPublica(
  req,
  res
) {
  try {
    const { token } = req.params

    const cotacao =
      await Cotacao.findOne({
        tokenPublico: token,
      }).populate({
        path: "demanda",
        select:
          "numeroDemanda objeto secretaria justificativa materiais",
      })

    if (!cotacao) {
      return res.status(404).json({
        erro:
          "Link de cotação inválido.",
      })
    }

    const proposta =
      await Proposta.findOne({
        cotacao:
          cotacao._id,
      })

    const encerrada =
      cotacaoEstaEncerrada(
        cotacao
      )

    return res.status(200).json({
      cotacao: {
        _id:
          cotacao._id,

        numero:
          cotacao.numero,

        prazoHoras:
          cotacao.prazoHoras,

        encerraEm:
          cotacao.encerraEm,

        observacao:
          cotacao.observacao,

        status:
          cotacao.status,

        tokenPublico:
          cotacao.tokenPublico,
      },

      demanda: {
        _id:
          cotacao.demanda._id,

        numeroDemanda:
          cotacao.demanda
            .numeroDemanda,

        objeto:
          cotacao.demanda
            .objeto,

        secretaria:
          cotacao.demanda
            .secretaria,

        justificativa:
          cotacao.demanda
            .justificativa,

        materiais:
          cotacao.demanda
            .materiais || [],
      },

      podeResponder:
        !encerrada,

      propostaEnviada:
        Boolean(proposta),
    })
  } catch (error) {
    console.error(
      "Erro ao acessar cotação pública:",
      error
    )

    return res.status(500).json({
      erro:
        "Erro ao abrir a cotação.",

      detalhe:
        error.message,
    })
  }
}