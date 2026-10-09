import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    if (carregando) return;

    setErro("");
    setCarregando(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          "E-mail ou senha inválidos."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="gc-login">
      <style>{`
        .gc-login { min-height:100vh; min-height:100dvh; display:flex; align-items:center; justify-content:center; padding:36px 24px; background:#f3f6fb; color:#17243b; font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
        .gc-login * { box-sizing:border-box; }
        .gc-login .gc-shell { display:grid; grid-template-columns:1.04fr 1fr; width:100%; max-width:1060px; min-height:640px; border-radius:28px; overflow:hidden; background:white; box-shadow:0 24px 80px -24px #19355730; border:1px solid #e2e8f0; }
        .gc-login .gc-brand { position:relative; overflow:hidden; background:linear-gradient(145deg,#102c54,#164780); padding:44px; display:flex; flex-direction:column; justify-content:space-between; color:white; }
        .gc-login .gc-brand::after { content:""; position:absolute; width:480px; height:480px; right:-265px; bottom:-235px; border:1px solid #ffffff18; border-radius:50%; box-shadow:0 0 0 60px #ffffff04,0 0 0 120px #ffffff04; pointer-events:none; }
        .gc-login .gc-identity { display:flex; align-items:center; gap:13px; position:relative; z-index:1; }
        .gc-login .gc-mark { width:48px; height:48px; display:grid; place-items:center; border:1px solid #ffffff30; background:#ffffff10; border-radius:14px; flex-shrink:0; }
        .gc-login .gc-eyebrow { font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#bdd1eb; margin:0 0 5px; }
        .gc-login .gc-city { font-size:15px; font-weight:650; margin:0; }
        .gc-login .gc-message { position:relative; z-index:1; padding:50px 0; }
        .gc-login .gc-pill { display:inline-flex; align-items:center; gap:8px; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; border:1px solid #ffffff25; padding:9px 12px; border-radius:100px; color:#d8e6f8; }
        .gc-login h1 { font-size:42px; letter-spacing:-1.6px; line-height:1.15; font-weight:700; margin:24px 0 20px; color:white; }
        .gc-login .gc-description { font-size:15px; line-height:1.8; color:#c2d4eb; max-width:330px; margin:0; }
        .gc-login .gc-brand-footer { display:flex; gap:11px; align-items:center; color:#c2d4eb; font-size:12px; line-height:1.6; position:relative; z-index:1; }
        .gc-login .gc-form-side { padding:60px 52px 28px; display:flex; flex-direction:column; justify-content:center; }
        .gc-login .gc-form-icon { display:grid; place-items:center; width:48px; height:48px; border-radius:14px; background:#eef4fc; color:#164780; margin-bottom:25px; }
        .gc-login h2 { font-size:30px; line-height:1.2; letter-spacing:-.8px; font-weight:700; margin:0 0 12px; }
        .gc-login .gc-intro { font-size:14px; color:#6a778b; line-height:1.7; margin:0 0 32px; }
        .gc-login .gc-field { margin-bottom:22px; }
        .gc-login label { display:block; font-size:13px; font-weight:600; margin-bottom:9px; }
        .gc-login .gc-input-wrap { position:relative; }
        .gc-login .gc-input-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#8291a6; pointer-events:none; }
        .gc-login input { width:100%; height:54px; border:1px solid #dbe2eb; border-radius:12px; padding:0 16px 0 46px; background:#fafbfd; color:#17243b; font:inherit; font-size:14px; outline:none; transition:border-color .2s,box-shadow .2s,background .2s; }
        .gc-login input::placeholder { color:#929daf; }
        .gc-login input:focus { background:white; border-color:#3268ac; box-shadow:0 0 0 4px #3268ac14; }
        .gc-login input:disabled { opacity:.65; }
        .gc-login .gc-password { padding-right:56px; }
        .gc-login .gc-toggle { position:absolute; right:7px; top:7px; width:40px; height:40px; display:grid; place-items:center; border:0; border-radius:8px; background:transparent; color:#758399; cursor:pointer; }
        .gc-login .gc-toggle:hover { color:#164780; background:#edf2f9; }
        .gc-login button:focus-visible { outline:3px solid #6ea0e5; outline-offset:3px; }
        .gc-login .gc-submit { width:100%; height:54px; display:flex; align-items:center; justify-content:center; gap:11px; border:0; border-radius:12px; background:#164780; color:white; font:inherit; font-size:14px; font-weight:650; cursor:pointer; box-shadow:0 6px 15px #16478020; transition:background .2s,transform .2s; margin-top:8px; }
        .gc-login .gc-submit:hover:not(:disabled) { background:#103763; transform:translateY(-1px); }
        .gc-login .gc-submit:disabled { opacity:.65; cursor:wait; }
        .gc-login .gc-error { font-size:13px; line-height:1.6; color:#a02632; padding:12px 14px; border:1px solid #f2c6cc; background:#fff4f5; border-radius:10px; margin-bottom:20px; }
        .gc-login .gc-restricted { display:flex; align-items:center; justify-content:center; gap:7px; border-top:1px solid #edf0f5; padding-top:23px; margin:27px 0 0; font-size:11px; color:#7a8799; }
        .gc-login .gc-copyright { text-align:center; font-size:10px; line-height:1.7; color:#8a95a6; margin:42px 0 0; }
        .gc-login .gc-spin { animation:gc-login-spin 1s linear infinite; }
        @keyframes gc-login-spin { to { transform:rotate(360deg); } }
        @media(max-width:800px) { .gc-login .gc-brand { padding:32px; } .gc-login .gc-form-side { padding:42px 32px 26px; } .gc-login h1 { font-size:35px; } }
        @media(max-width:640px) { .gc-login { padding:20px 14px; } .gc-login .gc-shell { grid-template-columns:1fr; min-height:0; border-radius:22px; max-width:440px; } .gc-login .gc-brand { padding:26px; } .gc-login .gc-message { padding:24px 0 0; } .gc-login .gc-pill,.gc-login .gc-brand-footer,.gc-login .gc-description { display:none; } .gc-login h1 { font-size:28px; letter-spacing:-.8px; margin:0; max-width:300px; } .gc-login .gc-form-side { padding:30px 26px 24px; } .gc-login .gc-form-icon { display:none; } .gc-login h2 { font-size:25px; } .gc-login .gc-intro { margin-bottom:25px; } .gc-login .gc-copyright { margin-top:28px; } }
        @media(prefers-reduced-motion:reduce) { .gc-login input,.gc-login button { transition:none; } .gc-login .gc-spin { animation:none; } }
      `}</style>
      <div className="gc-shell">
        <section className="gc-brand" aria-label="Prefeitura Municipal de General Carneiro">
          <div className="gc-identity">
            <div className="gc-mark"><Building2 size={25} aria-hidden="true" /></div>
            <div><p className="gc-eyebrow">Prefeitura Municipal</p><p className="gc-city">General Carneiro · PR</p></div>
          </div>
          <div className="gc-message">
            <span className="gc-pill"><FileText size={14} aria-hidden="true" /> Gestão pública</span>
            <h1>Gestão de compras,<br />mais organizada.</h1>
            <p className="gc-description">Um só lugar para acompanhar as demandas e apoiar o trabalho de quem cuida do município.</p>
          </div>
          <div className="gc-brand-footer"><ShieldCheck size={21} aria-hidden="true" /><span>Sistema de Gestão de Compras<br />Acesso institucional</span></div>
        </section>
        <section className="gc-form-side" aria-labelledby="gc-login-title">
          <div className="gc-form-icon"><LockKeyhole size={22} aria-hidden="true" /></div>
          <h2 id="gc-login-title">Bem-vindo de volta</h2>
          <p className="gc-intro">Entre com suas credenciais para acessar o sistema.</p>
          <form onSubmit={handleLogin} aria-busy={carregando}>
            {erro && <div id="gc-login-error" className="gc-error" role="alert">{erro}</div>}
            <div className="gc-field">
              <label htmlFor="gc-email">E-mail institucional</label>
              <div className="gc-input-wrap">
                <Mail size={18} className="gc-input-icon" aria-hidden="true" />
                <input id="gc-email" type="email" name="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" required disabled={carregando} autoCapitalize="none" spellCheck={false} aria-describedby={erro ? "gc-login-error" : undefined} />
              </div>
            </div>
            <div className="gc-field">
              <label htmlFor="gc-password">Senha</label>
              <div className="gc-input-wrap">
                <LockKeyhole size={18} className="gc-input-icon" aria-hidden="true" />
                <input id="gc-password" className="gc-password" type={mostrarSenha ? "text" : "password"} name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" required disabled={carregando} aria-describedby={erro ? "gc-login-error" : undefined} />
                <button type="button" className="gc-toggle" onClick={() => setMostrarSenha((atual) => !atual)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} aria-pressed={mostrarSenha}>
                  {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={carregando} className="gc-submit">
              {carregando ? <><Loader2 size={18} className="gc-spin" aria-hidden="true" />Entrando...</> : <>Entrar no sistema<ArrowRight size={18} aria-hidden="true" /></>}
            </button>
            <p className="gc-restricted"><ShieldCheck size={14} aria-hidden="true" />Acesso restrito aos usuários autorizados.</p>
          </form>
          <p className="gc-copyright">© {new Date().getFullYear()} Prefeitura Municipal de General Carneiro – PR</p>
        </section>
      </div>
    </main>
  );
}