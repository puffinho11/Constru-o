import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Fornecedor from "../models/Fornecedor.js"
import FornecedorAcesso from "../models/FornecedorAcesso.js"

export async function listarUsuarios(req, res) {
  const usuarios = await User.find().select("-senha").sort({ createdAt: -1 })
  return res.json(usuarios)
}

export async function criarUsuario(req, res) {
  try {
    const { nome, email, senha, perfil } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." })
    }

    const existente = await User.findOne({ email: email.toLowerCase() })

    if (existente) {
      return res.status(409).json({ erro: "E-mail já cadastrado." })
    }

    const senhaHash = await bcrypt.hash(senha, 12)

    const usuario = await User.create({
      nome,
      email,
      senha: senhaHash,
      perfil,
    })

    const objeto = usuario.toObject()
    delete objeto.senha

    return res.status(201).json(objeto)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao criar usuário.", detalhe: error.message })
  }
}

export async function excluirUsuario(req, res) {
  if (String(req.user?.id || req.user?._id) === String(req.params.id)) {
    return res.status(400).json({ erro: "Você não pode excluir o próprio usuário." })
  }

  await User.findByIdAndDelete(req.params.id)
  return res.json({ mensagem: "Usuário excluído." })
}

export async function listarAcessosFornecedores(req, res) {
  const acessos = await FornecedorAcesso.find()
    .select("-senha")
    .populate("fornecedor", "empresa razaoSocial email cnpj")
    .sort({ createdAt: -1 })

  return res.json(acessos)
}

export async function criarAcessoFornecedor(req, res) {
  try {
    const { fornecedorId, email, senha } = req.body

    const fornecedor = await Fornecedor.findById(fornecedorId)

    if (!fornecedor) {
      return res.status(404).json({ erro: "Fornecedor não encontrado." })
    }

    const duplicado = await FornecedorAcesso.findOne({
      $or: [{ fornecedor: fornecedorId }, { email: email.toLowerCase() }],
    })

    if (duplicado) {
      return res.status(409).json({ erro: "Este fornecedor ou e-mail já possui acesso." })
    }

    const senhaHash = await bcrypt.hash(senha, 12)

    const acesso = await FornecedorAcesso.create({
      fornecedor: fornecedorId,
      email,
      senha: senhaHash,
    })

    return res.status(201).json({
      _id: acesso._id,
      fornecedor: fornecedorId,
      email: acesso.email,
    })
  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao criar acesso do fornecedor.",
      detalhe: error.message,
    })
  }
}

export async function excluirAcessoFornecedor(req, res) {
  await FornecedorAcesso.findByIdAndDelete(req.params.id)
  return res.json({ mensagem: "Acesso do fornecedor excluído." })
}
