import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import SinapiItem from "../models/SinapiItem.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function importar() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI não configurada no arquivo .env.")
  }

  const arquivo = path.resolve(
    __dirname,
    "../data/sinapi_pr_2026_05.json"
  )

  if (!fs.existsSync(arquivo)) {
    throw new Error(`Arquivo SINAPI não encontrado: ${arquivo}`)
  }

  const itens = JSON.parse(fs.readFileSync(arquivo, "utf8"))

  await mongoose.connect(process.env.MONGO_URI)

  console.log("MongoDB conectado")
  console.log(`${itens.length} itens SINAPI encontrados para importação`)

  const lote = 500
  let importados = 0

  for (let inicio = 0; inicio < itens.length; inicio += lote) {
    const grupo = itens.slice(inicio, inicio + lote)

    const operacoes = grupo.map((item) => ({
      updateOne: {
        filter: {
          codigo: String(item.codigo),
          tipo: item.tipo,
          uf: item.uf || "PR",
          referencia: item.referencia || "05/2026",
        },
        update: {
          $set: {
            codigo: String(item.codigo),
            descricao: item.descricao,
            descricaoBusca: normalizarTexto(item.descricao),
            unidade: item.unidade,
            preco: Number(item.preco || 0),
            tipo: item.tipo,
            grupo: item.grupo || "",
            origemPreco: item.origemPreco || "",
            uf: item.uf || "PR",
            localidade: item.localidade || "CURITIBA",
            referencia: item.referencia || "05/2026",
            regime: item.regime || "SEM ENCARGOS SOCIAIS",
            fonte: item.fonte || "SINAPI",
            ativo: true,
          },
        },
        upsert: true,
      },
    }))

    await SinapiItem.bulkWrite(operacoes, { ordered: false })
    importados += grupo.length
    console.log(`${importados}/${itens.length} processados`)
  }

  const total = await SinapiItem.countDocuments({
    uf: "PR",
    referencia: "05/2026",
    ativo: true,
  })

  console.log(`Importação concluída. ${total} itens ativos no MongoDB.`)
}

importar()
  .catch((error) => {
    console.error("Erro na importação SINAPI:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
