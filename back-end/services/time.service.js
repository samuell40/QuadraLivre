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
  const agora = new Date();

  return await prisma.$transaction(async (prisma) => {

    await prisma.treinadorTime.updateMany({
      where: { timeId },
      data: { deletedAt: agora }
    });

    await prisma.usuarioTime.updateMany({
      where: { timeId },
      data: { deletedAt: agora }
    });

    await prisma.agendamento.updateMany({
      where: { timeId },
      data: { deletedAt: agora }
    });

    const partidas = await prisma.partida.findMany({
      where: {
        OR: [{ timeAId: timeId }, { timeBId: timeId }]
      },
      select: { id: true }
    });

    const partidaIds = partidas.map(p => p.id);

    if (partidaIds.length) {
      await prisma.partidaUsuario.updateMany({
        where: { partidaId: { in: partidaIds } },
        data: { deletedAt: agora }
      });

      await prisma.jogadorPartida.updateMany({
        where: { partidaId: { in: partidaIds } },
        data: { deletedAt: agora }
      });
    }

    await prisma.partida.updateMany({
      where: { OR: [{ timeAId: timeId }, { timeBId: timeId }] },
      data: { deletedAt: agora }
    });

    await prisma.jogadorTime.updateMany({
      where: { timeId },
      data: { deletedAt: agora }
    });

    await prisma.placar.updateMany({
      where: { timeId },
      data: { visivel: false }
    });

    await prisma.campeonatoTime.updateMany({
      where: { timeId },
      data: { ativo: false }
    });

    return prisma.time.update({
      where: { id: timeId },
      data: { deletedAt: agora, ativo: false }
    });

  });
}

async function listarTimesPorModalidade(modalidadeId) {
  return prisma.time.findMany({
    where: { 
      modalidadeId: Number(modalidadeId),
      deletedAt: null 
    },
    include: {
      modalidade: true,
      placares: { where: { visivel: true } },
      treinador: {
        include: {
          usuario: {
            select: { id: true, nome: true }
          }
        }
      },
      _count: { select: { jogadores: true } }
    },
    orderBy: { nome: 'asc' }
  });
}

async function listarTodosTimes() {
  return prisma.time.findMany({
    where: { deletedAt: null },
    include: {
      modalidade: true,
      placares: { where: { visivel: true } }
    },
    orderBy: { nome: 'asc' }
  });
}

async function listarTimesPorCampeonato(campeonatoId) {
  const campeonato = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) },
    include: {
      times: {
        where: { time: { deletedAt: null }, ativo: true },
        include: { 
          time: { 
            include: { _count: { select: { jogadores: true } } } 
          } 
        },
      },
    },
  });

  return campeonato.times.map(t => t.time);
}

module.exports = { criarTime, removerTime, listarTimesPorModalidade, listarTodosTimes, listarTimesPorCampeonato};