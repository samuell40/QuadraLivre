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
  if (usuario.permissaoId === 2 && usuario.quadra) {
    mensagem = `Informamos que você foi promovido para <strong>${descricaoFormatada}</strong> 
  e vinculado à quadra: <strong>${usuario.quadra.nome}</strong>.`;
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


async function enviarEmailVinculoTime(usuario, time, jogador) {
  const html = `
  <div style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; color: #333; box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #3b82f6; margin-top: 0; font-size: 24px;">
        Olá, ${usuario.nome}!
      </h2>

      <p style="margin: 12px 0; font-size: 18px; line-height: 1.5;">
        Você foi vinculado ao time <strong>${time.nome}</strong>
        da modalidade <strong>${time.modalidade.nome}</strong>.
      </p>

      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5;">
        Seu registro como jogador foi criado com o nome:
        <strong>${jogador.nome}</strong>.
      </p>

      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5;">
        Atenciosamente,<br/>
        <strong>Equipe QuadraLivre</strong>
      </p>
    </div>
  </div>
  `

  return enviarEmail({
    to: usuario.email,
    subject: 'Vinculação a novo time',
    html,
  })
}

async function enviarEmailStatusAgendamento(agendamento) {
  const statusFormatado = agendamento.status === 'Confirmado' ? 'confirmado' : 'recusado';

  let blocoMotivo = '';
  if (agendamento.status === 'Recusado' && agendamento.motivoRecusa) {
    blocoMotivo = `
      <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #991b1b; font-weight: bold; margin: 0 0 5px 0; font-size: 16px;">Motivo da Recusa:</p>
        <p style="color: #7f1d1d; margin: 0; font-size: 15px;">${agendamento.motivoRecusa}</p>
      </div>
    `;
  }

  const html = `
  <div style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; color: #333; box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #3b82f6; margin-top: 0; font-size: 24px;">Olá, ${agendamento.usuario.nome}!</h2>
      <p style="margin: 12px 0; font-size: 18px; line-height: 1.5;">
        Seu agendamento na quadra <strong>${agendamento.quadra.nome}</strong> para a modalidade 
        <strong>${agendamento.modalidade.nome}</strong> no dia <strong>${agendamento.dia}/${agendamento.mes}/${agendamento.ano}</strong> 
        às <strong>${agendamento.hora.toString().padStart(2, '0')}:00</strong> foi <strong>${statusFormatado}</strong>.
      </p>
      
      ${blocoMotivo}

      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5;">
        Atenciosamente,<br/>Equipe QuadraLivre
      </p>
    </div>
  </div>
  `;

  return enviarEmail({
    to: agendamento.usuario.email,
    subject: `Agendamento ${statusFormatado} - QuadraLivre`,
    html
  });
}

async function enviarEmailNovoAviso(emailsDestinatarios, aviso) {
  if (!emailsDestinatarios || emailsDestinatarios.length === 0) return;

  const html = `
  <div style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; color: #333; box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #1E3A8A; margin-top: 0; font-size: 24px;">Novo Aviso no Mural!</h2>
      <h3 style="color: #3b82f6;">${aviso.titulo}</h3>
      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5; white-space: pre-line;">
        ${aviso.descricao}
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        Acesse a plataforma para conferir mais detalhes.
      </p>
      <p style="margin: 12px 0; font-size: 16px; line-height: 1.5;">
        Atenciosamente,<br/>Equipe Quadra Livre
      </p>
    </div>
  </div>
  `;

  return transporter.sendMail({
    from: '"Avisos - Quadra Livre" <quadralivre3@gmail.com>',
    bcc: emailsDestinatarios, 
    subject: `📢 Novo Aviso: ${aviso.titulo}`,
    html
  });
}

module.exports = { enviarEmail, enviarEmailNovaModalidade, enviarEmailAlteracaoPermissao, enviarEmailVinculoTime, enviarEmailStatusAgendamento, enviarEmailNovoAviso };