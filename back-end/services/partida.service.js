const { PrismaClient } = require('@prisma/client');
const { broadcast } = require('../ws-utils');
const prisma = new PrismaClient();

async function criarPartida(data, usuarioId) {
  const { modalidadeId, timeAId, timeBId } = data;

  const placarA = await prisma.placar.upsert({
    where: { timeId: timeAId },
    update: {},
    create: { time: { connect: { id: timeAId } } },
  });

  const placarB = await prisma.placar.upsert({
    where: { timeId: timeBId },
    update: {},
    create: { time: { connect: { id: timeBId } } },
  });

  const partida = await prisma.partida.create({
    data: {
      partidaIniciada: true,
      finalizada: false,
      modalidade: { connect: { id: modalidadeId } },
      timeA: { connect: { id: timeAId } },
      timeB: { connect: { id: timeBId } },
      usuarioCriador: usuarioId ? { connect: { id: Number(usuarioId) } } : undefined
    },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true,
      usuarioCriador: true
    }
  });

  partida.timeA.placarId = placarA.id;
  partida.timeB.placarId = placarB.id;

  broadcast({ tipo: "partidaIniciada", partida });
  return partida;
}

async function finalizarPartida(id, { usuarioId }) {
  const partidaAtual = await prisma.partida.findUnique({ where: { id: Number(id) } });
  if (!partidaAtual) throw new Error("Partida não encontrada");

  const dataAtualizacao = {
    finalizada: true,
    partidaIniciada: false
  };

  if (usuarioId) {
    dataAtualizacao.usuarioCriador = { connect: { id: Number(usuarioId) } };
  }

  const partidaEncerrada = await prisma.partida.update({
    where: { id: Number(id) },
    data: dataAtualizacao,
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true,
      usuarioCriador: true
    }
  });

  broadcast({ tipo: "partidaEncerrada", partida: partidaEncerrada });
  return partidaEncerrada;
}

async function atualizarParcial(
  id,
  {
    pontosTimeA,
    pontosTimeB,
    tempoSegundos,
    woTimeA,
    woTimeB,
    emIntervalo,
    faltasTimeA,
    faltasTimeB,
    substituicoesTimeA,
    substituicoesTimeB,
    cartoesAmarelosTimeA,
    cartoesAmarelosTimeB,
    cartoesVermelhosTimeA,
    cartoesVermelhosTimeB
  }
) {
  const partida = await prisma.partida.update({
    where: { id: Number(id) },
    data: {
      pontosTimeA,
      pontosTimeB,
      tempoSegundos,
      woTimeA,
      woTimeB,
      emIntervalo,
      faltasTimeA,
      faltasTimeB,
      substituicoesTimeA,
      substituicoesTimeB,
      cartoesAmarelosTimeA,
      cartoesAmarelosTimeB,
      cartoesVermelhosTimeA,
      cartoesVermelhosTimeB
    },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true
    }
  });

  broadcast({ tipo: "placarUpdate", partidaId: partida.id, partida });
  return partida;
}

async function incrementarPlacar(placarId, incremento, usuarioId) {
  let placar = await prisma.placar.findUnique({ where: { id: Number(placarId) } });

  const camposIncrementaveis = {
    jogos: incremento.jogos,
    pontuacao: incremento.pontuacao,
    vitorias: incremento.vitorias,
    empates: incremento.empates,
    derrotas: incremento.derrotas,
    golsPro: incremento.golsPro,
    golsSofridos: incremento.golsSofridos,
    saldoDeGols: incremento.saldoDeGols,
    setsVencidos: incremento.setsVencidos,
    vitoria2x0: incremento.vitoria2x0,
    vitoria2x1: incremento.vitoria2x1,
    derrota2x1: incremento.derrota2x1,
    derrota2x0: incremento.derrota2x0,
    derrotaWo: incremento.derrotaWo,
    cartoesAmarelos: incremento.cartoesAmarelos,
    cartoesVermelhos: incremento.cartoesVermelhos
  };

  const data = Object.fromEntries(
    Object.entries(camposIncrementaveis)
      .filter(([_, value]) => typeof value === "number")
      .map(([key, value]) => [key, { increment: value }])
  );

  placar = await prisma.placar.update({
    where: { id: Number(placarId) },
    data,
    include: { time: true }
  });

  broadcast({ tipo: "placarIncrementado", placar });
  return placar;
}

async function listarPartidas() {
  return await prisma.partida.findMany({
    orderBy: { data: 'desc' },
    include: {
      modalidade: { select: { id: true, nome: true } },
      timeA: { select: { id: true, nome: true, foto: true } },
      timeB: { select: { id: true, nome: true, foto: true } },
      usuarioCriador: { select: { id: true, nome: true, email: true } }
    }
  });
}

async function listarPartidasAtivas() {
  return await prisma.partida.findMany({
    where: { finalizada: false },
    orderBy: { data: 'desc' },
    include: {
      modalidade: { select: { id: true, nome: true } },
      timeA: { select: { id: true, nome: true, foto: true } },
      timeB: { select: { id: true, nome: true, foto: true } }
    }
  });
}

async function listarPartidasEncerradas() {
  return await prisma.partida.findMany({
    where: { finalizada: true },
    orderBy: { data: 'desc' },
    include: {
      modalidade: { select: { id: true, nome: true } },
      timeA: { select: { id: true, nome: true, foto: true } },
      timeB: { select: { id: true, nome: true, foto: true } }
    }
  });
}

async function pausarPartida(id) {
  const partida = await prisma.partida.update({
    where: { id: Number(id) },
    data: { emIntervalo: true },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true
    }
  });

  broadcast({
    tipo: "partidaPausada",
    partida
  });

  return partida;
}

async function retomarPartida(id) {
  const partida = await prisma.partida.update({
    where: { id: Number(id) },
    data: { emIntervalo: false },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true
    }
  });

  broadcast({
    tipo: "partidaRetomada",
    partida
  });

  return partida;
}

async function listarPartidaAtivaUsuario(usuarioId) {
  return await prisma.partida.findFirst({
    where: {
      finalizada: false,
      usuarioCriadorId: Number(usuarioId)
    },
    orderBy: { data: 'desc' },
    select: {
      id: true,
      data: true,
      pontosTimeA: true,
      pontosTimeB: true,
      tempoSegundos: true,
      emIntervalo: true,
      faltasTimeA: true,
      faltasTimeB: true,
      substituicoesTimeA: true,
      substituicoesTimeB: true,
      cartoesAmarelosTimeA: true,
      cartoesAmarelosTimeB: true,
      cartoesVermelhosTimeA: true,
      cartoesVermelhosTimeB: true,
      woTimeA: true,
      woTimeB: true,
      modalidade: { select: { id: true, nome: true } },
      timeA: { select: { id: true, nome: true, foto: true, placar: true } },
      timeB: { select: { id: true, nome: true, foto: true, placar: true } }

    }
  });
}

async function limparPartidasPorModalidade(modalidadeId) {
  if (!modalidadeId) throw new Error("ID da modalidade é obrigatório");

  const partidas = await prisma.partida.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    include: {
      timeA: true,
      timeB: true,
      modalidade: true,
    }
  });

  await prisma.partida.deleteMany({
    where: { modalidadeId: Number(modalidadeId) }
  });

  broadcast({ tipo: "partidasRemovidas", modalidadeId });
}

module.exports = {
  criarPartida,
  finalizarPartida,
  atualizarParcial,
  incrementarPlacar,
  listarPartidas,
  listarPartidasAtivas,
  listarPartidasEncerradas,
  pausarPartida,
  retomarPartida,
  listarPartidaAtivaUsuario,
  limparPartidasPorModalidade
};