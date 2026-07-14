import { Router } from "express"

import { authMiddleware } from "../middlewares/authMiddleware.js"

import {
  listarPropostas,
  julgarProposta,
  excluirProposta,
} from "../controllers/propostaController.js"

const router = Router()

router.use(authMiddleware)

router.get("/", listarPropostas)
router.patch("/:id/julgamento", julgarProposta)
router.delete("/:id", excluirProposta)

export default router
