import mongoose from "mongoose"

const arquivoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    nomeOriginal: {
      type: String,
      trim: true,
      default: "",
    },

    tipo: {
      type: String,
      enum: [
        "Documento",
        "Proposta",
        "Relatório",
        "Certidão",
        "Contrato",
        "Outro",
      ],
      default: "Documento",
    },

    processo: {
      type: String,
      trim: true,
      default: "",
    },

    observacao: {
      type: String,
      trim: true,
      default: "",
    },

    url: {
      type: String,
      trim: true,
      default: "",
    },

    caminho: {
      type: String,
      trim: true,
      default: "",
    },

    mimeType: {
      type: String,
      trim: true,
      default: "",
    },

    tamanho: {
      type: Number,
      default: 0,
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

export default mongoose.model("Arquivo", arquivoSchema)
