import mongoose from "mongoose"

const itemSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
    },

    quantidade: {
      type: Number,
      required: true,
    },

    unidade: {
      type: String,
      required: true,
    },

    observacao: {
      type: String,
      default: "",
    },
  },
  { _id: false }
)

const demandaSchema = new mongoose.Schema(
  {
    numeroDemanda: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    secretaria: {
      type: String,
      required: true,
    },

    responsavel: {
      type: String,
      required: true,
    },

    prioridade: {
      type: String,
      enum: ["Normal", "Urgente", "Emergencial"],
      default: "Normal",
    },

    objeto: {
      type: String,
      required: true,
    },

    justificativa: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Em elaboração",
        "Em orçamento",
        "Em cotação",
        "Em julgamento",
        "Finalizado",
      ],
      default: "Em elaboração",
    },

    materiais: [itemSchema],

    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model(
  "Demanda",
  demandaSchema
)