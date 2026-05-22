import express from "express"

import {
  criarFornecedor,
  listarFornecedores,
  atualizarFornecedor,
  excluirFornecedor,
} from "../controllers/fornecedorController.js"

import { authMiddleware } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.use(authMiddleware)

router.post("/", criarFornecedor)

router.get("/", listarFornecedores)

router.put("/:id", atualizarFornecedor)

router.delete("/:id", excluirFornecedor)

export default router