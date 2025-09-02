const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  <div style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; color: #333; box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #3b82f6; margin-top: 0; font-size: 24px;">Olá, ${dev.nome}!</h2>
      <p style="margin: 12px 0; font-size: 18px; line-height: 1.5;">
        Informamos que a modalidade <strong>${nomeModalidadeFormatado}</strong> foi cadastrada no sistema.
      </p>
      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5;">
        Atenciosamente,<br/>Equipe Quadra Livre
      </p>
    </div>
  </div>
  `;

  return enviarEmail({
    to: dev.email,
    subject: `Nova modalidade cadastrada`,
    html
  });
}

async function enviarEmailAlteracaoPermissao(usuario) {
  if (![1, 2].includes(usuario.permissaoId)) return; 

  const descricaoFormatada = formatarPermissao(usuario.permissao.descricao);

  let mensagem;

  if (usuario.permissaoId === 2) {
    mensagem = `Informamos que você foi promovido para <strong>${descricaoFormatada}</strong> e vinculado à quadra: <strong>${usuario.quadra.nome}</strong>.`;
  } else {
    mensagem = `Informamos que sua função foi atualizada para <strong>${descricaoFormatada}</strong>.`;
  }

  const html = `
  <div style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; color: #333; box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #3b82f6; margin-top: 0; font-size: 24px;">Olá, ${usuario.nome}!</h2>
      <p style="margin: 12px 0; font-size: 18px; line-height: 1.5;">
        ${mensagem}
      </p>
      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5;">
        Atenciosamente,<br/>Equipe QuadraLivre
      </p>
    </div>
  </div>
  `;

  return enviarEmail({
    to: usuario.email,
    subject: `Alteração de permissão`,
    html
  });
}

function formatarPermissao(descricao) {
  return descricao
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}


async function enviarEmailVinculoTime(usuario, time) {
  const html = `
  <div style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; color: #333; box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #3b82f6; margin-top: 0; font-size: 24px;">Olá, ${usuario.nome}!</h2>
      <p style="margin: 12px 0; font-size: 18px; line-height: 1.5;">
        Você foi vinculado ao time <strong>${time.nome}</strong> da modalidade <strong>${time.modalidade.nome}</strong>.
      </p>
      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5;">
        Atenciosamente,<br/>Equipe QuadraLivre
      </p>
    </div>
  </div>
  `;

  return enviarEmail({
    to: usuario.email,
    subject: `Vinculação a novo time`,
    html
  });
}

async function enviarEmailStatusAgendamento(agendamento) {
  const statusFormatado = agendamento.status === 'Confirmado' ? 'confirmado' : 'recusado';
  
  const html = `
  <div style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; color: #333; box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #3b82f6; margin-top: 0; font-size: 24px;">Olá, ${agendamento.usuario.nome}!</h2>
      <p style="margin: 12px 0; font-size: 18px; line-height: 1.5;">
        Seu agendamento na quadra <strong>${agendamento.quadra.nome}</strong> para a modalidade 
        <strong>${agendamento.modalidade.nome}</strong> no dia <strong>${agendamento.dia}/${agendamento.mes}/${agendamento.ano}</strong> 
        às <strong>${agendamento.hora.toString().padStart(2,'0')}:00</strong> foi <strong>${statusFormatado}</strong>.
      </p>
      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5;">
        Atenciosamente,<br/>Equipe Quadra Livre
      </p>
    </div>
  </div>
  `;

  return enviarEmail({
    to: agendamento.usuario.email,
    subject: `Agendamento ${statusFormatado} - Quadra Livre`,
    html
  });
}

module.exports = { enviarEmail, enviarEmailNovaModalidade, enviarEmailAlteracaoPermissao, enviarEmailVinculoTime, enviarEmailStatusAgendamento };