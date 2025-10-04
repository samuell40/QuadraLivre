const { PrismaClient } = require('@prisma/client');
const { enviarEmailNovaModalidade } = require('./email.service')
const { criarPlacar } = require('./placar.service');
const prisma = new PrismaClient();

async function cadastrarModalidade(nome) {
  const existente = await prisma.modalidade.findUnique({ where: { nome } });
  if (existente) throw new Error(`A modalidade "${nome}" já existe.`);

  const modalidade = await prisma.modalidade.create({ data: { nome } });

  const placar = await prisma.placar.findFirst({
    where: { time: { modalidadeId: modalidade.id } },
    include: { time: true }
  });

  if (!placar) {
    const ID_DESENVOLVEDOR_SISTEMA = 1;
    const desenvolvedores = await prisma.usuario.findMany({
      where: { permissaoId: ID_DESENVOLVEDOR_SISTEMA },
      select: { nome: true, email: true }
    });

    for (const dev of desenvolvedores) {
      await enviarEmailNovaModalidade(dev, modalidade.nome);
    }
  }

  return modalidade;
}

 async function removerModalidade(id) {
  const modalidadeId = Number(id);

  const times = await prisma.time.findMany({
    where: { modalidadeId },
    select: { id: true }
  });
  const timeIds = times.map(t => t.id);

  if (timeIds.length > 0) {
    const jogadores = await prisma.jogador.findMany({
      where: { timeId: { in: timeIds } },
      select: { id: true, timeId: true }
    });
    const jogadorIds = jogadores.map(j => j.id);

    if (jogadorIds.length > 0) {
      await prisma.jogadorPartida.deleteMany({ where: { jogadorId: { in: jogadorIds } } });
      await prisma.jogador.deleteMany({ where: { id: { in: jogadorIds } } });
    }

    await prisma.placar.deleteMany({ where: { timeId: { in: timeIds } } });

    const partidas = await prisma.partida.findMany({
      where: { OR: [{ timeAId: { in: timeIds } }, { timeBId: { in: timeIds } }] },
      select: { id: true }
    });
    const partidaIds = partidas.map(p => p.id);

    if (partidaIds.length > 0) {
      await prisma.partidaUsuario.deleteMany({ where: { partidaId: { in: partidaIds } } });
      await prisma.jogadorPartida.deleteMany({ where: { partidaId: { in: partidaIds } } });
    }

    await prisma.partida.deleteMany({ where: { id: { in: partidaIds } } });
  }

  await prisma.time.deleteMany({ where: { id: { in: timeIds } } });

  return prisma.modalidade.delete({ where: { id: modalidadeId } });
}

async function listarModalidades() {
  return prisma.modalidade.findMany({ include: { times: true, quadras: true } });
}

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

module.exports = {
  cadastrarModalidade,
  removerModalidade,
  listarModalidades,
  criarTime,
  removerTime,
  listarTimesPorModalidade,
  listarTodosTimes
};