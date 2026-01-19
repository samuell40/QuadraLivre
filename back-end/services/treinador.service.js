const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function tornarUsuarioTreinador(usuarioId, timeId) {
  // garante que usuário existe
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  // garante que o time existe
  const time = await prisma.time.findUnique({
    where: { id: timeId },
  });

  if (!time) {
    throw new Error('Time não encontrado');
  }

  // remove vínculos antigos do usuário
  await prisma.usuarioTime.deleteMany({
    where: { usuarioId },
  });

  await prisma.treinadorTime.deleteMany({
    where: { usuarioId },
  });

  // remove treinador antigo do time (1 treinador por time)
  await prisma.treinadorTime.deleteMany({
    where: { timeId },
  });

  // atualiza permissão para treinador (5)
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      permissaoId: 5,
    },
  });

  // cria vínculo treinador ↔ time
  const treinadorTime = await prisma.treinadorTime.create({
    data: {
      usuarioId,
      timeId,
    },
  });

  return treinadorTime;
}

module.exports = { tornarUsuarioTreinador };