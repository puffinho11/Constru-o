import mongoose from "mongoose"

const chatResultadoSchema = new mongoose.Schema(
  {
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
    autorTipo: {
      type: String,
      enum: ["Administrador", "Fornecedor"],
      required: true,
    },
    autorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    autorNome: { type: String, required: true },
    mensagem: { type: String, required: true, trim: true, maxlength: 5000 },
    lidaEm: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model("ChatResultado", chatResultadoSchema)
