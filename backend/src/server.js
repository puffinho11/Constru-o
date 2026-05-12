import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Muitas requisições. Tente novamente mais tarde.",
});

app.use(limiter);

app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");

    app.listen(process.env.PORT, () => {
      console.log(`Servidor rodando na porta ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });