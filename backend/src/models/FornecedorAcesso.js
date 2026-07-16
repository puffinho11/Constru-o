import mongoose from "mongoose"

const fornecedorAcessoSchema = new mongoose.Schema(
  {
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      required: true,
      unique: true,
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true },
    ativo: { type: Boolean, default: true },
    ultimoAcessoEm: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model("FornecedorAcesso", fornecedorAcessoSchema)
