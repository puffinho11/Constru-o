import { Router } from "express"
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { fornecedorAuthMiddleware } from "../middlewares/fornecedorAuthMiddleware.js"
import {
  listarMensagens,
  enviarMensagem,
} from "../controllers/chatResultadoController.js"

const router = Router()

function authMisto(req, res, next) {
  const authorization = req.headers.authorization || ""
  const token = authorization.replace(/^Bearer\s+/i, "").trim()

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.tipo === "Fornecedor") {
      return fornecedorAuthMiddleware(req, res, next)
    }

    return authMiddleware(req, res, next)
  } catch {
    return res.status(401).json({ erro: "Token inválido." })
  }
}

router.use(authMisto)
router.get("/:cotacaoId", listarMensagens)
router.post("/:cotacaoId", enviarMensagem)

export default router
