import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true },
    perfil: {
      type: String,
      enum: ["Administrador", "Operador", "Consulta"],
      default: "Operador",
    },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model("User", userSchema)
