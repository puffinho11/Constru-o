import mongoose from "mongoose"

const participanteSchema = new mongoose.Schema(
  {
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      required: true,
    },

    token: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
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

    respondeuEm: {
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

    participantes: {
      type: [participanteSchema],
      validate: {
        validator: (itens) => Array.isArray(itens) && itens.length > 0,
        message: "A cotação precisa possuir pelo menos um fornecedor.",
      },
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
  },
  {
    timestamps: true,
  }
)

cotacaoSchema.index({ "participantes.token": 1 })

export default mongoose.model("Cotacao", cotacaoSchema)
