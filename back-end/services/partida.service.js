const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarPartida(data) {
  const { modalidadeId, timeAId, timeBId } = data;
  return await prisma.partida.create({
    data: { 
      modalidadeId, 
      timeAId, 
      timeBId,
      partidaIniciada: true,  
      finalizada: false       
    }
  });
}

async function finalizarPartida(id, { pontosTimeA, pontosTimeB, tempoSegundos }) {
  return await prisma.partida.update({
    where: { id },
    data: {
      pontosTimeA,
      pontosTimeB,
      tempoSegundos,
      finalizada: true,
      partidaIniciada: false
    }
  });
}

async function atualizarParcial(id, { pontosTimeA, pontosTimeB, tempoSegundos }) {
  return await prisma.partida.update({
    where: { id },
    data: {
      pontosTimeA,
      pontosTimeB,
      tempoSegundos
    }
  });
}

async function listarPartidas() {
  return await prisma.partida.findMany({
    include: {
      timeA: true,
      timeB: true,
      modalidade: true
    }
  });
}

async function incrementarPlacar(id, incremento) {
  const camposIncrementaveis = {
    jogos: incremento.jogos || 0,
    pontuacao: incremento.pontuacao || 0,
    vitorias: incremento.vitorias || 0,
    empates: incremento.empates || 0,
    derrotas: incremento.derrotas || 0,
    golsPro: incremento.golsPro || 0,
    golsSofridos: incremento.golsSofridos || 0,
    saldoDeGols: incremento.saldoDeGols || 0,
    setsVencidos: incremento.setsVencidos || 0,
    vitoria2x0: incremento.vitoria2x0 || 0,
    vitoria2x1: incremento.vitoria2x1 || 0,
    derrota2x1: incremento.derrota2x1 || 0,
    derrota2x0: incremento.derrota2x0 || 0,
    derrotaWo: incremento.derrotaWo || 0,
    cartoesAmarelos: incremento.cartoesAmarelos || 0,
    cartoesVermelhos: incremento.cartoesVermelhos || 0
  };

  return prisma.placar.update({
    where: { id: Number(id) },
    data: Object.fromEntries(
      Object.entries(camposIncrementaveis).map(([key, value]) => [key, { increment: value }])
    ),
    include: { time: true }
  });
}

module.exports = { 
  criarPartida, 
  finalizarPartida, 
  atualizarParcial,  
  listarPartidas, 
  incrementarPlacar 
};