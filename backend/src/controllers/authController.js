import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { nome, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "Usuário já existe",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nome,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "Usuário criado",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro no servidor",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Usuário não encontrado",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Senha inválida",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro no servidor",
    });
  }
};