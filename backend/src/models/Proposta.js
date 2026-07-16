import mongoose from "mongoose"

const propostaSchema = new mongoose.Schema(
  {
    numero: { type: String, trim: true },
    cotacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cotacao",
      required: true,
      index: true,
    },
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      required: true,
      index: true,
    },
    valorReferenciaSinapi: { type: Number, required: true, min: 0 },
    percentualDesconto: { type: Number, default: 0 },
    valorTotal: { type: Number, required: true, min: 0 },
    prazoEntrega: { type: String, default: "" },
    validadeDias: { type: Number, default: 60 },
    observacao: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Recebida", "Em análise", "Classificada", "Desclassificada", "Vencedora"],
      default: "Recebida",
    },
    justificativaJulgamento: { type: String, default: "" },
    julgadaEm: { type: Date, default: null },
    julgadaPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
)

propostaSchema.index({ cotacao: 1, fornecedor: 1 }, { unique: true })

export default mongoose.model("Proposta", propostaSchema)
