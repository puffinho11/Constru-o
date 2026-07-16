import { Router } from "express"

import {
  authMiddleware,
} from "../middlewares/authMiddleware.js"

import {
  adminMiddleware,
} from "../middlewares/adminMiddleware.js"

import {
  listarUsuarios,
  criarUsuario,
  excluirUsuario,
  listarAcessosFornecedores,
  criarAcessoFornecedor,
  excluirAcessoFornecedor,
} from "../controllers/adminController.js"

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/usuarios", listarUsuarios)
router.post("/usuarios", criarUsuario)
router.delete("/usuarios/:id", excluirUsuario)

router.get(
  "/fornecedores-acesso",
  listarAcessosFornecedores
)

router.post(
  "/fornecedores-acesso",
  criarAcessoFornecedor
)

router.delete(
  "/fornecedores-acesso/:id",
  excluirAcessoFornecedor
)

export default router