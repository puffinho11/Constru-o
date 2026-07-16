import { Router } from "express"
import { loginFornecedor } from "../controllers/fornecedorAuthController.js"

const router = Router()
router.post("/login", loginFornecedor)
export default router
