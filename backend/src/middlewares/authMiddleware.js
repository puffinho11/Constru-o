import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Token não informado",
      });
    }

    const tokenFormatado = token.replace("Bearer ", "");

    const decoded = jwt.verify(
      tokenFormatado,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};