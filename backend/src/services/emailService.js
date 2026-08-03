const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

function montarLinkCotacao(token) {
  const frontUrl =
    process.env.FRONT_URL || "http://localhost:5173"

  return `${frontUrl}/cotacao/${token}`
}

function escaparHtml(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

async function enviarPelaBrevo({
  destinatario,
  nomeDestinatario,
  assunto,
  html,
}) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName =
    process.env.BREVO_SENDER_NAME ||
    "Prefeitura de General Carneiro"

  if (!apiKey) {
    throw new Error("BREVO_API_KEY não configurada.")
  }

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL não configurado.")
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: destinatario,
          name: nomeDestinatario || destinatario,
        },
      ],
      replyTo: {
        email: senderEmail,
        name: senderName,
      },
      subject: assunto,
      htmlContent: html,
    }),
  })

  const textoResposta = await response.text()

  let dados = {}

  if (textoResposta) {
    try {
      dados = JSON.parse(textoResposta)
    } catch {
      dados = {
        message: textoResposta,
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      dados.message ||
        dados.erro ||
        `Erro da Brevo: HTTP ${response.status}`
    )
  }

  return dados
}

export async function verificarConexaoEmail() {
  if (
    !process.env.BREVO_API_KEY ||
    !process.env.BREVO_SENDER_EMAIL
  ) {
    console.warn(
      "Brevo não configurada. Os e-mails de cotação não serão enviados."
    )

    return false
  }

  console.log("API da Brevo configurada")

  return true
}

export async function enviarEmailCotacao({
  cotacao,
  fornecedor,
  token,
  destinatario,
  nomeFornecedor,
  numeroCotacao,
  numeroDemanda,
  objeto,
  secretaria,
  prazoHoras,
  encerraEm,
  link,
  materiais = [],
  observacao,
}) {
  const emailDestino =
    destinatario ||
    fornecedor?.email

  if (!emailDestino) {
    throw new Error(
      "Nenhum destinatário informado para o e-mail."
    )
  }

  const nome =
    nomeFornecedor ||
    fornecedor?.empresa ||
    fornecedor?.razaoSocial ||
    fornecedor?.responsavel ||
    "Fornecedor"

  const numero =
    numeroCotacao ||
    cotacao?.numero ||
    "-"

  const demandaNumero =
    numeroDemanda ||
    cotacao?.demanda?.numeroDemanda ||
    "-"

  const objetoCotacao =
    objeto ||
    cotacao?.demanda?.objeto ||
    "-"

  const secretariaCotacao =
    secretaria ||
    cotacao?.demanda?.secretaria ||
    "-"

  const prazo =
    prazoHoras ||
    cotacao?.prazoHoras ||
    "-"

  const dataEncerramentoOriginal =
    encerraEm ||
    cotacao?.encerraEm

  const itens =
    materiais.length > 0
      ? materiais
      : cotacao?.demanda?.materiais || []

  const observacaoCotacao =
    observacao ||
    cotacao?.observacao ||
    ""

  const linkCotacao =
    link ||
    montarLinkCotacao(token)

  if (!token && !link) {
    throw new Error(
      "Token ou link da cotação não informado."
    )
  }

  const itensHtml = itens
    .map(
      (item, index) => `
        <tr>
          <td
            style="
              border:1px solid #dbe3ef;
              padding:10px;
              text-align:center;
            "
          >
            ${index + 1}
          </td>

          <td
            style="
              border:1px solid #dbe3ef;
              padding:10px;
            "
          >
            ${escaparHtml(
              item.item ||
                item.material ||
                "-"
            )}
          </td>

          <td
            style="
              border:1px solid #dbe3ef;
              padding:10px;
              text-align:center;
            "
          >
            ${escaparHtml(
              item.quantidade ?? "-"
            )}
          </td>

          <td
            style="
              border:1px solid #dbe3ef;
              padding:10px;
              text-align:center;
            "
          >
            ${escaparHtml(
              item.unidade || "-"
            )}
          </td>
        </tr>
      `
    )
    .join("")

  const dataEncerramento =
    dataEncerramentoOriginal
      ? new Date(
          dataEncerramentoOriginal
        ).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "America/Sao_Paulo",
        })
      : "-"

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>

      <body
        style="
          margin:0;
          background:#f1f5f9;
          font-family:Arial,sans-serif;
          color:#1e293b;
        "
      >
        <div style="padding:30px 15px;">
          <div
            style="
              max-width:760px;
              margin:auto;
              background:#ffffff;
              border:1px solid #dbe3ef;
              border-radius:12px;
              overflow:hidden;
            "
          >
            <div
              style="
                background:#172554;
                padding:26px 30px;
                color:#ffffff;
              "
            >
              <h1
                style="
                  margin:0;
                  font-size:22px;
                "
              >
                Solicitação de Cotação
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  color:#bfdbfe;
                  font-size:14px;
                "
              >
                Prefeitura Municipal de General Carneiro - PR
              </p>
            </div>

            <div style="padding:30px;">
              <p>
                Prezado(a)
                <strong>
                  ${escaparHtml(nome)}
                </strong>,
              </p>

              <p style="line-height:1.6;">
                A Prefeitura Municipal de General Carneiro
                solicita o preenchimento da cotação abaixo.
                O formulário ficará disponível até o
                encerramento do prazo informado.
              </p>

              <div
                style="
                  margin:24px 0;
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  border-radius:8px;
                  padding:18px;
                "
              >
                <p>
                  <strong>Cotação:</strong>
                  ${escaparHtml(numero)}
                </p>

                <p>
                  <strong>Demanda:</strong>
                  ${escaparHtml(demandaNumero)}
                </p>

                <p>
                  <strong>Secretaria:</strong>
                  ${escaparHtml(secretariaCotacao)}
                </p>

                <p>
                  <strong>Objeto:</strong>
                  ${escaparHtml(objetoCotacao)}
                </p>

                <p>
                  <strong>Prazo:</strong>
                  ${escaparHtml(prazo)} hora(s)
                </p>

                <p>
                  <strong>Encerramento:</strong>
                  ${escaparHtml(dataEncerramento)}
                </p>
              </div>

              <div style="overflow-x:auto;">
                <table
                  style="
                    width:100%;
                    border-collapse:collapse;
                    font-size:13px;
                  "
                >
                  <thead>
                    <tr style="background:#eff6ff;">
                      <th
                        style="
                          border:1px solid #dbe3ef;
                          padding:10px;
                        "
                      >
                        Item
                      </th>

                      <th
                        style="
                          border:1px solid #dbe3ef;
                          padding:10px;
                        "
                      >
                        Descrição
                      </th>

                      <th
                        style="
                          border:1px solid #dbe3ef;
                          padding:10px;
                        "
                      >
                        Quantidade
                      </th>

                      <th
                        style="
                          border:1px solid #dbe3ef;
                          padding:10px;
                        "
                      >
                        Unidade
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    ${
                      itensHtml ||
                      `
                        <tr>
                          <td
                            colspan="4"
                            style="
                              border:1px solid #dbe3ef;
                              padding:15px;
                              text-align:center;
                              color:#64748b;
                            "
                          >
                            Nenhum item informado.
                          </td>
                        </tr>
                      `
                    }
                  </tbody>
                </table>
              </div>

              ${
                observacaoCotacao
                  ? `
                    <div
                      style="
                        margin-top:20px;
                        padding:15px;
                        background:#eff6ff;
                        border-left:4px solid #2563eb;
                      "
                    >
                      <strong>Observações:</strong>

                      <p
                        style="
                          margin:8px 0 0;
                          white-space:pre-line;
                        "
                      >
                        ${escaparHtml(
                          observacaoCotacao
                        )}
                      </p>
                    </div>
                  `
                  : ""
              }

              <div
                style="
                  margin:28px 0;
                  text-align:center;
                "
              >
                <a
                  href="${escaparHtml(linkCotacao)}"
                  style="
                    display:inline-block;
                    background:#1d4ed8;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 24px;
                    border-radius:8px;
                    font-weight:bold;
                  "
                >
                  Preencher Cotação
                </a>
              </div>

              <p
                style="
                  font-size:13px;
                  color:#64748b;
                  line-height:1.6;
                "
              >
                Este link é exclusivo para sua empresa.
                Não compartilhe com terceiros.
              </p>

              <p
                style="
                  margin-top:20px;
                  font-size:12px;
                  color:#94a3b8;
                  word-break:break-all;
                "
              >
                Caso o botão não funcione, copie este endereço:
                <br />
                ${escaparHtml(linkCotacao)}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  return enviarPelaBrevo({
    destinatario: emailDestino,
    nomeDestinatario: nome,
    assunto:
      `Cotação ${numero} - Prefeitura de General Carneiro`,
    html,
  })
}