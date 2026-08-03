import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import secretariaRoutes from "./routes/secretariaRoutes.js";
import demandaRoutes from "./routes/demandaRoutes.js";
import fornecedorRoutes from "./routes/fornecedorRoutes.js";
import orcamentoRoutes from "./routes/orcamentoRoutes.js";

import cotacaoRoutes from "./routes/cotacaoRoutes.js";
import cotacaoChatRoutes from "./routes/cotacaoChatRoutes.js";
import propostaRoutes from "./routes/propostaRoutes.js";
import arquivoRoutes from "./routes/arquivoRoutes.js";
import sinapiRoutes from "./routes/sinapiRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";
import fornecedorAuthRoutes from "./routes/fornecedorAuthRoutes.js";
import empenhoRoutes from "./routes/empenhoRoutes.js";
import fornecedorPortalRoutes from "./routes/fornecedorPortalRoutes.js";
import chatResultadoRoutes from "./routes/chatResultadoRoutes.js";

import { verificarConexaoEmail } from "./services/emailService.js";
import { finalizarCotacoesExpiradas } from "./services/cotacaoService.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

// ======================
// CORS
// ======================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://constru-o-pi.vercel.app",
  process.env.FRONT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Postman, Insomnia e chamadas internas
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Origem bloqueada pelo CORS:", origin);

      return callback(
        new Error("Origem não permitida pelo CORS")
      );
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message:
    "Muitas requisições. Tente novamente mais tarde.",
});

app.use(limiter);

app.use(
  "/uploads",
  express.static(path.resolve("uploads"))
);

app.get("/", (req, res) => {
  return res.json({
    mensagem:
      "API do Sistema de Compras funcionando.",
  });
});

// ======================
// ROTAS
// ======================

app.use("/api/auth", authRoutes);

app.use("/api/secretarias", secretariaRoutes);

app.use("/api/demandas", demandaRoutes);

app.use("/api/fornecedores", fornecedorRoutes);

app.use("/api/orcamentos", orcamentoRoutes);

app.use("/api/cotacoes", cotacaoRoutes);

app.use("/api/cotacoes", cotacaoChatRoutes);

app.use("/api/propostas", propostaRoutes);

app.use("/api/arquivos", arquivoRoutes);

app.use("/api/sinapi", sinapiRoutes);

app.use("/api/admin", adminRoutes);

app.use(
  "/api/fornecedor-auth",
  fornecedorAuthRoutes
);

app.use("/api/empenhos", empenhoRoutes);

app.use(
  "/api/fornecedor",
  fornecedorPortalRoutes
);

app.use("/api/chats", chatResultadoRoutes);

// ======================
// 404
// ======================

app.use((req, res) => {
  return res.status(404).json({
    erro: "Rota não encontrada.",
    metodo: req.method,
    rota: req.originalUrl,
  });
});

// ======================
// ERROS
// ======================

app.use((error, req, res, next) => {
  console.error("Erro não tratado:", error);

  return res.status(error.status || 500).json({
    erro:
      error.message ||
      "Erro interno do servidor.",
  });
});

// ======================
// MONGODB
// ======================

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB conectado");

    try {
      await verificarConexaoEmail();
    } catch (error) {
      console.error(
        "Erro na conexão SMTP:",
        error.message
      );
    }

    try {
      const total =
        await finalizarCotacoesExpiradas();

      if (total > 0) {
        console.log(
          `${total} cotação(ões) expirada(s) finalizada(s).`
        );
      }
    } catch (error) {
      console.error(
        "Erro ao finalizar cotações:",
        error.message
      );
    }

    setInterval(async () => {
      try {
        const total =
          await finalizarCotacoesExpiradas();

        if (total > 0) {
          console.log(
            `${total} cotação(ões) expirada(s) finalizada(s).`
          );
        }
      } catch (error) {
        console.error(
          "Erro na verificação automática:",
          error.message
        );
      }
    }, 60000);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Servidor rodando na porta ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "Erro ao conectar no MongoDB:",
      error
    );
  });