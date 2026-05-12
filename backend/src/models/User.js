import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "compras",
        "secretaria",
        "fornecedor",
      ],
      default: "secretaria",
    },

    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);