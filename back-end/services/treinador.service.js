const { PrismaClient } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { enviarEmailVinculoTreinador } = require('./email.service');

async function tornarUsuarioTreinador(usuarioId, timeId) {
  // garante que usuario existe
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      nome: true,
      email: true,
    },
  });

  if (!usuario) {
    throw new Error('Usuario nao encontrado');
  }

  // garante que o time existe
  const time = await prisma.time.findUnique({
    where: { id: timeId },
    include: {
      modalidade: true,
    },
  });

  if (!time) {
    throw new Error('Time nao encontrado');
  }

  // remove vinculos de jogador do usuario ao promover para treinador
  await prisma.usuarioTime.deleteMany({
    where: { usuarioId },
  });

  // Mantem vinculos anteriores do treinador e aplica apenas no time selecionado.
  // Cada time continua com apenas 1 treinador (timeId unico).
  const treinadorTime = await prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: usuarioId },
      data: {
        permissaoId: 5,
      },
    });

    return tx.treinadorTime.upsert({
      where: { timeId },
      update: {
        usuarioId,
        ativo: true,
        deletedAt: null,
      },
      create: {
        usuarioId,
        timeId,
      },
    });
  });

  try {
    await enviarEmailVinculoTreinador(usuario, time);
  } catch (erroEmail) {
    console.error('Erro ao enviar email de vinculacao de treinador:', erroEmail);
  }

  return treinadorTime;
}

module.exports = { tornarUsuarioTreinador };
