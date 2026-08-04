import mongoose from "mongoose"

const participanteSchema = new mongoose.Schema(
  {
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      default: null,
    },

    token: {
      type: String,
      default: "",
      index: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    emailEnviado: {
      type: Boolean,
      default: false,
    },

    erroEmail: {
      type: String,
      default: "",
    },

    enviadoEm: {
      type: Date,
      default: null,
    },

    visualizadoEm: {
      type: Date,
      default: null,
    },

    respondidoEm: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  }
)

const cotacaoSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    demanda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Demanda",
      required: true,
    },

    tokenPublico: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    participantes: {
      type: [participanteSchema],
      default: [],
    },

    prazoHoras: {
      type: Number,
      required: true,
      min: 1,
      max: 720,
    },

    inicioEm: {
      type: Date,
      required: true,
    },

    encerraEm: {
      type: Date,
      required: true,
      index: true,
    },

    observacao: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Rascunho",
        "Aberta",
        "Encerrada",
        "Em julgamento",
        "Finalizada",
        "Cancelada",
      ],
      default: "Aberta",
      index: true,
    },

    propostaVencedora: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposta",
      default: null,
    },

    criadaPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    finalizadaEm: {
      type: Date,
      default: null,
    },

    canceladaEm: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model(
  "Cotacao",
  cotacaoSchema
)