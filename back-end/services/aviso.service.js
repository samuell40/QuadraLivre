const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('./email.service');

async function criarAviso(dados) {
  const novoAviso = await prisma.aviso.create({
    data: {
      titulo: dados.titulo,
      descricao: dados.descricao,
      foto: dados.foto,
      fixado: dados.fixado || false,
      quadraId: Number(dados.quadraId),
      autorId: Number(dados.autorId)
    },
    include: { quadra: true }
  });

  const usuarios = await prisma.usuario.findMany({
    where: { 
      NOT: { id: Number(dados.autorId) }
    },
    select: { email: true }
  });

  const listaEmails = usuarios.map(u => u.email);

  emailService.enviarEmailNovoAviso(listaEmails, novoAviso).catch(err => {
    console.error("Erro ao enviar email de aviso:", err);
  });

  return novoAviso;
}

async function listarAvisosPorQuadra(idDaQuadra) {
  return await prisma.aviso.findMany({
    where: { quadraId: Number(idDaQuadra) },
    orderBy: [
      { fixado: 'desc' },
      { data: 'desc' }
    ],
    include: { 
      autor: true,
      leituras: true
    }
  });
}

async function deletarAviso(id) {
  return await prisma.aviso.delete({
    where: { id: Number(id) }
  });
}

async function alternarFixado(id, statusFixado) {
  return await prisma.aviso.update({
    where: { id: Number(id) },
    data: { fixado: statusFixado }
  });
}

async function marcarComoLido(avisoId, usuarioId) {
  const jaLeu = await prisma.avisoLeitura.findUnique({
    where: {
      usuarioId_avisoId: {
        usuarioId: Number(usuarioId),
        avisoId: Number(avisoId)
      }
    }
  });

  if (jaLeu) return jaLeu;

  return await prisma.avisoLeitura.create({
    data: {
      avisoId: Number(avisoId),
      usuarioId: Number(usuarioId)
    }
  });
}

module.exports = { 
  criarAviso, 
  listarAvisosPorQuadra, 
  deletarAviso, 
  alternarFixado, 
  marcarComoLido 
};