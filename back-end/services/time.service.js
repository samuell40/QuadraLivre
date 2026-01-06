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

  await prisma.agendamento.deleteMany({
    where: { timeId }
  });
  const jogadores = await prisma.jogador.findMany({
    where: { timeId },
    select: { id: true }
  });

  const jogadorIds = jogadores.map(j => j.id);
  if (jogadorIds.length) {
    await prisma.jogadorPartida.deleteMany({
      where: { jogadorId: { in: jogadorIds } }
    });
    await prisma.jogador.deleteMany({
      where: { timeId }
    });
  }
  await prisma.placar.deleteMany({
    where: { timeId }
  });

  await prisma.campeonatoTime.deleteMany({
    where: { timeId }
  });
  const partidas = await prisma.partida.findMany({
    where: {
      OR: [{ timeAId: timeId }, { timeBId: timeId }]
    },
    select: { id: true }
  });

  const partidaIds = partidas.map(p => p.id);

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