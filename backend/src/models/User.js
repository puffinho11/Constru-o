import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    senha: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      default: "",
    },

    perfil: {
      type: String,
      enum: ["Administrador", "Operador", "Consulta"],
      default: "Operador",
    },

    role: {
      type: String,
      default: "",
    },

    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("User", userSchema)