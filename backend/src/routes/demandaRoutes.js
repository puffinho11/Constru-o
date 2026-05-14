import express from "express"

import {
  criarDemanda,
  listarDemandas,
  buscarDemanda,
  atualizarDemanda,
  excluirDemanda,
} from "../controllers/demandaController.js"

import { authMiddleware } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.use(authMiddleware)

router.post("/", criarDemanda)
router.get("/", listarDemandas)
router.get("/:id", buscarDemanda)
router.put("/:id", atualizarDemanda)
router.delete("/:id", excluirDemanda)

export default router