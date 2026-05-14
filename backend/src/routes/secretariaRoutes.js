import express from "express";
import {
  criarSecretaria,
  listarSecretarias,
  buscarSecretariaPorId,
  atualizarSecretaria,
  deletarSecretaria,
} from "../controllers/secretariaController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", criarSecretaria);
router.get("/", listarSecretarias);
router.get("/:id", buscarSecretariaPorId);
router.put("/:id", atualizarSecretaria);
router.delete("/:id", deletarSecretaria);

export default router;