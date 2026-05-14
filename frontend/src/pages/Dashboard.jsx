import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [telaAtual, setTelaAtual] = useState("painel");
  const [secretarias, setSecretarias] = useState([]);
  const [mostrarFormSecretaria, setMostrarFormSecretaria] = useState(false);
  const [secretariaEditando, setSecretariaEditando] = useState(null);

  const menu = [
    ["painel", "Painel Inicial"],
    ["secretarias", "Secretarias"],
    ["demanda", "Nova Demanda"],
    ["orcamento", "Orçamento"],
    ["solicitacao", "Solicitação"],
    ["fornecedores", "Fornecedores"],
    ["propostas", "Propostas"],
    ["julgamento", "Julgamento"],
    ["resultado", "Resultado"],
    ["arquivos", "Arquivos"],
  ];

  async function carregarSecretarias() {
    try {
      const response = await fetch("http://localhost:5000/api/secretarias", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      setSecretarias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    carregarSecretarias();
  }, []);

  async function salvarSecretaria(e) {
    e.preventDefault();

    const form = e.currentTarget;

    const dados = {
      nome: form.nome.value,
      responsavel: form.responsavel.value,
      email: form.email.value,
      telefone: form.telefone.value,
    };

    try {
      const url = secretariaEditando
        ? `http://localhost:5000/api/secretarias/${secretariaEditando._id}`
        : "http://localhost:5000/api/secretarias";

      const method = secretariaEditando ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dados),
      });

      form.reset();
      setSecretariaEditando(null);
      setMostrarFormSecretaria(false);
      carregarSecretarias();
    } catch (error) {
      console.log(error);
    }
  }

  function abrirCadastroSecretaria() {
    setSecretariaEditando(null);
    setMostrarFormSecretaria(true);
  }

  function editarSecretaria(secretaria) {
    setSecretariaEditando(secretaria);
    setMostrarFormSecretaria(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarFormularioSecretaria() {
    setSecretariaEditando(null);
    setMostrarFormSecretaria(false);
  }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const Card = ({ titulo, valor, texto, danger }) => (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
      <div
        className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full ${
          danger ? "bg-red-100" : "bg-emerald-100"
        }`}
      />

      <span className="text-xs text-slate-500">{titulo}</span>

      <strong
        className={`relative mt-2 mb-2 block text-4xl font-black ${
          danger ? "text-red-600" : "text-emerald-950"
        }`}
      >
        {valor}
      </strong>

      <small className="relative text-xs text-slate-400">{texto}</small>
    </div>
  );

  const Header = ({ tag, title, desc, button, onClick }) => (
    <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-2 text-[10px] font-black text-emerald-700">
          {tag}
        </span>

        <h1 className="text-4xl font-black tracking-tight text-emerald-950">
          {title}
        </h1>

        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-500">
          {desc}
        </p>
      </div>

      {button && (
        <button
          onClick={onClick}
          className="rounded-2xl bg-emerald-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700"
        >
          {button}
        </button>
      )}
    </div>
  );

  const Panel = ({ title, children }) => (
    <div className="mb-7 rounded-3xl border border-slate-100 bg-white p-7 shadow-xl">
      <h2 className="text-2xl font-black text-emerald-950">{title}</h2>
      {children}
    </div>
  );

  function Painel() {
    return (
      <>
        <Header
          tag="Visão geral"
          title="Painel Inicial"
          desc="Controle completo das demandas, orçamentos, fornecedores, propostas e resultados do credenciamento."
          button="Abrir Nova Demanda"
          onClick={() => setTelaAtual("demanda")}
        />

        <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <Card titulo="Demandas abertas" valor="0" texto="Nenhuma demanda cadastrada" />

          <Card
            titulo="Secretarias ativas"
            valor={secretarias.length}
            texto={
              secretarias.length === 0
                ? "Nenhuma secretaria cadastrada"
                : "Secretarias cadastradas no sistema"
            }
          />

          <Card titulo="Fornecedores" valor="0" texto="Nenhum fornecedor cadastrado" />

          <Card titulo="Pendências" valor="0" texto="Nenhuma pendência no momento" danger />
        </div>

        <div className="mb-7 grid grid-cols-1 gap-6 2xl:grid-cols-[1.45fr_1fr]">
          <Panel title="Fluxo do Processo">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Acompanhamento das fases principais do credenciamento.
              </p>

              <span className="rounded-full bg-emerald-100 px-4 py-2 text-[10px] font-black text-emerald-700">
                Aguardando cadastros
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {[
                ["01", "Demanda", "Secretaria informa os materiais necessários."],
                ["02", "Orçamento", "Itens são organizados e conferidos."],
                ["03", "Solicitação", "Envio para fornecedores credenciados."],
                ["04", "Propostas", "Recebimento e análise das cotações."],
                ["05", "Resultado", "Classificação e relatório final."],
              ].map(([n, t, d]) => (
                <div
                  key={n}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white">
                    {n}
                  </div>

                  <h3 className="text-base font-black text-emerald-950">{t}</h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {d}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Alertas do Sistema">
            <p className="mt-2 mb-5 text-sm text-slate-500">
              Pontos que precisam de atenção.
            </p>

            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="mt-1 h-3 w-3 rounded-full bg-emerald-600" />

              <p className="text-sm text-slate-600">
                Nenhum alerta registrado no momento.
              </p>
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <Panel title="Atividades Recentes">
            <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[80px_1fr]">
              <b className="text-sm font-black text-emerald-700">Hoje</b>

              <span className="text-sm text-slate-500">
                Nenhuma movimentação registrada ainda.
              </span>
            </div>
          </Panel>

          <Panel title="Resumo Financeiro Parcial">
            <div className="mt-5 grid gap-4">
              {[
                ["Valor de referência", "R$ 0,00"],
                ["Menores propostas", "R$ 0,00"],
                ["Economia estimada", "R$ 0,00"],
              ].map(([titulo, valor]) => (
                <div
                  key={titulo}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="text-xs text-slate-500">{titulo}</span>

                  <strong className="mt-2 block text-2xl font-black text-emerald-950">
                    {valor}
                  </strong>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </>
    );
  }

  function SecretariasPage() {
    return (
      <>
        <Header
          tag="Gestão interna"
          title="Secretarias Participantes"
          desc="Cadastro e acompanhamento das secretarias autorizadas a abrir demandas."
          button="Cadastrar Secretaria"
          onClick={abrirCadastroSecretaria}
        />

        {mostrarFormSecretaria && (
          <Panel
            title={
              secretariaEditando
                ? "Editar Secretaria"
                : "Nova Secretaria"
            }
          >
            <form
              key={secretariaEditando?._id || "nova-secretaria"}
              onSubmit={salvarSecretaria}
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Nome da Secretaria
                <input
                  name="nome"
                  type="text"
                  defaultValue={secretariaEditando?.nome || ""}
                  className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Ex: Secretaria de Obras"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                Responsável
                <input
                  name="responsavel"
                  type="text"
                  defaultValue={secretariaEditando?.responsavel || ""}
                  className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Nome do responsável"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                E-mail
                <input
                  name="email"
                  type="email"
                  defaultValue={secretariaEditando?.email || ""}
                  className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="email@prefeitura.pr.gov.br"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-slate-700">
                Telefone
                <input
                  name="telefone"
                  type="text"
                  defaultValue={secretariaEditando?.telefone || ""}
                  className="rounded-2xl border border-slate-300 p-4 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="(42) 99999-9999"
                />
              </label>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-emerald-600 p-4 text-sm font-black text-white transition hover:bg-emerald-700"
                >
                  {secretariaEditando ? "Salvar Alterações" : "Salvar Secretaria"}
                </button>

                <button
                  type="button"
                  onClick={cancelarFormularioSecretaria}
                  className="rounded-2xl bg-slate-200 px-6 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </Panel>
        )}

        <Panel title="Secretarias Cadastradas">
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full border-collapse">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-black uppercase text-emerald-950">
                    Secretaria
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase text-emerald-950">
                    Responsável
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase text-emerald-950">
                    E-mail
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase text-emerald-950">
                    Telefone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase text-emerald-950">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-black uppercase text-emerald-950">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {secretarias.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-8 text-center text-sm text-slate-400"
                    >
                      Nenhuma secretaria cadastrada.
                    </td>
                  </tr>
                ) : (
                  secretarias.map((secretaria) => (
                    <tr
                      key={secretaria._id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-5 text-sm font-bold text-slate-700">
                        {secretaria.nome}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {secretaria.responsavel}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {secretaria.email}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {secretaria.telefone || "-"}
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-full bg-emerald-100 px-3 py-2 text-[10px] font-black text-emerald-700">
                          Ativa
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => editarSecretaria(secretaria)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-700 transition hover:bg-blue-200"
                            title="Editar secretaria"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </>
    );
  }

  function TelaPadrao({ titulo, tag, descricao }) {
    return (
      <>
        <Header
          tag={tag}
          title={titulo}
          desc={descricao}
          button="Novo Cadastro"
        />

        <Panel title="Nenhum registro cadastrado">
          <p className="mt-3 text-sm text-slate-500">
            Quando houver informações cadastradas no sistema, elas aparecerão
            aqui automaticamente.
          </p>
        </Panel>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-slate-900">
      <aside className="fixed left-0 top-0 z-20 flex h-screen w-60 flex-col justify-between overflow-y-auto bg-gradient-to-b from-emerald-950 to-emerald-700 p-5 text-white shadow-2xl">
        <div>
          <div className="flex items-center gap-3 border-b border-white/20 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-emerald-700">
              GC
            </div>

            <div>
              <h2 className="text-lg font-black leading-tight">
                Credenciamento
              </h2>

              <p className="text-[10px] text-white/80">
                Materiais de Construção
              </p>
            </div>
          </div>

          <nav className="mt-7 grid gap-2">
            {menu.map(([id, nome]) => (
              <button
                key={id}
                onClick={() => setTelaAtual(id)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition-all ${
                  telaAtual === id
                    ? "translate-x-1 bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                {nome}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 grid gap-2">
          <small className="text-xs text-white/70">Usuário logado</small>

          <strong className="text-base">
            {user?.nome || "Administrador"}
          </strong>

          <button
            onClick={sair}
            className="mt-3 rounded-2xl bg-red-500 p-4 text-sm font-black text-white transition hover:bg-red-600"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="ml-60 p-8">
        {telaAtual === "painel" && <Painel />}

        {telaAtual === "secretarias" && <SecretariasPage />}

        {telaAtual === "demanda" && (
          <TelaPadrao
            titulo="Nova Demanda"
            tag="Abertura da necessidade"
            descricao="Registro formal da necessidade de materiais pela secretaria solicitante."
          />
        )}

        {telaAtual === "orcamento" && (
          <TelaPadrao
            titulo="Orçamento da Secretaria"
            tag="Itens e quantitativos"
            descricao="Cadastro dos materiais, quantidades e finalidade de uso."
          />
        )}

        {telaAtual === "solicitacao" && (
          <TelaPadrao
            titulo="Solicitação aos Fornecedores"
            tag="Envio de cotação"
            descricao="Preparação e envio da solicitação de orçamento."
          />
        )}

        {telaAtual === "fornecedores" && (
          <TelaPadrao
            titulo="Fornecedores Credenciados"
            tag="Cadastro externo"
            descricao="Empresas aptas a receber pedidos de orçamento."
          />
        )}

        {telaAtual === "propostas" && (
          <TelaPadrao
            titulo="Propostas Recebidas"
            tag="Recebimento"
            descricao="Controle das cotações encaminhadas."
          />
        )}

        {telaAtual === "julgamento" && (
          <TelaPadrao
            titulo="Julgamento"
            tag="Classificação"
            descricao="Classificação das propostas válidas."
          />
        )}

        {telaAtual === "resultado" && (
          <TelaPadrao
            titulo="Resultado Final"
            tag="Finalização"
            descricao="Apuração dos fornecedores vencedores."
          />
        )}

        {telaAtual === "arquivos" && (
          <TelaPadrao
            titulo="Arquivos do Processo"
            tag="Documentos"
            descricao="Organização dos documentos do credenciamento."
          />
        )}
      </main>
    </div>
  );
}