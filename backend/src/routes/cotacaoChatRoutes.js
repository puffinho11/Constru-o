import fs from "fs"
import path from "path"
import { Router } from "express"
import multer from "multer"

import {
  authMiddleware,
} from "../middlewares/authMiddleware.js"

import {
  enviarMensagem,
  listarFornecedoresChat,
  listarMensagens,
} from "../controllers/cotacaoChatController.js"

const router = Router()

const pastaUploads = path.resolve("uploads/chat")

fs.mkdirSync(pastaUploads, {
  recursive: true,
})

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, pastaUploads)
  },

  filename: (req, file, callback) => {
    const nomeSeguro = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")

    const nomeFinal = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${nomeSeguro}`

    callback(null, nomeFinal)
  },
})

const tiposPermitidos = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
])

const upload = multer({
  storage,

  limits: {
    fileSize: 15 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    if (!tiposPermitidos.has(file.mimetype)) {
      return callback(
        new Error(
          "Formato não permitido. Envie PDF, DOC, DOCX, XLS, XLSX, PNG, JPG ou ZIP."
        )
      )
    }

    callback(null, true)
  },
})

router.use(authMiddleware)

router.get(
  "/:cotacaoId/chat/fornecedores",
  listarFornecedoresChat
)

router.get(
  "/:cotacaoId/chat",
  listarMensagens
)

router.post(
  "/:cotacaoId/chat",
  upload.single("arquivo"),
  enviarMensagem
)

export default router