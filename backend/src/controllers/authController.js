import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import User from "../models/User.js"
import FornecedorAcesso from "../models/FornecedorAcesso.js"

export const register = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      password,
      perfil,
      role,
    } = req.body

    const emailFormatado = String(email || "")
      .trim()
      .toLowerCase()

    const senhaInformada = senha || password

    if (!nome || !emailFormatado || !senhaInformada) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios.",
      })
    }

    const userExists = await User.findOne({
      email: emailFormatado,
    })

    if (userExists) {
      return res.status(400).json({
        message: "Usuário já existe.",
      })
    }

    const hashedPassword = await bcrypt.hash(
      senhaInformada,
      10
    )

    const perfilFinal =
      perfil ||
      (role === "admin"
        ? "Administrador"
        : role) ||
      "Operador"

    const roleFinal =
      role ||
      (perfilFinal === "Administrador"
        ? "admin"
        : "user")

    const usuario = await User.create({
      nome,
      email: emailFormatado,
      senha: hashedPassword,
      password: hashedPassword,
      perfil: perfilFinal,
      role: roleFinal,
      ativo: true,
    })

    return res.status(201).json({
      message: "Usuário criado com sucesso.",
      user: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        role: usuario.role,
        tipo: "usuario",
      },
    })
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error)

    return res.status(500).json({
      message: "Erro no servidor.",
      detalhe: error.message,
    })
  }
}

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
      senha,
    } = req.body

    const emailFormatado = String(email || "")
      .trim()
      .toLowerCase()

    const senhaInformada = password || senha

    if (!emailFormatado || !senhaInformada) {
      return res.status(400).json({
        message: "Informe o e-mail e a senha.",
      })
    }

    /*
     * 1. Procura primeiro entre os usuários internos.
     */
    const usuario = await User.findOne({
      email: emailFormatado,
    })

    if (usuario) {
      if (usuario.ativo === false) {
        return res.status(403).json({
          message: "Usuário desativado.",
        })
      }

      const senhaSalva =
        usuario.senha ||
        usuario.password

      if (!senhaSalva) {
        return res.status(400).json({
          message:
            "Este usuário não possui uma senha válida cadastrada.",
        })
      }

      const passwordMatch = await bcrypt.compare(
        senhaInformada,
        senhaSalva
      )

      if (!passwordMatch) {
        return res.status(400).json({
          message: "Senha inválida.",
        })
      }

      const perfilUsuario =
        usuario.perfil ||
        (usuario.role === "admin"
          ? "Administrador"
          : "Operador")

      const roleUsuario =
        usuario.role ||
        (perfilUsuario === "Administrador"
          ? "admin"
          : "user")

      const token = jwt.sign(
        {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: perfilUsuario,
          role: roleUsuario,
          tipo: "usuario",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      )

      if (!usuario.senha && usuario.password) {
        usuario.senha = usuario.password
      }

      if (!usuario.perfil) {
        usuario.perfil = perfilUsuario
      }

      if (!usuario.role) {
        usuario.role = roleUsuario
      }

      await usuario.save()

      return res.json({
        token,
        user: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: perfilUsuario,
          role: roleUsuario,
          tipo: "usuario",
        },
      })
    }

    /*
     * 2. Se não encontrou usuário interno,
     * procura nos acessos dos fornecedores.
     */
    const acessoFornecedor =
      await FornecedorAcesso.findOne({
        email: emailFormatado,
      }).populate(
        "fornecedor",
        "empresa razaoSocial nomeFantasia nome email cnpj ativo"
      )

    if (!acessoFornecedor) {
      return res.status(400).json({
        message: "Usuário não encontrado.",
      })
    }

    if (acessoFornecedor.ativo === false) {
      return res.status(403).json({
        message: "Acesso do fornecedor desativado.",
      })
    }

    const senhaFornecedor =
      acessoFornecedor.senha ||
      acessoFornecedor.password

    if (!senhaFornecedor) {
      return res.status(400).json({
        message:
          "Este acesso de fornecedor não possui uma senha válida.",
      })
    }

    const senhaFornecedorCorreta =
      await bcrypt.compare(
        senhaInformada,
        senhaFornecedor
      )

    if (!senhaFornecedorCorreta) {
      return res.status(400).json({
        message: "Senha inválida.",
      })
    }

    const fornecedor = acessoFornecedor.fornecedor

    if (!fornecedor) {
      return res.status(400).json({
        message: "Fornecedor vinculado não encontrado.",
      })
    }

    if (fornecedor.ativo === false) {
      return res.status(403).json({
        message: "Fornecedor desativado.",
      })
    }

    const nomeFornecedor =
      fornecedor.empresa ||
      fornecedor.razaoSocial ||
      fornecedor.nomeFantasia ||
      fornecedor.nome ||
      "Fornecedor"

    const token = jwt.sign(
      {
        id: acessoFornecedor._id,
        fornecedorId: fornecedor._id,
        nome: nomeFornecedor,
        email: acessoFornecedor.email,
        perfil: "Fornecedor",
        role: "fornecedor",
        tipo: "fornecedor",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )

    return res.json({
      token,
      user: {
        id: acessoFornecedor._id,
        fornecedorId: fornecedor._id,
        nome: nomeFornecedor,
        email: acessoFornecedor.email,
        perfil: "Fornecedor",
        role: "fornecedor",
        tipo: "fornecedor",
      },
    })
  } catch (error) {
    console.error("Erro ao realizar login:", error)

    return res.status(500).json({
      message: "Erro no servidor.",
      detalhe: error.message,
    })
  }
}