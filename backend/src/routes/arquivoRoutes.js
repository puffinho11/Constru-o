import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"

import {
  listarArquivos,
  buscarArquivoPorId,
  criarArquivo,
  atualizarArquivo,
  excluirArquivo,
} from "../controllers/arquivoController.js"

const router = Router()

router.use(authMiddleware)

router.get("/", listarArquivos)
router.get("/:id", buscarArquivoPorId)
router.post("/", criarArquivo)
router.put("/:id", atualizarArquivo)
router.delete("/:id", excluirArquivo)

export default router
