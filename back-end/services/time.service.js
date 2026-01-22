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

async function listarTimesPorCampeonato(campeonatoId) {
  try {
    const campeonato = await prisma.campeonato.findUnique({
      where: { id: Number(campeonatoId) },
      include: {
        times: {
          include: {
            time: true, // Puxa os dados do time
          },
        },
      },
    });

    if (!campeonato) return [];

    // Retorna apenas os times
    return campeonato.times.map(t => t.time);
  } catch (error) {
    console.error('Erro no service listarTimesPorCampeonato:', error);
    throw new Error('Não foi possível listar os times do campeonato.');
  }
}

module.exports = { criarTime, removerTime, listarTimesPorModalidade, listarTodosTimes, listarTimesPorCampeonato};