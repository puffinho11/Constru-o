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

// ======================
// LEITURA DAS REQUISIÇÕES
// ======================

app.use(
  express.json({
    limit: "10mb",
  })
);

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

function isVercelPreview(origin = "") {
  return /^https:\/\/constru-[a-z0-9-]+-puffinho11s-projects\.vercel\.app$/i.test(
    origin
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Permite Postman, Insomnia, Render e chamadas internas.
      if (!origin) {
        return callback(null, true);
      }

      const origemPermitida =
        allowedOrigins.includes(origin) ||
        isVercelPreview(origin);

      if (origemPermitida) {
        return callback(null, true);
      }

      console.error(
        "Origem bloqueada pelo CORS:",
        origin
      );

      return callback(
        new Error("Origem não permitida pelo CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],

    exposedHeaders: [
      "Content-Disposition",
    ],

    optionsSuccessStatus: 204,
  })
);

// Não use app.options("*", cors()).
// Na versão atual do Express isso causa:
// Missing parameter name at index 1: *

// ======================
// SEGURANÇA E LOGS
// ======================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    erro:
      "Muitas requisições. Tente novamente mais tarde.",
  },
});

app.use(limiter);

// ======================
// ARQUIVOS ESTÁTICOS
// ======================

app.use(
  "/uploads",
  express.static(path.resolve("uploads"), {
    setHeaders(res) {
      res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
      );
    },
  })
);

// ======================
// ROTA PRINCIPAL
// ======================

app.get("/", (req, res) => {
  return res.status(200).json({
    mensagem:
      "API do Sistema de Compras funcionando.",
    status: "online",
  });
});

// ======================
// ROTAS DA API
// ======================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/secretarias",
  secretariaRoutes
);

app.use(
  "/api/demandas",
  demandaRoutes
);

app.use(
  "/api/fornecedores",
  fornecedorRoutes
);

app.use(
  "/api/orcamentos",
  orcamentoRoutes
);

app.use(
  "/api/cotacoes",
  cotacaoRoutes
);

app.use(
  "/api/cotacoes",
  cotacaoChatRoutes
);

app.use(
  "/api/propostas",
  propostaRoutes
);

app.use(
  "/api/arquivos",
  arquivoRoutes
);

app.use(
  "/api/sinapi",
  sinapiRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/fornecedor-auth",
  fornecedorAuthRoutes
);

app.use(
  "/api/empenhos",
  empenhoRoutes
);

app.use(
  "/api/fornecedor",
  fornecedorPortalRoutes
);

app.use(
  "/api/chats",
  chatResultadoRoutes
);

// ======================
// ROTA NÃO ENCONTRADA
// ======================

app.use((req, res) => {
  return res.status(404).json({
    erro: "Rota não encontrada.",
    metodo: req.method,
    rota: req.originalUrl,
  });
});

// ======================
// TRATAMENTO DE ERROS
// ======================

app.use((error, req, res, next) => {
  console.error(
    "Erro não tratado:",
    error
  );

  if (
    error.message ===
    "Origem não permitida pelo CORS"
  ) {
    return res.status(403).json({
      erro:
        "Origem não autorizada para acessar a API.",
    });
  }

  return res
    .status(error.status || 500)
    .json({
      erro:
        error.message ||
        "Erro interno do servidor.",
    });
});

// ======================
// COTAÇÕES EXPIRADAS
// ======================

async function verificarCotacoesExpiradas() {
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
      "Erro na verificação automática das cotações:",
      error.message
    );
  }
}

// ======================
// INICIALIZAÇÃO
// ======================

async function iniciarServidor() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "A variável MONGO_URI não foi configurada."
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB conectado");

    try {
      await verificarConexaoEmail();
    } catch (error) {
      console.error(
        "Erro ao verificar serviço de e-mail:",
        error.message
      );
    }

    await verificarCotacoesExpiradas();

    setInterval(
      verificarCotacoesExpiradas,
      60 * 1000
    );

    const PORT =
      Number(process.env.PORT) || 5000;

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Servidor rodando na porta ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Erro ao iniciar o servidor:",
      error
    );

    process.exit(1);
  }
}

iniciarServidor();