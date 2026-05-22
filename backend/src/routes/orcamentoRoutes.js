import express from "express"

import {
  criarOrcamento,
  listarOrcamentos,
  buscarOrcamentoPorDemanda,
  atualizarOrcamento,
  excluirOrcamento,
} from "../controllers/orcamentoController.js"

import { authMiddleware } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.use(authMiddleware)

router.post("/", criarOrcamento)

router.get("/", listarOrcamentos)

router.get("/demanda/:demandaId", buscarOrcamentoPorDemanda)

router.put("/:id", atualizarOrcamento)

router.delete("/:id", excluirOrcamento)

export default router