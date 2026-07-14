import crypto from "crypto"

import Cotacao from "../models/Cotacao.js"
import Demanda from "../models/Demanda.js"
import Fornecedor from "../models/Fornecedor.js"
import Proposta from "../models/Proposta.js"

import { enviarEmailCotacao } from "../services/emailService.js"
import { finalizarCotacao } from "../services/cotacaoService.js"

async function gerarNumeroCotacao() {
  const ano = new Date().getFullYear()

  const inicioAno = new Date(`${ano}-01-01T00:00:00.000Z`)
  const fimAno = new Date(`${ano}-12-31T23:59:59.999Z`)

  const total = await Cotacao.countDocuments({
    createdAt: {
      $gte: inicioAno,
      $lte: fimAno,
    },
  })

  return `COT-${String(total + 1).padStart(3, "0")}/${ano}`
}

function criarToken() {
  return crypto.randomBytes(32).toString("hex")
}

function cotacaoExpirada(cotacao) {
  return new Date() >= new Date(cotacao.encerraEm)
}

function obterUsuarioId(req) {
  return req.user?._id || req.user?.id || null
}

export async function listarCotacoes(req, res) {
  try {
    const cotacoes = await Cotacao.find()
      .populate("demanda")
      .populate("participantes.fornecedor")
      .populate({
        path: "propostaVencedora",
        populate: {
          path: "fornecedor",
        },
      })
      .sort({
        createdAt: -1,
      })

    return res.status(200).json(cotacoes)
  } catch (error) {
    console.error("Erro ao listar cotações:", error)

    return res.status(500).json({
      erro: "Erro ao listar cotações.",
      detalhe: error.message,
    })
  }
}

export async function buscarCotacaoPorId(req, res) {
  try {
    let cotacao = await Cotacao.findById(req.params.id)
      .populate("demanda")
      .populate("participantes.fornecedor")
      .populate({
        path: "propostaVencedora",
        populate: {
          path: "fornecedor",
        },
      })

    if (!cotacao) {
      return res.status(404).json({
        erro: "Cotação não encontrada.",
      })
    }

    if (cotacao.status === "Aberta" && cotacaoExpirada(cotacao)) {
      await finalizarCotacao(cotacao._id)

      cotacao = await Cotacao.findById(cotacao._id)
        .populate("demanda")
        .populate("participantes.fornecedor")
        .populate({
          path: "propostaVencedora",
          populate: {
            path: "fornecedor",
          },
        })
    }

    const propostas = await Proposta.find({
      cotacao: cotacao._id,
    })
      .populate("fornecedor")
      .sort({
        valorTotal: 1,
        recebidaEm: 1,
      })

    return res.status(200).json({
      cotacao,
      propostas,
    })
  } catch (error) {
    console.error("Erro ao buscar cotação:", error)

    return res.status(500).json({
      erro: "Erro ao buscar cotação.",
      detalhe: error.message,
    })
  }
}

export async function criarCotacao(req, res) {
  try {
    const {
      demandaId,
      fornecedorIds,
      prazoHoras,
      observacao,
    } = req.body

    if (!demandaId) {
      return res.status(400).json({
        erro: "Selecione uma demanda.",
      })
    }

    if (!Array.isArray(fornecedorIds) || fornecedorIds.length === 0) {
      return res.status(400).json({
        erro: "Selecione pelo menos um fornecedor.",
      })
    }

    const horas = Number(prazoHoras)

    if (!Number.isFinite(horas) || horas < 1 || horas > 720) {
      return res.status(400).json({
        erro: "O prazo deve estar entre 1 e 720 horas.",
      })
    }

    const idsUnicos = [...new Set(fornecedorIds.map(String))]

    const [demanda, fornecedores] = await Promise.all([
      Demanda.findById(demandaId),
      Fornecedor.find({
        _id: {
          $in: idsUnicos,
        },
        status: "Ativo",
      }),
    ])

    if (!demanda) {
      return res.status(404).json({
        erro: "Demanda não encontrada.",
      })
    }

    if (fornecedores.length === 0) {
      return res.status(400).json({
        erro: "Nenhum fornecedor ativo foi encontrado.",
      })
    }

    const fornecedoresSemEmail = fornecedores.filter(
      (fornecedor) => !fornecedor.email?.trim()
    )

    if (fornecedoresSemEmail.length > 0) {
      return res.status(400).json({
        erro: "Existem fornecedores sem e-mail cadastrado.",
        fornecedores: fornecedoresSemEmail.map(
          (fornecedor) =>
            fornecedor.empresa ||
            fornecedor.razaoSocial ||
            String(fornecedor._id)
        ),
      })
    }

    const inicioEm = new Date()
    const encerraEm = new Date(
      inicioEm.getTime() + horas * 60 * 60 * 1000
    )

    const participantes = fornecedores.map((fornecedor) => ({
      fornecedor: fornecedor._id,
      token: criarToken(),
      email: fornecedor.email.trim().toLowerCase(),
      emailEnviado: false,
      erroEmail: "",
    }))

    const cotacao = await Cotacao.create({
      numero: await gerarNumeroCotacao(),
      demanda: demanda._id,
      participantes,
      prazoHoras: horas,
      inicioEm,
      encerraEm,
      observacao: observacao?.trim() || "",
      status: "Aberta",
      criadaPor: obterUsuarioId(req),
    })

    const frontendUrl =
      process.env.FRONT_URL || "http://localhost:5173"

    const resultadosEmail = await Promise.allSettled(
      fornecedores.map(async (fornecedor) => {
        const participante = cotacao.participantes.find(
          (item) =>
            String(item.fornecedor) === String(fornecedor._id)
        )

        if (!participante) {
          throw new Error("Participante da cotação não encontrado.")
        }

        const link = `${frontendUrl}/cotacao/${participante.token}`

        const resultado = await enviarEmailCotacao({
          destinatario: fornecedor.email,
          nomeFornecedor:
            fornecedor.empresa ||
            fornecedor.razaoSocial ||
            fornecedor.responsavel ||
            "Fornecedor",
          numeroCotacao: cotacao.numero,
          numeroDemanda: demanda.numeroDemanda,
          objeto: demanda.objeto,
          secretaria: demanda.secretaria,
          prazoHoras: horas,
          encerraEm,
          link,
          materiais: demanda.materiais || [],
          observacao: observacao?.trim() || "",
        })

        return {
          fornecedorId: fornecedor._id,
          messageId: resultado.messageId,
        }
      })
    )

    resultadosEmail.forEach((resultado, index) => {
      const fornecedor = fornecedores[index]

      const participante = cotacao.participantes.find(
        (item) =>
          String(item.fornecedor) === String(fornecedor._id)
      )

      if (!participante) return

      if (resultado.status === "fulfilled") {
        participante.emailEnviado = true
        participante.enviadoEm = new Date()
        participante.erroEmail = ""
      } else {
        participante.emailEnviado = false
        participante.erroEmail =
          resultado.reason?.message ||
          "Erro desconhecido no envio do e-mail."
      }
    })

    await cotacao.save()

    const cotacaoCompleta = await Cotacao.findById(cotacao._id)
      .populate("demanda")
      .populate("participantes.fornecedor")

    const enviados = cotacao.participantes.filter(
      (item) => item.emailEnviado
    ).length

    return res.status(201).json({
      mensagem: `Cotação criada. ${enviados} de ${fornecedores.length} e-mail(s) enviado(s).`,
      cotacao: cotacaoCompleta,
    })
  } catch (error) {
    console.error("Erro ao criar cotação:", error)

    return res.status(500).json({
      erro: "Erro ao criar a cotação.",
      detalhe: error.message,
    })
  }
}

export async function reenviarEmailsCotacao(req, res) {
  try {
    const cotacao = await Cotacao.findById(req.params.id)
      .populate("demanda")
      .populate("participantes.fornecedor")

    if (!cotacao) {
      return res.status(404).json({
        erro: "Cotação não encontrada.",
      })
    }

    if (cotacao.status !== "Aberta" || cotacaoExpirada(cotacao)) {
      return res.status(400).json({
        erro: "Somente cotações abertas podem ter os e-mails reenviados.",
      })
    }

    const frontendUrl =
      process.env.FRONT_URL || "http://localhost:5173"

    const resultados = await Promise.allSettled(
      cotacao.participantes.map(async (participante) => {
        const fornecedor = participante.fornecedor
        const link = `${frontendUrl}/cotacao/${participante.token}`

        const resultado = await enviarEmailCotacao({
          destinatario:
            participante.email ||
            fornecedor?.email,
          nomeFornecedor:
            fornecedor?.empresa ||
            fornecedor?.razaoSocial ||
            fornecedor?.responsavel ||
            "Fornecedor",
          numeroCotacao: cotacao.numero,
          numeroDemanda: cotacao.demanda?.numeroDemanda,
          objeto: cotacao.demanda?.objeto,
          secretaria: cotacao.demanda?.secretaria,
          prazoHoras: cotacao.prazoHoras,
          encerraEm: cotacao.encerraEm,
          link,
          materiais: cotacao.demanda?.materiais || [],
          observacao: cotacao.observacao,
        })

        return resultado.messageId
      })
    )

    resultados.forEach((resultado, index) => {
      const participante = cotacao.participantes[index]

      if (resultado.status === "fulfilled") {
        participante.emailEnviado = true
        participante.enviadoEm = new Date()
        participante.erroEmail = ""
      } else {
        participante.emailEnviado = false
        participante.erroEmail =
          resultado.reason?.message || "Erro no reenvio do e-mail."
      }
    })

    await cotacao.save()

    const enviados = cotacao.participantes.filter(
      (item) => item.emailEnviado
    ).length

    return res.status(200).json({
      mensagem: `Reenvio concluído. ${enviados} de ${cotacao.participantes.length} e-mail(s) enviado(s).`,
      cotacao,
    })
  } catch (error) {
    console.error("Erro ao reenviar e-mails:", error)

    return res.status(500).json({
      erro: "Erro ao reenviar os e-mails.",
      detalhe: error.message,
    })
  }
}

export async function encerrarCotacao(req, res) {
  try {
    const cotacao = await finalizarCotacao(req.params.id)

    const cotacaoCompleta = await Cotacao.findById(cotacao._id)
      .populate("demanda")
      .populate("participantes.fornecedor")
      .populate({
        path: "propostaVencedora",
        populate: {
          path: "fornecedor",
        },
      })

    return res.status(200).json({
      mensagem: "Cotação encerrada e resultado calculado.",
      cotacao: cotacaoCompleta,
    })
  } catch (error) {
    console.error("Erro ao encerrar cotação:", error)

    return res.status(500).json({
      erro: error.message || "Erro ao encerrar cotação.",
    })
  }
}

export async function cancelarCotacao(req, res) {
  try {
    const cotacao = await Cotacao.findById(req.params.id)

    if (!cotacao) {
      return res.status(404).json({
        erro: "Cotação não encontrada.",
      })
    }

    if (cotacao.status === "Finalizada") {
      return res.status(400).json({
        erro: "Uma cotação finalizada não pode ser cancelada.",
      })
    }

    cotacao.status = "Cancelada"
    await cotacao.save()

    return res.status(200).json({
      mensagem: "Cotação cancelada.",
      cotacao,
    })
  } catch (error) {
    console.error("Erro ao cancelar cotação:", error)

    return res.status(500).json({
      erro: "Erro ao cancelar cotação.",
      detalhe: error.message,
    })
  }
}

export async function acessarCotacaoPublica(req, res) {
  try {
    const cotacao = await Cotacao.findOne({
      "participantes.token": req.params.token,
    })
      .populate("demanda")
      .populate("participantes.fornecedor")

    if (!cotacao) {
      return res.status(404).json({
        erro: "Link de cotação inválido.",
      })
    }

    const participante = cotacao.participantes.find(
      (item) => item.token === req.params.token
    )

    if (!participante) {
      return res.status(404).json({
        erro: "Participante não encontrado.",
      })
    }

    if (!participante.visualizadoEm) {
      participante.visualizadoEm = new Date()
      await cotacao.save()
    }

    const proposta = await Proposta.findOne({
      cotacao: cotacao._id,
      participanteToken: req.params.token,
    })

    const expirada = cotacaoExpirada(cotacao)

    if (cotacao.status === "Aberta" && expirada) {
      await finalizarCotacao(cotacao._id)
    }

    return res.status(200).json({
      cotacao: {
        id: cotacao._id,
        numero: cotacao.numero,
        prazoHoras: cotacao.prazoHoras,
        inicioEm: cotacao.inicioEm,
        encerraEm: cotacao.encerraEm,
        observacao: cotacao.observacao,
        status: expirada ? "Encerrada" : cotacao.status,
      },

      fornecedor: {
        id: participante.fornecedor?._id,
        empresa:
          participante.fornecedor?.empresa ||
          participante.fornecedor?.razaoSocial ||
          participante.fornecedor?.responsavel ||
          "Fornecedor",
        email:
          participante.email ||
          participante.fornecedor?.email ||
          "",
      },

      demanda: {
        numeroDemanda: cotacao.demanda?.numeroDemanda,
        secretaria: cotacao.demanda?.secretaria,
        objeto: cotacao.demanda?.objeto,
        justificativa: cotacao.demanda?.justificativa,
        materiais: cotacao.demanda?.materiais || [],
      },

      propostaEnviada: Boolean(proposta),
      proposta,

      podeResponder:
        cotacao.status === "Aberta" &&
        !expirada &&
        !proposta,
    })
  } catch (error) {
    console.error("Erro ao abrir cotação pública:", error)

    return res.status(500).json({
      erro: "Erro ao abrir a cotação.",
      detalhe: error.message,
    })
  }
}
