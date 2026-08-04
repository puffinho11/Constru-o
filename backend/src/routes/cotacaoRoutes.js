import express from "express"

import {
  listarCotacoes,
  buscarCotacao,
  criarCotacao,
  encerrarCotacao,
  cancelarCotacao,
  excluirCotacao,
  acessarCotacaoPublica,
} from "../controllers/cotacaoController.js"

import {
  enviarPropostaPublica,
} from "../controllers/propostaController.js"

import {
  authMiddleware,
} from "../middlewares/authMiddleware.js"

const router = express.Router()

// ==========================
// ROTAS PÚBLICAS
// ==========================

router.get(
  "/publica/:token",
  acessarCotacaoPublica
)

router.post(
  "/publica/:token/proposta",
  enviarPropostaPublica
)

// ==========================
// ROTAS ADMINISTRATIVAS
// ==========================

router.use(authMiddleware)

router.get(
  "/",
  listarCotacoes
)

router.get(
  "/:id",
  buscarCotacao
)

router.post(
  "/",
  criarCotacao
)

router.post(
  "/:id/encerrar",
  encerrarCotacao
)

router.patch(
  "/:id/cancelar",
  cancelarCotacao
)

router.delete(
  "/:id",
  excluirCotacao
)

export default router