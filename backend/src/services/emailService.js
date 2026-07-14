import nodemailer from "nodemailer"

function criarTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function verificarConexaoEmail() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP não configurado. Os e-mails de cotação não serão enviados.")
    return false
  }

  try {
    const transporter = criarTransporter()
    await transporter.verify()
    console.log("Servidor de e-mail conectado")
    return true
  } catch (error) {
    console.error("Erro na conexão SMTP:", error.message)
    return false
  }
}

export async function enviarEmailCotacao({
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
  const transporter = criarTransporter()

  const itensHtml = materiais
    .map(
      (item, index) => `
        <tr>
          <td style="border:1px solid #dbe3ef;padding:10px;text-align:center;">
            ${index + 1}
          </td>
          <td style="border:1px solid #dbe3ef;padding:10px;">
            ${item.item || item.material || "-"}
          </td>
          <td style="border:1px solid #dbe3ef;padding:10px;text-align:center;">
            ${item.quantidade || "-"}
          </td>
          <td style="border:1px solid #dbe3ef;padding:10px;text-align:center;">
            ${item.unidade || "-"}
          </td>
        </tr>
      `
    )
    .join("")

  const dataEncerramento = new Date(encerraEm).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  })

  return transporter.sendMail({
    from: `"Prefeitura de General Carneiro" <${
      process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: destinatario,
    subject: `Cotação ${numeroCotacao} - Prefeitura de General Carneiro`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b;">
          <div style="padding:30px 15px;">
            <div style="max-width:760px;margin:auto;background:#fff;border:1px solid #dbe3ef;border-radius:12px;overflow:hidden;">
              <div style="background:#172554;padding:26px 30px;color:#fff;">
                <h1 style="margin:0;font-size:22px;">Solicitação de Cotação</h1>
                <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">
                  Prefeitura Municipal de General Carneiro - PR
                </p>
              </div>

              <div style="padding:30px;">
                <p>Prezado(a) <strong>${nomeFornecedor || "Fornecedor"}</strong>,</p>

                <p style="line-height:1.6;">
                  A Prefeitura Municipal de General Carneiro solicita o preenchimento
                  da cotação abaixo. O formulário ficará disponível até o encerramento
                  do prazo informado.
                </p>

                <div style="margin:24px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:18px;">
                  <p><strong>Cotação:</strong> ${numeroCotacao}</p>
                  <p><strong>Demanda:</strong> ${numeroDemanda || "-"}</p>
                  <p><strong>Secretaria:</strong> ${secretaria || "-"}</p>
                  <p><strong>Objeto:</strong> ${objeto || "-"}</p>
                  <p><strong>Prazo:</strong> ${prazoHoras} hora(s)</p>
                  <p><strong>Encerramento:</strong> ${dataEncerramento}</p>
                </div>

                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                  <thead>
                    <tr style="background:#eff6ff;">
                      <th style="border:1px solid #dbe3ef;padding:10px;">Item</th>
                      <th style="border:1px solid #dbe3ef;padding:10px;">Descrição</th>
                      <th style="border:1px solid #dbe3ef;padding:10px;">Quantidade</th>
                      <th style="border:1px solid #dbe3ef;padding:10px;">Unidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itensHtml}
                  </tbody>
                </table>

                ${
                  observacao
                    ? `<div style="margin-top:20px;padding:15px;background:#eff6ff;border-left:4px solid #2563eb;">
                        <strong>Observações:</strong>
                        <p style="margin:8px 0 0;">${observacao}</p>
                      </div>`
                    : ""
                }

                <div style="margin:28px 0;text-align:center;">
                  <a
                    href="${link}"
                    style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:bold;"
                  >
                    Preencher Cotação
                  </a>
                </div>

                <p style="font-size:13px;color:#64748b;line-height:1.6;">
                  Este link é exclusivo para sua empresa. Não compartilhe com terceiros.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}
