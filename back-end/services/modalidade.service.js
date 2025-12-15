const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { enviarEmailNovaModalidade } = require('./email.service')

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
      select: { id: true }
    });

    const jogadorIds = jogadores.map(j => j.id);

    if (jogadorIds.length > 0) {
      await prisma.jogadorPartida.deleteMany({
        where: { jogadorId: { in: jogadorIds } }
      });

      await prisma.jogador.deleteMany({
        where: { id: { in: jogadorIds } }
      });
    }

    await prisma.time.deleteMany({
      where: { modalidadeId }
    });
  }

  await prisma.modalidade.update({
    where: { id: modalidadeId },
    data: {
      quadras: {
        set: []
      }
    }
  });

  await prisma.agendamento.deleteMany({
    where: { modalidadeId }
  });

  await prisma.funcaoJogador.deleteMany({
    where: { modalidadeId }
  });

  await prisma.partida.deleteMany({
    where: { modalidadeId }
  });

  const removida = await prisma.modalidade.delete({
    where: { id: modalidadeId }
  });

  return removida;
}

  async function listarModalidades() {
    const modalidades = await prisma.modalidade.findMany({
      include: {
        _count: {
          select: {
            times: true,
            quadras: true
          }
        }
      }
    });

    return modalidades.map(m => ({
      id: m.id,
      nome: m.nome,
      foto: m.foto,
      totalTimes: m._count.times,
      totalQuadras: m._count.quadras
    }));
  }

  module.exports = { cadastrarModalidade, removerModalidade, listarModalidades };