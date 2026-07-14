import { Router } from "express"

import { authMiddleware } from "../middlewares/authMiddleware.js"

import {
  listarCotacoes,
  buscarCotacaoPorId,
  criarCotacao,
  reenviarEmailsCotacao,
  encerrarCotacao,
  cancelarCotacao,
  acessarCotacaoPublica,
} from "../controllers/cotacaoController.js"

import {
  enviarPropostaPublica,
} from "../controllers/propostaController.js"

const router = Router()

// Rotas públicas: não exigem login administrativo.
router.get("/publica/:token", acessarCotacaoPublica)
router.post("/publica/:token/proposta", enviarPropostaPublica)

// Rotas administrativas.
router.use(authMiddleware)

router.get("/", listarCotacoes)
router.get("/:id", buscarCotacaoPorId)
router.post("/", criarCotacao)
router.post("/:id/reenviar", reenviarEmailsCotacao)
router.post("/:id/encerrar", encerrarCotacao)
router.patch("/:id/cancelar", cancelarCotacao)

export default router
