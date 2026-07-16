import { Router } from "express"
import { fornecedorAuthMiddleware } from "../middlewares/fornecedorAuthMiddleware.js"
import {
  listarEmpenhosFornecedor,
  listarResultadosFornecedor,
} from "../controllers/empenhoController.js"

const router = Router()
router.use(fornecedorAuthMiddleware)
router.get("/empenhos", listarEmpenhosFornecedor)
router.get("/resultados", listarResultadosFornecedor)
export default router
