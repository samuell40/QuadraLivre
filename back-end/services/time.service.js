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

  // 1️⃣ Usuários vinculados ao time
  await prisma.usuarioTime.deleteMany({
    where: { timeId }
  });

  // 2️⃣ Agendamentos do time
  await prisma.agendamento.deleteMany({
    where: { timeId }
  });

  // 3️⃣ Buscar jogadores do time
  const jogadores = await prisma.jogador.findMany({
    where: { timeId },
    select: { id: true }
  });

  const jogadorIds = jogadores.map(j => j.id);

  // 4️⃣ Atuações dos jogadores
  if (jogadorIds.length) {
    await prisma.jogadorPartida.deleteMany({
      where: { jogadorId: { in: jogadorIds } }
    });

    // 5️⃣ Jogadores
    await prisma.jogador.deleteMany({
      where: { timeId }
    });
  }

  // 6️⃣ Placares
  await prisma.placar.deleteMany({
    where: { timeId }
  });

  // 🔥 7️⃣ CampeonatoTime (FALTAVA)
  await prisma.campeonatoTime.deleteMany({
    where: { timeId }
  });

  // 8️⃣ Partidas do time
  const partidas = await prisma.partida.findMany({
    where: {
      OR: [{ timeAId: timeId }, { timeBId: timeId }]
    },
    select: { id: true }
  });

  const partidaIds = partidas.map(p => p.id);

  if (partidaIds.length) {
    // 9️⃣ Usuários nas partidas
    await prisma.partidaUsuario.deleteMany({
      where: { partidaId: { in: partidaIds } }
    });

    // 🔁 Atuações por partida (segurança)
    await prisma.jogadorPartida.deleteMany({
      where: { partidaId: { in: partidaIds } }
    });
  }

  // 🔟 Partidas
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