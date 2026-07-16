import Cotacao from "../models/Cotacao.js"
import ChatResultado from "../models/ChatResultado.js"

async function resolverAcesso(req, cotacaoId) {
  const cotacao = await Cotacao.findById(cotacaoId).populate({
    path: "propostaVencedora",
    select: "fornecedor",
  })

  if (!cotacao || !cotacao.propostaVencedora) {
    return { erro: "Resultado ainda não possui fornecedor vencedor." }
  }

  const fornecedorId = String(cotacao.propostaVencedora.fornecedor)

  if (req.fornecedorAuth) {
    if (fornecedorId !== String(req.fornecedorAuth.fornecedorId)) {
      return { erro: "Este chat pertence a outro fornecedor." }
    }

    return {
      cotacao,
      fornecedorId,
      autorTipo: "Fornecedor",
      autorId: req.fornecedorAuth.fornecedorId,
      autorNome: req.fornecedorAuth.nome,
    }
  }

  return {
    cotacao,
    fornecedorId,
    autorTipo: "Administrador",
    autorId: req.user?.id || req.user?._id,
    autorNome: req.user?.nome || "Prefeitura",
  }
}

export async function listarMensagens(req, res) {
  const acesso = await resolverAcesso(req, req.params.cotacaoId)

  if (acesso.erro) {
    return res.status(403).json({ erro: acesso.erro })
  }

  const mensagens = await ChatResultado.find({
    cotacao: req.params.cotacaoId,
    fornecedor: acesso.fornecedorId,
  }).sort({ createdAt: 1 })

  return res.json(mensagens)
}

export async function enviarMensagem(req, res) {
  const acesso = await resolverAcesso(req, req.params.cotacaoId)

  if (acesso.erro) {
    return res.status(403).json({ erro: acesso.erro })
  }

  const mensagem = String(req.body.mensagem || "").trim()

  if (!mensagem) {
    return res.status(400).json({ erro: "Digite uma mensagem." })
  }

  const registro = await ChatResultado.create({
    cotacao: req.params.cotacaoId,
    fornecedor: acesso.fornecedorId,
    autorTipo: acesso.autorTipo,
    autorId: acesso.autorId,
    autorNome: acesso.autorNome,
    mensagem,
  })

  return res.status(201).json(registro)
}
