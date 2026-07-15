import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import {
  pesquisarSinapi,
  buscarSinapiPorCodigo,
  resumoSinapi,
} from "../controllers/sinapiController.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/", pesquisarSinapi)
router.get("/resumo", resumoSinapi)
router.get("/:codigo", buscarSinapiPorCodigo)

export default router
