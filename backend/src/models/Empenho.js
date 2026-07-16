import mongoose from "mongoose"

const empenhoSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true, trim: true },
    cotacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cotacao",
      required: true,
    },
    proposta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposta",
      required: true,
    },
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      required: true,
    },
    valor: { type: Number, required: true, min: 0 },
    descricao: { type: String, default: "", trim: true },
    documentoUrl: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Emitido", "Visualizado", "Aceito", "Cancelado"],
      default: "Emitido",
    },
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    visualizadoEm: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model("Empenho", empenhoSchema)
