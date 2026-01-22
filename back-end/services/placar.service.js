const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarPlacar({ campeonatoId, timeId }) {
  return prisma.placar.create({
    data: {
      campeonatoId: Number(campeonatoId),
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
    include: {
      time: true,
      campeonato: true
    }
  });
}

async function listarPlacarPorCampeonato(campeonatoId) {
  return prisma.placar.findMany({
    where: {
      campeonatoId: Number(campeonatoId),
      visivel: true
    },
    include: {
      time: true,
      campeonato: true
    },
    orderBy: {
      pontuacao: 'desc'
    }
  });
}


module.exports = { criarPlacar, atualizarPlacar, listarPlacarPorCampeonato };