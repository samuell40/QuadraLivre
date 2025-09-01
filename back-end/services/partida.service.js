const { PrismaClient } = require('@prisma/client');
const { broadcast } = require('../ws-utils'); // ✅ agora importa do ws-utils
const prisma = new PrismaClient();

async function criarPartida(data) {
  const { modalidadeId, timeAId, timeBId } = data;
  const partida = await prisma.partida.create({
    data: { modalidadeId, timeAId, timeBId, partidaIniciada: true, finalizada: false },
    include: { timeA: true, timeB: true, modalidade: true }
  });

  broadcast({
    tipo: "partidaIniciada",
    partidaId: partida.id,
    modalidadeId: partida.modalidadeId,
    modalidade: partida.modalidade,
    partidaIniciada: partida.partidaIniciada,
    finalizada: partida.finalizada, // 👈 importante
    createdAt: partida.createdAt,   // 👈 manda a hora de criação
    timeA: partida.timeA,
    timeB: partida.timeB,
    pontosTimeA: partida.pontosTimeA || 0,
    pontosTimeB: partida.pontosTimeB || 0
  });


  return partida;
}

async function finalizarPartida(id, { pontosTimeA, pontosTimeB, tempoSegundos }) {
  const partida = await prisma.partida.update({
    where: { id: Number(id) },
    data: { pontosTimeA, pontosTimeB, tempoSegundos, finalizada: true, partidaIniciada: false },
    include: { timeA: true, timeB: true, modalidade: true }
  });

  broadcast({
    tipo: "placarUpdate",
    partidaId: partida.id,
    modalidadeId: partida.modalidadeId,
    partidaIniciada: partida.partidaIniciada,
    finalizada: partida.finalizada,   // 👈 ADICIONAR
    timeA: partida.timeA,
    timeB: partida.timeB,
    pontosTimeA: partida.pontosTimeA,
    pontosTimeB: partida.pontosTimeB
  });


  return partida;
}

async function atualizarParcial(id, { pontosTimeA, pontosTimeB, tempoSegundos }) {
  const partida = await prisma.partida.update({
    where: { id: Number(id) },
    data: { pontosTimeA, pontosTimeB, tempoSegundos },
    include: { timeA: true, timeB: true, modalidade: true }
  });

  broadcast({
    tipo: "placarUpdate",
    partidaId: partida.id,
    modalidadeId: partida.modalidadeId,
    partidaIniciada: partida.partidaIniciada,
    timeA: partida.timeA,
    timeB: partida.timeB,
    pontosTimeA: partida.pontosTimeA,
    pontosTimeB: partida.pontosTimeB
  });

  return partida;
}

async function pausarPartida(id) {
  const partida = await prisma.partida.update({
    where: { id: Number(id) },
    data: { emIntervalo: true },
    include: { timeA: true, timeB: true, modalidade: true }
  });

  broadcast({
    tipo: "statusUpdate",
    partidaId: partida.id,
    emIntervalo: partida.emIntervalo
  });

  return partida;
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

  const placarAtualizado = await prisma.placar.update({
    where: { id: Number(id) },
    data: Object.fromEntries(
      Object.entries(camposIncrementaveis).map(([key, value]) => [key, { increment: value }])
    ),
    include: { time: true }
  });

  broadcast({ tipo: 'placarIncrementado', placar: placarAtualizado });

  return placarAtualizado;
}

async function listarPartidas() {
  return prisma.partida.findMany({ include: { timeA: true, timeB: true, modalidade: true } });
}

async function listarPartidasAtivas() {
  return prisma.partida.findMany({
    where: { partidaIniciada: true, finalizada: false },
    include: { timeA: true, timeB: true, modalidade: true },
    orderBy: { createdAt: "desc" },
  });
}

async function listarPartidasEncerradas() {
  return prisma.partida.findMany({
    where: { finalizada: true },
    include: { timeA: true, timeB: true, modalidade: true },
    orderBy: { createdAt: "desc" },
  });
}

module.exports = {
  criarPartida,
  finalizarPartida,
  atualizarParcial,
  listarPartidas,
  listarPartidasAtivas,
  pausarPartida,
  incrementarPlacar,
  listarPartidasEncerradas
};