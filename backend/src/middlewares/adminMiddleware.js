export function adminMiddleware(req, res, next) {
  if (req.user?.perfil !== "Administrador") {
    return res.status(403).json({
      erro: "Apenas administradores podem realizar esta operação.",
    })
  }

  next()
}
