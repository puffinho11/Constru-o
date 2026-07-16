import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import {
  listarEmpenhos,
  criarEmpenho,
  excluirEmpenho,
} from "../controllers/empenhoController.js"

const router = Router()
router.use(authMiddleware)
router.get("/", listarEmpenhos)
router.post("/", criarEmpenho)
router.delete("/:id", excluirEmpenho)
export default router
