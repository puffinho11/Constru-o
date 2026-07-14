import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"

import {
  listarSolicitacoes,
  buscarSolicitacaoPorId,
  criarSolicitacao,
  atualizarSolicitacao,
  excluirSolicitacao,
} from "../controllers/solicitacaoController.js"

const router = Router()

router.use(authMiddleware)

router.get("/", listarSolicitacoes)
router.get("/:id", buscarSolicitacaoPorId)
router.post("/", criarSolicitacao)
router.put("/:id", atualizarSolicitacao)
router.delete("/:id", excluirSolicitacao)

export default router
