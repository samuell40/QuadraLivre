const prisma = require('../lib/prisma');

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

  return await prisma.$transaction(async tx => {
    const timeAtual = await tx.time.findFirst({
      where: { id: timeId, deletedAt: null }
    });

    if (!timeAtual) return null;

    await tx.treinadorTime.updateMany({
      where: { timeId, deletedAt: null },
      data: { ativo: false, deletedAt: agora }
    });

    await tx.usuarioTime.updateMany({
      where: { timeId, deletedAt: null },
      data: { ativo: false, deletedAt: agora }
    });

    await tx.agendamento.updateMany({
      where: { timeId, deletedAt: null },
      data: { deletedAt: agora }
    });

    await tx.partida.updateMany({
      where: {
        OR: [{ timeAId: timeId }, { timeBId: timeId }],
        status: { not: 'DELETADA' }
      },
      data: { status: 'DELETADA' }
    });

    await tx.jogadorTime.updateMany({
      where: { timeId, deletedAt: null },
      data: { ativo: false, deletedAt: agora }
    });

    await tx.placar.updateMany({
      where: { timeId, deletedAt: null },
      data: { visivel: false, deletedAt: agora }
    });

    await tx.campeonatoTime.updateMany({
      where: { timeId, deletedAt: null },
      data: { ativo: false, deletedAt: agora }
    });

    return tx.time.update({
      where: { id: timeId },
      data: { deletedAt: agora, ativo: false }
    });
  });
}

async function listarTimesPorModalidade(modalidadeId) {
  const times = await prisma.time.findMany({
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

  return times.map((time) => ({
    ...time,
    treinador:
      time.treinador && time.treinador.ativo && !time.treinador.deletedAt
        ? time.treinador
        : null,
  }));
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

async function atualizarFotoTime(timeId, foto) {
  const id = Number(timeId);

  const time = await prisma.time.findUnique({
    where: { id }
  });

  if (!time || time.deletedAt) {
    throw new Error('Time não encontrado');
  }

  return prisma.time.update({
    where: { id },
    data: { foto }
  });
}

module.exports = {
  criarTime,
  removerTime,
  listarTimesPorModalidade,
  listarTodosTimes,
  listarTimesPorCampeonato,
  atualizarFotoTime
};
