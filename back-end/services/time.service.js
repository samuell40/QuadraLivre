const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarTime({ nome, foto, modalidadeId }) {
  const time = await prisma.time.create({
    data: {
      nome: nome.trim(),
      foto,
      modalidadeId: Number(modalidadeId),
    },
  });

  return time;
}

async function removerTime(id) {
  const timeId = Number(id);
  await prisma.usuarioTime.deleteMany({
    where: { timeId }
  });

  // Remover agendamentos do time
  await prisma.agendamento.deleteMany({
    where: { timeId }
  });

  // Buscar partidas do time
  const partidas = await prisma.partida.findMany({
    where: {
      OR: [{ timeAId: timeId }, { timeBId: timeId }]
    },
    select: { id: true }
  });

  const partidaIds = partidas.map(p => p.id);

  // Remover vínculos de usuários e jogadores nas partidas
  if (partidaIds.length) {
    await prisma.partidaUsuario.deleteMany({
      where: { partidaId: { in: partidaIds } }
    });

    await prisma.jogadorPartida.deleteMany({
      where: { partidaId: { in: partidaIds } }
    });
  }

  await prisma.partida.deleteMany({
    where: {
      OR: [{ timeAId: timeId }, { timeBId: timeId }]
    }
  });

  await prisma.jogadorTime.deleteMany({
    where: { timeId }
  });

  // Remover placares do time
  await prisma.placar.deleteMany({
    where: { timeId }
  });

  await prisma.campeonatoTime.deleteMany({
    where: { timeId }
  });

  return prisma.time.delete({
    where: { id: timeId }
  });
}


async function listarTimesPorModalidade(modalidadeId) {
  return prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    include: {
      modalidade: true,
      placares: true,
      _count: {
        select: { jogadores: true }
      }
    },
    orderBy: { nome: 'asc' }
  });
}

async function listarTodosTimes() {
  return prisma.time.findMany({
    include: {
      modalidade: true,
      placares: true
    },
    orderBy: { nome: 'asc' }
  });
}

module.exports = { criarTime, removerTime, listarTimesPorModalidade, listarTodosTimes };