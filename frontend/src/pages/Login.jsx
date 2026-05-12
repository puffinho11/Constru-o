import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@email.com");
  const [password, setPassword] = useState("123456");
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      setErro("E-mail ou senha inválidos.");
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Credenciamento</h1>
        <p>Acesse o sistema de materiais de construção</p>

        {erro && <div className="erro">{erro}</div>}

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}