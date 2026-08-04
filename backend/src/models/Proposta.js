import mongoose from "mongoose"

const itemSchema = new mongoose.Schema(
  {
    material: {
      type: String,
      required: true,
      trim: true,
    },

    quantidade: {
      type: Number,
      required: true,
      min: 0,
    },

    unidade: {
      type: String,
      default: "",
    },

    marca: {
      type: String,
      default: "",
      trim: true,
    },

    valorUnitario: {
      type: Number,
      required: true,
      min: 0,
    },

    valorTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
)

const propostaSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      trim: true,
    },

    cotacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cotacao",
      required: true,
      index: true,
    },

    // Agora o fornecedor é opcional
    fornecedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fornecedor",
      default: null,
    },

    // Dados informados pela empresa no link público
    empresa: {
      type: String,
      required: true,
      trim: true,
    },

    cnpj: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
      trim: true,
    },

    itens: {
      type: [itemSchema],
      default: [],
    },

    valorReferenciaSinapi: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentualDesconto: {
      type: Number,
      default: 0,
    },

    valorTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    prazoEntrega: {
      type: String,
      default: "",
    },

    validadeDias: {
      type: Number,
      default: 60,
    },

    observacao: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Recebida",
        "Em análise",
        "Classificada",
        "Desclassificada",
        "Vencedora",
      ],
      default: "Recebida",
    },

    justificativaJulgamento: {
      type: String,
      default: "",
    },

    julgadaEm: {
      type: Date,
      default: null,
    },

    julgadaPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Uma proposta por CNPJ em cada cotação
propostaSchema.index(
  {
    cotacao: 1,
    cnpj: 1,
  },
  {
    unique: true,
  }
)

export default mongoose.model(
  "Proposta",
  propostaSchema
)