import jwt from "jsonwebtoken"

export function fornecedorAuthMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization || ""
    const token = authorization.replace(/^Bearer\s+/i, "").trim()

    if (!token) {
      return res.status(401).json({ erro: "Token do fornecedor não informado." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.tipo !== "Fornecedor") {
      return res.status(403).json({ erro: "Acesso exclusivo para fornecedor." })
    }

    req.fornecedorAuth = decoded
    next()
  } catch {
    return res.status(401).json({ erro: "Token do fornecedor inválido." })
  }
}
