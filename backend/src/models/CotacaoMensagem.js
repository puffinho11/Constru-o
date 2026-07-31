import mongoose from "mongoose"

const cotacaoMensagemSchema = new mongoose.Schema(
  {
    cotacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cotacao",
      required: true,
      index: true,
    },

    /*
     * No chat privado, identifica o fornecedor.
     * No grupo geral, fica null.
     */
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      default: null,
      index: true,
    },

    tipoChat: {
      type: String,
      enum: ["privado", "grupo"],
      default: "privado",
      required: true,
      index: true,
    },

    remetenteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    remetenteNome: {
      type: String,
      required: true,
      trim: true,
    },

    remetenteTipo: {
      type: String,
      enum: ["interno", "fornecedor"],
      required: true,
    },

    mensagem: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    arquivoUrl: {
      type: String,
      default: "",
    },

    arquivoNome: {
      type: String,
      default: "",
    },

    arquivoTipo: {
      type: String,
      default: "",
    },

    arquivoTamanho: {
      type: Number,
      default: 0,
    },

    lida: {
      type: Boolean,
      default: false,
    },

    lidaEm: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

cotacaoMensagemSchema.index({
  cotacao: 1,
  tipoChat: 1,
  fornecedor: 1,
  createdAt: 1,
})

export default mongoose.model(
  "CotacaoMensagem",
  cotacaoMensagemSchema
)