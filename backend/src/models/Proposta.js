import mongoose from "mongoose"

const itemPropostaSchema = new mongoose.Schema(
  {
    material: {
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
      trim: true,
      default: "",
    },

    valorUnitario: {
      type: Number,
      required: true,
      min: 0,
    },

    valorTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
)

const propostaSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    cotacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cotacao",
      required: true,
      index: true,
    },

    demanda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Demanda",
      required: true,
    },

    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      required: true,
    },

    participanteToken: {
      type: String,
      required: true,
      index: true,
    },

    itens: {
      type: [itemPropostaSchema],
      required: true,
    },

    valorTotal: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    prazoEntrega: {
      type: String,
      trim: true,
      default: "",
    },

    validadeDias: {
      type: Number,
      default: 60,
      min: 1,
    },

    observacao: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Recebida",
        "Classificada",
        "Desclassificada",
        "Vencedora",
        "Cancelada",
      ],
      default: "Recebida",
      index: true,
    },

    justificativaJulgamento: {
      type: String,
      trim: true,
      default: "",
    },

    recebidaEm: {
      type: Date,
      default: Date.now,
    },

    julgadaEm: {
      type: Date,
      default: null,
    },

    julgadaPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

propostaSchema.index(
  {
    cotacao: 1,
    fornecedor: 1,
  },
  {
    unique: true,
  }
)

export default mongoose.model("Proposta", propostaSchema)
