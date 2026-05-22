import mongoose from "mongoose"

const itemOrcamentoSchema = new mongoose.Schema(
  {
    material: {
      type: String,
      required: true,
    },

    quantidade: {
      type: Number,
      required: true,
    },

    unidade: {
      type: String,
      required: true,
    },

    valorUnitario: {
      type: Number,
      required: true,
      default: 0,
    },

    valorTotal: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
)

const orcamentoSchema = new mongoose.Schema(
  {
    demanda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Demanda",
      required: true,
    },

    numeroDemanda: {
      type: String,
      required: true,
    },

    secretaria: {
      type: String,
      required: true,
    },

    itens: [itemOrcamentoSchema],

    valorTotalEstimado: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Em elaboração", "Finalizado"],
      default: "Em elaboração",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("Orcamento", orcamentoSchema)