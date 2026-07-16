import User from "../models/User.js"

export async function adminMiddleware(req, res, next) {
  try {
    const usuarioId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId

    if (!usuarioId) {
      return res.status(401).json({
        erro: "Usuário não identificado no token.",
      })
    }

    const usuario = await User.findById(usuarioId).select(
      "nome email perfil role ativo"
    )

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário não encontrado.",
      })
    }

    if (usuario.ativo === false) {
      return res.status(403).json({
        erro: "Usuário desativado.",
      })
    }

    const perfil = String(
      usuario.perfil ||
      usuario.role ||
      req.user?.perfil ||
      req.user?.role ||
      ""
    )
      .trim()
      .toLowerCase()

    const administrador =
      perfil === "administrador" ||
      perfil === "admin" ||
      perfil === "administrator"

    if (!administrador) {
      console.error("Acesso administrativo recusado:", {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        role: usuario.role,
      })

      return res.status(403).json({
        erro: "Acesso permitido somente para administradores.",
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          role: usuario.role,
        },
      })
    }

    req.user = {
      ...req.user,
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil || "Administrador",
      role: usuario.role || "admin",
    }

    return next()
  } catch (error) {
    console.error("Erro ao verificar administrador:", error)

    return res.status(500).json({
      erro: "Erro ao verificar permissão administrativa.",
      detalhe: error.message,
    })
  }
}