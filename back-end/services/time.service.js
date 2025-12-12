const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { criarPlacar } = require('./placar.service');

async function criarTime({ nome, foto, modalidadeId }) {
  const time = await prisma.time.create({
    data: { 
      nome: nome.trim(), 
      foto, 
      modalidadeId: Number(modalidadeId) 
    },
  });

  await criarPlacar({ timeId: time.id });
  return time;
}

async function removerTime(id) {
  const timeId = Number(id);

  await prisma.usuarioTime.deleteMany({ where: { timeId } });

  await prisma.agendamento.deleteMany({ where: { timeId } });

  const jogadores = await prisma.jogador.findMany({ where: { timeId } });
  if (jogadores.length > 0) {
    const jogadorIds = jogadores.map(j => j.id);

    await prisma.jogadorPartida.deleteMany({
      where: { jogadorId: { in: jogadorIds } }
    });

    await prisma.jogador.deleteMany({ where: { timeId } });
  }

  await prisma.placar.deleteMany({ where: { timeId } });

  const partidasDoTime = await prisma.partida.findMany({
    where: { OR: [{ timeAId: timeId }, { timeBId: timeId }] },
    select: { id: true }
  });

  if (partidasDoTime.length > 0) {
    const partidaIds = partidasDoTime.map(p => p.id);

    await prisma.partidaUsuario.deleteMany({
      where: { partidaId: { in: partidaIds } }
    });

    await prisma.jogadorPartida.deleteMany({
      where: { partidaId: { in: partidaIds } }
    });
  }

  await prisma.partida.deleteMany({
    where: { OR: [{ timeAId: timeId }, { timeBId: timeId }] }
  });

  return prisma.time.delete({ where: { id: timeId } });
}

async function listarTimesPorModalidade(modalidadeId) {
  return prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    include: {
      modalidade: true,
      placar: true,
      _count: { select: { jogadores: true } }
    },
    orderBy: { nome: 'asc' },
  });
}

async function listarTodosTimes() {
  return prisma.time.findMany({
    include: { modalidade: true, placar: true },
    orderBy: { nome: 'asc' },
  });
}

module.exports = { criarTime, removerTime, listarTimesPorModalidade, listarTodosTimes };