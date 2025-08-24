const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'quadralivre3@gmail.com',
    pass: 'tgvg ugil mpjm owhj'
  }
});

async function enviarEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: '"Suporte - Quadra Livre" <quadralivre3@gmail.com>',
    to,
    subject,
    html
  });
}

async function enviarEmailNovaModalidade(dev, modalidadeNome) {
  const nomeModalidadeFormatado =
    modalidadeNome.charAt(0).toUpperCase() + modalidadeNome.slice(1);

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: f9f9f9#; padding: 20px; border-radius: 10px; color: #333;">
    <h2 style="color: #f9f9f9;">Olá, ${dev.nome}!</h2>
    <p>Informamos que uma nova modalidade foi cadastrada no sistema:</p>
    <p style="font-size: 16px;">
      <strong>${nomeModalidadeFormatado}</strong>
    </p>
    <p class="aviso" style="color: #3b82f6;">
      No momento, ainda não há placar configurado para esta modalidade.
    </p>
    <br/>
    <p>
      Atenciosamente,<br/>Equipe QuadraLivre
    </p>
  </div>
  `;

  return enviarEmail({
    to: dev.email,
    subject: `Nova modalidade cadastrada`,
    html
  });
}

module.exports = { enviarEmail, enviarEmailNovaModalidade };