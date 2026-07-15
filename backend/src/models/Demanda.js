import mongoose from "mongoose"

const materialSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
    },
    quantidade: {
      type: Number,
      required: true,
      min: 0,
    },
    unidade: {
      type: String,
      required: true,
      trim: true,
    },
    observacao: {
      type: String,
      default: "",
      trim: true,
    },
    codigoSinapi: {
      type: String,
      default: "",
      trim: true,
    },
    tipoSinapi: {
      type: String,
      enum: ["", "INSUMO", "COMPOSICAO"],
      default: "",
    },
    valorSinapi: {
      type: Number,
      default: 0,
      min: 0,
    },
    referenciaSinapi: {
      type: String,
      default: "",
      trim: true,
    },
    fonteSinapi: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
)

const demandaSchema = new mongoose.Schema(
  {
    secretaria: {
      type: String,
      required: true,
      trim: true,
    },
    responsavel: {
      type: String,
      required: true,
      trim: true,
    },
    numeroDemanda: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    prioridade: {
      type: String,
      enum: ["Normal", "Urgente", "Emergencial"],
      default: "Normal",
    },
    objeto: {
      type: String,
      required: true,
      trim: true,
    },
    justificativa: {
      type: String,
      default: "",
      trim: true,
    },
    materiais: {
      type: [materialSchema],
      default: [],
    },
    status: {
      type: String,
      default: "Em andamento",
      trim: true,
    },
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("Demanda", demandaSchema)
