const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarTime({ nome, foto, modalidadeId, treinadorId }) {
  const time = await prisma.time.create({
    data: {
      nome: nome.trim(),
      foto,
      modalidadeId: Number(modalidadeId),
    },
  });

  // se veio treinador, cria o vínculo
  if (treinadorId) {
    await prisma.treinadorTime.create({
      data: {
        usuarioId: Number(treinadorId),
        timeId: time.id,
      },
    });
  }

  return time;
}

async function removerTime(id) {
  const timeId = Number(id);

  // treinador do time (❌ estava faltando)
  await prisma.treinadorTime.deleteMany({
    where: { timeId }
  });

  await prisma.usuarioTime.deleteMany({
    where: { timeId }
  });

  await prisma.agendamento.deleteMany({
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

  await prisma.jogadorTime.deleteMany({
    where: { timeId }
  });

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
      treinador: {
        include: {
          usuario: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      },
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