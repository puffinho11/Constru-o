import fs from "fs/promises"

import Cotacao from "../models/Cotacao.js"
import Fornecedor from "../models/Fornecedor.js"
import FornecedorAcesso from "../models/FornecedorAcesso.js"
import CotacaoMensagem from "../models/CotacaoMensagem.js"

function usuarioEhFornecedor(req) {
  return (
    String(req.user?.role || "").toLowerCase() ===
      "fornecedor" ||
    String(req.user?.tipo || "").toLowerCase() ===
      "fornecedor" ||
    String(req.user?.perfil || "").toLowerCase() ===
      "fornecedor"
  )
}

function obterFornecedorDoToken(req) {
  return (
    req.user?.fornecedorId ||
    req.user?.fornecedor ||
    null
  )
}

function obterTipoChat(req) {
  const tipo = String(
    req.body?.tipoChat ||
      req.query?.tipoChat ||
      "privado"
  )
    .trim()
    .toLowerCase()

  return tipo === "grupo" ? "grupo" : "privado"
}

async function obterFornecedorPermitido(req, tipoChat) {
  if (tipoChat === "grupo") {
    return null
  }

  if (usuarioEhFornecedor(req)) {
    const fornecedorId = obterFornecedorDoToken(req)

    if (!fornecedorId) {
      throw new Error(
        "O fornecedor não foi identificado no token."
      )
    }

    return String(fornecedorId)
  }

  const fornecedorId =
    req.body?.fornecedorId ||
    req.query?.fornecedorId

  if (!fornecedorId) {
    throw new Error("Selecione um fornecedor.")
  }

  return String(fornecedorId)
}

function extrairIdsFornecedores(cotacao) {
  const fontes = [
    cotacao.fornecedores,
    cotacao.fornecedorIds,
    cotacao.fornecedoresConvidados,
    cotacao.destinatarios,
  ]

  const ids = fontes
    .filter(Array.isArray)
    .flat()
    .map((item) =>
      String(
        item?._id ||
          item?.fornecedor?._id ||
          item?.fornecedor ||
          item
      )
    )
    .filter(Boolean)

  return [...new Set(ids)]
}

async function verificarFornecedorNaCotacao(
  cotacaoId,
  fornecedorId
) {
  const cotacao = await Cotacao.findById(cotacaoId).lean()

  if (!cotacao) {
    throw new Error("Cotação não encontrada.")
  }

  const ids = extrairIdsFornecedores(cotacao)

  /*
   * Caso a estrutura atual da cotação ainda não tenha
   * fornecedores salvos, permite temporariamente o acesso.
   */
  if (ids.length === 0) {
    return cotacao
  }

  const participante = ids.includes(
    String(fornecedorId)
  )

  if (!participante) {
    throw new Error(
      "Este fornecedor não participa desta cotação."
    )
  }

  return cotacao
}

export async function listarFornecedoresChat(
  req,
  res
) {
  try {
    if (usuarioEhFornecedor(req)) {
      const fornecedorId = obterFornecedorDoToken(req)

      const fornecedor = await Fornecedor.findById(
        fornecedorId
      ).select(
        "empresa razaoSocial nomeFantasia responsavel email cnpj"
      )

      return res.json(
        fornecedor ? [fornecedor] : []
      )
    }

    const cotacao = await Cotacao.findById(
      req.params.cotacaoId
    ).lean()

    if (!cotacao) {
      return res.status(404).json({
        erro: "Cotação não encontrada.",
      })
    }

    const ids = extrairIdsFornecedores(cotacao)

    if (ids.length > 0) {
      const fornecedores = await Fornecedor.find({
        _id: {
          $in: ids,
        },
      })
        .select(
          "empresa razaoSocial nomeFantasia responsavel email cnpj"
        )
        .sort({
          empresa: 1,
          razaoSocial: 1,
        })

      return res.json(fornecedores)
    }

    const acessos = await FornecedorAcesso.find()
      .populate(
        "fornecedor",
        "empresa razaoSocial nomeFantasia responsavel email cnpj"
      )
      .lean()

    const fornecedores = acessos
      .map((item) => item.fornecedor)
      .filter(Boolean)

    return res.json(fornecedores)
  } catch (error) {
    console.error(
      "Erro ao listar fornecedores do chat:",
      error
    )

    return res.status(500).json({
      erro:
        "Erro ao carregar fornecedores do chat.",
      detalhe: error.message,
    })
  }
}

export async function listarMensagens(req, res) {
  try {
    const tipoChat = obterTipoChat(req)

    const fornecedorId =
      await obterFornecedorPermitido(
        req,
        tipoChat
      )

    if (usuarioEhFornecedor(req)) {
      const fornecedorToken =
        obterFornecedorDoToken(req)

      await verificarFornecedorNaCotacao(
        req.params.cotacaoId,
        fornecedorToken
      )
    }

    const filtro = {
      cotacao: req.params.cotacaoId,
      tipoChat,
    }

    if (tipoChat === "privado") {
      filtro.fornecedor = fornecedorId
    } else {
      filtro.fornecedor = null
    }

    const mensagens =
      await CotacaoMensagem.find(filtro)
        .sort({
          createdAt: 1,
        })
        .lean()

    return res.json(mensagens)
  } catch (error) {
    return res.status(400).json({
      erro: error.message,
    })
  }
}

export async function enviarMensagem(req, res) {
  try {
    const tipoChat = obterTipoChat(req)

    const fornecedorId =
      await obterFornecedorPermitido(
        req,
        tipoChat
      )

    if (usuarioEhFornecedor(req)) {
      const fornecedorToken =
        obterFornecedorDoToken(req)

      await verificarFornecedorNaCotacao(
        req.params.cotacaoId,
        fornecedorToken
      )
    }

    const mensagem = String(
      req.body?.mensagem || ""
    ).trim()

    if (!mensagem && !req.file) {
      return res.status(400).json({
        erro:
          "Digite uma mensagem ou selecione um arquivo.",
      })
    }

    const remetenteTipo = usuarioEhFornecedor(req)
      ? "fornecedor"
      : "interno"

    const remetenteId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId

    if (!remetenteId) {
      return res.status(401).json({
        erro: "Usuário não identificado.",
      })
    }

    const registro =
      await CotacaoMensagem.create({
        cotacao: req.params.cotacaoId,
        fornecedor:
          tipoChat === "privado"
            ? fornecedorId
            : null,
        tipoChat,
        remetenteId,
        remetenteNome:
          req.user?.nome ||
          req.user?.name ||
          (remetenteTipo === "fornecedor"
            ? "Fornecedor"
            : "Setor de Compras"),
        remetenteTipo,
        mensagem,
        arquivoUrl: req.file
          ? `/uploads/chat/${req.file.filename}`
          : "",
        arquivoNome:
          req.file?.originalname || "",
        arquivoTipo:
          req.file?.mimetype || "",
        arquivoTamanho:
          req.file?.size || 0,
      })

    return res.status(201).json(registro)
  } catch (error) {
    if (req.file?.path) {
      await fs
        .unlink(req.file.path)
        .catch(() => {})
    }

    console.error(
      "Erro ao enviar mensagem:",
      error
    )

    return res.status(400).json({
      erro:
        error.message ||
        "Erro ao enviar mensagem.",
    })
  }
}