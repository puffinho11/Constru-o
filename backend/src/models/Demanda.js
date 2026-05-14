import mongoose from "mongoose"

const materialSchema = new mongoose.Schema({
  item: String,
  quantidade: Number,
  unidade: String,
  observacao: String,
})

const demandaSchema = new mongoose.Schema(
  {
    numeroDemanda: {
      type: String,
      required: true,
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

    materiais: [materialSchema],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model(
  "Demanda",
  demandaSchema
)