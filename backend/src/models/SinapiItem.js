import mongoose from "mongoose"

const sinapiItemSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      trim: true,
    },
    descricao: {
      type: String,
      required: true,
      trim: true,
    },
    descricaoBusca: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    unidade: {
      type: String,
      required: true,
      trim: true,
    },
    preco: {
      type: Number,
      required: true,
      min: 0,
    },
    tipo: {
      type: String,
      enum: ["INSUMO", "COMPOSICAO"],
      required: true,
      index: true,
    },
    grupo: {
      type: String,
      default: "",
      trim: true,
    },
    origemPreco: {
      type: String,
      default: "",
      trim: true,
    },
    uf: {
      type: String,
      default: "PR",
      uppercase: true,
      index: true,
    },
    localidade: {
      type: String,
      default: "CURITIBA",
      trim: true,
    },
    referencia: {
      type: String,
      required: true,
      index: true,
    },
    regime: {
      type: String,
      default: "SEM ENCARGOS SOCIAIS",
      trim: true,
    },
    fonte: {
      type: String,
      default: "SINAPI",
      trim: true,
    },
    ativo: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

sinapiItemSchema.index(
  { codigo: 1, tipo: 1, uf: 1, referencia: 1 },
  { unique: true }
)

sinapiItemSchema.index({ descricaoBusca: "text", codigo: "text" })

export default mongoose.model("SinapiItem", sinapiItemSchema)
