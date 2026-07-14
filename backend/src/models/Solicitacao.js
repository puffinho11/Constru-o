import mongoose from "mongoose"

const solicitacaoSchema = new mongoose.Schema(
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

    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      required: true,
    },

    prazo: {
      type: Date,
      default: null,
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
        "Enviado",
        "Visualizado",
        "Respondido",
        "Encerrado",
        "Cancelado",
      ],
      default: "Enviado",
    },

    enviadoEm: {
      type: Date,
      default: Date.now,
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

export default mongoose.model("Solicitacao", solicitacaoSchema)
