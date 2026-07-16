import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import morgan from "morgan"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/authRoutes.js"
import secretariaRoutes from "./routes/secretariaRoutes.js"
import demandaRoutes from "./routes/demandaRoutes.js"
import fornecedorRoutes from "./routes/fornecedorRoutes.js"
import orcamentoRoutes from "./routes/orcamentoRoutes.js"

import cotacaoRoutes from "./routes/cotacaoRoutes.js"
import propostaRoutes from "./routes/propostaRoutes.js"
import arquivoRoutes from "./routes/arquivoRoutes.js"
import sinapiRoutes from "./routes/sinapiRoutes.js"

import adminRoutes from "./routes/adminRoutes.js"
import fornecedorAuthRoutes from "./routes/fornecedorAuthRoutes.js"
import empenhoRoutes from "./routes/empenhoRoutes.js"
import fornecedorPortalRoutes from "./routes/fornecedorPortalRoutes.js"
import chatResultadoRoutes from "./routes/chatResultadoRoutes.js"

import { verificarConexaoEmail } from "./services/emailService.js"
import { finalizarCotacoesExpiradas } from "./services/cotacaoService.js"

dotenv.config()

const app = express()

app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())

app.use(
  cors({
    origin: process.env.FRONT_URL || "http://localhost:5173",
    credentials: true,
  })
)

app.use(helmet())
app.use(morgan("dev"))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Muitas requisições. Tente novamente mais tarde.",
})

app.use(limiter)

app.get("/", (req, res) => {
  res.json({
    mensagem: "API do Sistema de Compras funcionando.",
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/secretarias", secretariaRoutes)
app.use("/api/demandas", demandaRoutes)
app.use("/api/fornecedores", fornecedorRoutes)
app.use("/api/orcamentos", orcamentoRoutes)

app.use("/api/cotacoes", cotacaoRoutes)
app.use("/api/propostas", propostaRoutes)
app.use("/api/arquivos", arquivoRoutes)
app.use("/api/sinapi", sinapiRoutes)

app.use("/api/admin", adminRoutes)
app.use("/api/fornecedor-auth", fornecedorAuthRoutes)
app.use("/api/empenhos", empenhoRoutes)
app.use("/api/fornecedor", fornecedorPortalRoutes)
app.use("/api/chats", chatResultadoRoutes)

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB conectado")

    try {
      await verificarConexaoEmail()
    } catch (error) {
      console.error("Erro ao verificar servidor de e-mail:", error.message)
    }

    try {
      const total = await finalizarCotacoesExpiradas()

      if (total > 0) {
        console.log(`${total} cotação(ões) expirada(s) finalizada(s).`)
      }
    } catch (error) {
      console.error(
        "Erro ao finalizar cotações expiradas:",
        error.message
      )
    }

    setInterval(async () => {
      try {
        const total = await finalizarCotacoesExpiradas()

        if (total > 0) {
          console.log(`${total} cotação(ões) expirada(s) finalizada(s).`)
        }
      } catch (error) {
        console.error(
          "Erro na verificação automática das cotações:",
          error.message
        )
      }
    }, 60 * 1000)

    const port = process.env.PORT || 5000

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`)
    })
  })
  .catch((error) => {
    console.error("Erro ao conectar no MongoDB:", error)
  })