import Secretaria from "../models/Secretaria.js";

export const criarSecretaria = async (req, res) => {
  try {
    const { nome, responsavel, email, telefone, status } = req.body;

    if (!nome || !responsavel || !email) {
      return res.status(400).json({
        message: "Nome, responsável e e-mail são obrigatórios.",
      });
    }

    const secretaria = await Secretaria.create({
      nome,
      responsavel,
      email,
      telefone,
      status,
      criadoPor: req.user?.id,
    });

    return res.status(201).json(secretaria);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao cadastrar secretaria.",
    });
  }
};

export const listarSecretarias = async (req, res) => {
  try {
    const secretarias = await Secretaria.find().sort({ createdAt: -1 });

    return res.json(secretarias);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar secretarias.",
    });
  }
};

export const buscarSecretariaPorId = async (req, res) => {
  try {
    const secretaria = await Secretaria.findById(req.params.id);

    if (!secretaria) {
      return res.status(404).json({
        message: "Secretaria não encontrada.",
      });
    }

    return res.json(secretaria);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar secretaria.",
    });
  }
};

export const atualizarSecretaria = async (req, res) => {
  try {
    const secretaria = await Secretaria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!secretaria) {
      return res.status(404).json({
        message: "Secretaria não encontrada.",
      });
    }

    return res.json(secretaria);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar secretaria.",
    });
  }
};

export const deletarSecretaria = async (req, res) => {
  try {
    const secretaria = await Secretaria.findByIdAndDelete(req.params.id);

    if (!secretaria) {
      return res.status(404).json({
        message: "Secretaria não encontrada.",
      });
    }

    return res.json({
      message: "Secretaria removida com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover secretaria.",
    });
  }
};