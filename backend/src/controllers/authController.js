import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

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

    const usuario = await User.create({
      nome,
      email: emailFormatado,
      senha: hashedPassword,
      password: hashedPassword,
      perfil:
        perfil ||
        (role === "admin"
          ? "Administrador"
          : role) ||
        "Operador",
      role:
        role ||
        (perfil === "Administrador"
          ? "admin"
          : "user"),
      ativo: true,
    })

    return res.status(201).json({
      message: "Usuário criado com sucesso.",
      user: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
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

    const usuario = await User.findOne({
      email: emailFormatado,
    })

    if (!usuario) {
      return res.status(400).json({
        message: "Usuário não encontrado.",
      })
    }

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

    const token = jwt.sign(
      {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: perfilUsuario,
        role: usuario.role,
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

    await usuario.save()

    return res.json({
      token,
      user: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: perfilUsuario,
        role: usuario.role,
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