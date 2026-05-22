import mongoose from "mongoose"

const fornecedorSchema = new mongoose.Schema(
  {
    empresa: {
      type: String,
      required: true,
      trim: true,
    },

    cnpj: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    responsavel: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    telefone: {
      type: String,
      default: "",
    },

    cidade: {
      type: String,
      default: "",
    },

    materiais: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Ativo", "Inativo"],
      default: "Ativo",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("Fornecedor", fornecedorSchema)