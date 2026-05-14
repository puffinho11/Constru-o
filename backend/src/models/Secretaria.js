import mongoose from "mongoose";

const secretariaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
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

    status: {
      type: String,
      enum: ["ativa", "inativa"],
      default: "ativa",
    },

    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Secretaria", secretariaSchema);