import User from "../models/User.js"

function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function verificarAdministrador(...valores) {
  const permissoesAdministrativas = [
    "admin",
    "administrador",
    "administrator",
  ]

  return valores.some((valor) =>
    permissoesAdministrativas.includes(normalizar(valor))
  )
}

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

    const administrador = verificarAdministrador(
      usuario.perfil,
      usuario.role,
      req.user?.perfil,
      req.user?.role
    )

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
      })
    }

    req.user = {
      ...req.user,
      id: usuario._id,
      _id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      role: usuario.role,
    }

    return next()
  } catch (error) {
    console.error(
      "Erro ao verificar administrador:",
      error
    )

    return res.status(500).json({
      erro: "Erro ao verificar permissão administrativa.",
      detalhe: error.message,
    })
  }
}

export default adminMiddleware