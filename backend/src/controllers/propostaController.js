import Cotacao from "../models/Cotacao.js"
import Proposta from "../models/Proposta.js"

async function gerarNumeroProposta() {
  const ano = new Date().getFullYear()

  const total = await Proposta.countDocuments({
    createdAt: {
      $gte: new Date(
        `${ano}-01-01T00:00:00.000Z`
      ),

      $lte: new Date(
        `${ano}-12-31T23:59:59.999Z`
      ),
    },
  })

  return `PROP-${String(
    total + 1
  ).padStart(3, "0")}/${ano}`
}

function limparCnpj(valor = "") {
  return String(valor).replace(
    /\D/g,
    ""
  )
}

export async function enviarPropostaPublica(
  req,
  res
) {
  try {
    const cotacao =
      await Cotacao.findOne({
        tokenPublico:
          req.params.token,
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

    if (
      cotacao.status !== "Aberta" ||
      new Date() >=
        new Date(
          cotacao.encerraEm
        )
    ) {
      return res.status(400).json({
        erro:
          "O prazo para envio da proposta foi encerrado.",
      })
    }

    const {
      empresa,
      cnpj,
      responsavel,
      email,
      telefone,
      itens,
      prazoEntrega,
      validadeDias,
      observacao,
    } = req.body

    const cnpjLimpo =
      limparCnpj(cnpj)

    if (!empresa?.trim()) {
      return res.status(400).json({
        erro:
          "Informe o nome ou razão social da empresa.",
      })
    }

    if (
      cnpjLimpo.length !== 14
    ) {
      return res.status(400).json({
        erro:
          "Informe um CNPJ válido com 14 números.",
      })
    }

    if (!responsavel?.trim()) {
      return res.status(400).json({
        erro:
          "Informe o responsável pela proposta.",
      })
    }

    if (!email?.trim()) {
      return res.status(400).json({
        erro:
          "Informe o e-mail da empresa.",
      })
    }

    if (
      !Array.isArray(itens) ||
      itens.length === 0
    ) {
      return res.status(400).json({
        erro:
          "Informe os valores dos itens.",
      })
    }

    const materiaisDemanda =
      cotacao.demanda?.materiais ||
      []

    if (
      itens.length !==
      materiaisDemanda.length
    ) {
      return res.status(400).json({
        erro:
          "A quantidade de itens enviados não corresponde à demanda.",
      })
    }
        const itensTratados =
      materiaisDemanda.map(
        (material, index) => {
          const valorUnitario =
            Number(
              itens[index]?.valorUnitario
            )

          const marca =
            String(
              itens[index]?.marca || ""
            ).trim()

          if (
            !Number.isFinite(valorUnitario) ||
            valorUnitario < 0
          ) {
            throw new Error(
              `Valor unitário inválido no item ${index + 1}.`
            )
          }

          const quantidade =
            Number(
              material.quantidade || 0
            )

          return {
            material:
              material.item ||
              material.material ||
              "-",

            quantidade,

            unidade:
              material.unidade ||
              "",

            marca,

            valorUnitario,

            valorTotal: Number(
              (
                quantidade *
                valorUnitario
              ).toFixed(2)
            ),
          }
        }
      )

    const valorTotal =
      Number(
        itensTratados
          .reduce(
            (
              total,
              item
            ) =>
              total +
              item.valorTotal,
            0
          )
          .toFixed(2)
      )

    const proposta =
      await Proposta.create({
        numero:
          await gerarNumeroProposta(),

        cotacao:
          cotacao._id,

        fornecedor:
          null,

        empresa:
          empresa.trim(),

        cnpj:
          cnpjLimpo,

        responsavel:
          responsavel.trim(),

        email:
          email
            .trim()
            .toLowerCase(),

        telefone:
          String(
            telefone || ""
          ).trim(),

        itens:
          itensTratados,

        valorReferenciaSinapi:
          valorTotal,

        percentualDesconto:
          0,

        valorTotal,

        prazoEntrega:
          String(
            prazoEntrega || ""
          ).trim(),

        validadeDias:
          Number(
            validadeDias || 60
          ),

        observacao:
          String(
            observacao || ""
          ).trim(),

        status:
          "Recebida",
      })

    return res.status(201).json({
      mensagem:
        "Proposta enviada com sucesso.",

      proposta: {
        numero:
          proposta.numero,

        empresa:
          proposta.empresa,

        valorTotal:
          proposta.valorTotal,

        recebidaEm:
          proposta.createdAt,
      },
    })
      } catch (error) {
    console.error(
      "Erro ao enviar proposta:",
      error
    )

    return res.status(500).json({
      erro:
        error.message ||
        "Erro ao enviar a proposta.",
    })
  }
}

export async function listarPropostas(
  req,
  res
) {
  try {
    const filtro = {}

    if (req.query.cotacaoId) {
      filtro.cotacao =
        req.query.cotacaoId
    }

    const propostas =
      await Proposta.find(
        filtro
      )
        .populate({
          path:
            "cotacao",

          populate: {
            path:
              "demanda",

            select:
              "numeroDemanda objeto secretaria justificativa materiais",
          },
        })
        .populate({
          path:
            "fornecedor",

          select:
            "empresa razaoSocial email cnpj responsavel telefone cidade",
        })
        .populate({
          path:
            "julgadaPor",

          select:
            "nome email perfil role",
        })
        .sort({
          valorTotal:
            1,

          createdAt:
            1,
        })

    return res
      .status(200)
      .json(
        propostas
      )
  } catch (error) {
    console.error(
      "Erro ao listar propostas:",
      error
    )

    return res
      .status(500)
      .json({
        erro:
          "Erro ao listar propostas.",

        detalhe:
          error.message,
      })
  }
}

export async function julgarProposta(
  req,
  res
) {
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

    if (
      !statusPermitidos.includes(
        status
      )
    ) {
      return res
        .status(400)
        .json({
          erro:
            "Status de julgamento inválido.",
        })
    }

    const proposta =
      await Proposta.findById(
        req.params.id
      )

    if (!proposta) {
      return res
        .status(404)
        .json({
          erro:
            "Proposta não encontrada.",
        })
    }

    if (
      status ===
      "Vencedora"
    ) {
      await Proposta.updateMany(
        {
          cotacao:
            proposta.cotacao,

          _id: {
            $ne:
              proposta._id,
          },

          status:
            "Vencedora",
        },
        {
          status:
            "Classificada",
        }
      )

      await Cotacao.findByIdAndUpdate(
        proposta.cotacao,
        {
          propostaVencedora:
            proposta._id,

          status:
            "Finalizada",

          finalizadaEm:
            new Date(),
        }
      )
    }

    proposta.status =
      status

    proposta.justificativaJulgamento =
      justificativa || ""

    proposta.julgadaEm =
      new Date()

    proposta.julgadaPor =
      req.user?._id ||
      req.user?.id ||
      null

    await proposta.save()

    return res
      .status(200)
      .json({
        mensagem:
          "Julgamento salvo.",

        proposta,
      })
  } catch (error) {
    console.error(
      "Erro ao julgar proposta:",
      error
    )

    return res
      .status(500)
      .json({
        erro:
          "Erro ao julgar proposta.",

        detalhe:
          error.message,
      })
  }
}

export async function excluirProposta(
  req,
  res
) {
  try {
    const proposta =
      await Proposta.findByIdAndDelete(
        req.params.id
      )

    if (!proposta) {
      return res
        .status(404)
        .json({
          erro:
            "Proposta não encontrada.",
        })
    }

    return res
      .status(200)
      .json({
        mensagem:
          "Proposta excluída.",
      })
  } catch (error) {
    console.error(
      "Erro ao excluir proposta:",
      error
    )

    return res
      .status(500)
      .json({
        erro:
          "Erro ao excluir proposta.",

        detalhe:
          error.message,
      })
  }
}