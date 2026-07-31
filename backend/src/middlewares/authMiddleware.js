import jwt from "jsonwebtoken"

export function authMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization || ""

    if (!authorization) {
      return res.status(401).json({
        erro: "Token não informado.",
      })
    }

    const partes = authorization.trim().split(/\s+/)

    if (
      partes.length !== 2 ||
      partes[0].toLowerCase() !== "bearer" ||
      !partes[1]
    ) {
      return res.status(401).json({
        erro: "Formato do token inválido.",
      })
    }

    const token = partes[1]

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.user = {
      ...decoded,

      id:
        decoded.id ||
        decoded._id ||
        decoded.userId,

      nome:
        decoded.nome ||
        decoded.name ||
        "Usuário",

      perfil:
        decoded.perfil ||
        (decoded.role === "admin"
          ? "Administrador"
          : decoded.role),

      role:
        decoded.role ||
        (decoded.perfil === "Administrador"
          ? "admin"
          : "user"),
    }

    return next()
  } catch (error) {
    console.error(
      "Erro na autenticação:",
      error.message
    )

    return res.status(401).json({
      erro: "Token inválido ou expirado.",
    })
  }
}

export default authMiddleware