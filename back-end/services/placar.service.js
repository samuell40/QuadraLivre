const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarPlacar({ timeId }) {
  return prisma.placar.create({
    data: {
      timeId: Number(timeId),
      jogos: 0,
      posicao: 0,
      pontuacao: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsSofridos: 0,
      saldoDeGols: 0,
      setsVencidos: 0,
      vitoria3x0: 0,
      vitoria3x2: 0,
      derrota2x3: 0,
      derrota0x3: 0,
      derrotaWo: 0,
      visivel: true
    }
  });
}

async function atualizarPlacar(id, dados) {
  return prisma.placar.update({
    where: { id: Number(id) },
    data: dados,
    include: { time: true }
  });
}

async function listarPlacarPorModalidade(modalidadeId) {
  return prisma.placar.findMany({
    where: { time: { modalidadeId: Number(modalidadeId) } },
    include: { time: true },
    orderBy: { pontuacao: 'desc' },
  });
}

async function resetarPlacarPorModalidade(modalidadeId) {
  return prisma.placar.updateMany({
    where: { time: { modalidadeId: Number(modalidadeId) } },
    data: {
      jogos: 0,
      posicao: 0,
      pontuacao: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsSofridos: 0,
      saldoDeGols: 0,
      setsVencidos: 0,
      vitoria2x0: 0,
      vitoria2x1: 0,
      derrota2x1: 0,
      derrota2x0: 0,
      derrotaWo: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0,
      visivel: true
    }
  });
}

async function ocultarPlacarGeral() {
  await prisma.placar.updateMany({ data: { visivel: false } });
  const placaresAtualizados = await prisma.placar.findMany({
    include: { time: { include: { modalidade: true } } },
    orderBy: { pontuacao: 'desc' }
  });

  return { message: 'Todos os placares foram ocultados na Home.' };
}

async function ocultarPlacarPorModalidade(modalidadeId) {
  const times = await prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    select: { id: true, modalidade: true }
  });

  const timeIds = times.map(t => t.id);

  await prisma.placar.updateMany({
    where: { timeId: { in: timeIds } },
    data: { visivel: false }
  });

  const placaresAtualizados = await prisma.placar.findMany({
    where: { timeId: { in: timeIds } },
    include: { time: { include: { modalidade: true } } },
    orderBy: { pontuacao: 'desc' }
  });

  return placaresAtualizados;
}

async function mostrarPlacarGeral() {
  await prisma.placar.updateMany({ data: { visivel: true } });

  const placaresAtualizados = await prisma.placar.findMany({
    include: { time: { include: { modalidade: true } } },
    orderBy: { pontuacao: 'desc' }
  });

  return placaresAtualizados;
}

async function mostrarPlacarPorModalidade(modalidadeId) {
  const times = await prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    select: { id: true, modalidade: true }
  });

  const timeIds = times.map(t => t.id);

  await prisma.placar.updateMany({
    where: { timeId: { in: timeIds } },
    data: { visivel: true }
  });

  const placaresAtualizados = await prisma.placar.findMany({
    where: { timeId: { in: timeIds } },
    include: { time: { include: { modalidade: true } } },
    orderBy: { pontuacao: 'desc' }
  });

  return placaresAtualizados;
}

async function listarVisibilidade() {
  const modalidades = await prisma.modalidade.findMany({
    select: { id: true, nome: true }
  });

  const resultado = await Promise.all(
    modalidades.map(async (m) => {
      const placar = await prisma.placar.findFirst({
        where: { time: { modalidadeId: m.id } },
        select: { visivel: true }
      });

      return {
        modalidadeId: m.id,
        nome: m.nome,
        visivel: placar?.visivel ?? true
      };
    })
  );

  return resultado;
}

module.exports = {
  criarPlacar,
  atualizarPlacar,
  listarPlacarPorModalidade,
  resetarPlacarPorModalidade,
  ocultarPlacarGeral,
  ocultarPlacarPorModalidade,
  mostrarPlacarGeral,
  mostrarPlacarPorModalidade,
  listarVisibilidade
};