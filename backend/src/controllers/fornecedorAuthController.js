import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import FornecedorAcesso from "../models/FornecedorAcesso.js"

export async function loginFornecedor(req, res) {
  try {
    const { email, senha } = req.body

    const acesso = await FornecedorAcesso.findOne({
      email: String(email || "").toLowerCase(),
      ativo: true,
    }).populate("fornecedor", "empresa razaoSocial email cnpj")

    if (!acesso || !(await bcrypt.compare(senha || "", acesso.senha))) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." })
    }

    acesso.ultimoAcessoEm = new Date()
    await acesso.save()

    const token = jwt.sign(
      {
        tipo: "Fornecedor",
        acessoId: acesso._id,
        fornecedorId: acesso.fornecedor._id,
        nome: acesso.fornecedor.empresa || acesso.fornecedor.razaoSocial,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    )

    return res.json({
      token,
      fornecedor: {
        _id: acesso.fornecedor._id,
        empresa: acesso.fornecedor.empresa || acesso.fornecedor.razaoSocial,
        email: acesso.email,
        cnpj: acesso.fornecedor.cnpj,
      },
    })
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao realizar login.", detalhe: error.message })
  }
}
