const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarPartida(data, usuarioId) {
  const { modalidadeId, timeAId, timeBId, quadraId } = data;

  await prisma.placar.upsert({
    where: { timeId: timeAId },
    update: {},
    create: { timeId: timeAId },
  });

  await prisma.placar.upsert({
    where: { timeId: timeBId },
    update: {},
    create: { timeId: timeBId },
  });

  const partida = await prisma.partida.create({
    data: {
      partidaIniciada: true,
      finalizada: false,
      modalidadeId,
      quadraId,
      timeAId,
      timeBId,
      usuarioCriadorId: usuarioId ? Number(usuarioId) : undefined
    },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true,
      usuarioCriador: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });

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
    dataAtualizacao.usuarioCriadorId = Number(usuarioId);
  }

  return prisma.partida.update({
    where: { id: Number(id) },
    data: dataAtualizacao,
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true,
      usuarioCriador: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
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
    substituicoesTimeB
  }
) {
  return prisma.partida.update({
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
      substituicoesTimeB
    },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
}

async function incrementarPlacar(placarId, incremento) {
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
    vitoria3x0: incremento.vitoria3x0,
    vitoria3x2: incremento.vitoria3x2,
    derrota2x3: incremento.derrota2x3,
    derrota0x3: incremento.derrota0x3,
    derrotaWo: incremento.derrotaWo
  };

  const data = Object.fromEntries(
    Object.entries(camposIncrementaveis)
      .filter(([_, value]) => typeof value === "number")
      .map(([key, value]) => [key, { increment: value }])
  );

  return prisma.placar.update({
    where: { id: Number(placarId) },
    data,
    include: { time: true }
  });
}

async function listarPartidas() {
  return prisma.partida.findMany({
    orderBy: { data: 'desc' },
    include: {
      modalidade: { select: { id: true, nome: true } },
      timeA: { select: { id: true, nome: true, foto: true, placar: true } },
      timeB: { select: { id: true, nome: true, foto: true, placar: true } },
      usuarioCriador: { select: { id: true, nome: true, email: true } },
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
}

async function listarPartidasAtivas() {
  return prisma.partida.findMany({
    where: { finalizada: false },
    orderBy: { data: 'desc' },
    include: {
      modalidade: { select: { id: true, nome: true } },
      timeA: { select: { id: true, nome: true, foto: true, placar: true } },
      timeB: { select: { id: true, nome: true, foto: true, placar: true } },
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
}

async function listarPartidasEncerradas() {
  return prisma.partida.findMany({
    where: { finalizada: true },
    orderBy: { data: 'desc' },
    include: {
      modalidade: { select: { id: true, nome: true } },
      timeA: { select: { id: true, nome: true, foto: true, placar: true } },
      timeB: { select: { id: true, nome: true, foto: true, placar: true } },
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
}

async function pausarPartida(id) {
  return prisma.partida.update({
    where: { id: Number(id) },
    data: { emIntervalo: true },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
}

async function retomarPartida(id) {
  return prisma.partida.update({
    where: { id: Number(id) },
    data: { emIntervalo: false },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
}

async function listarPartidaAtivaUsuario(usuarioId) {
  return prisma.partida.findFirst({
    where: {
      finalizada: false,
      usuarioCriadorId: Number(usuarioId)
    },
    orderBy: { data: 'desc' },
    include: {
      timeA: { include: { placar: true } },
      timeB: { include: { placar: true } },
      modalidade: true,
      quadra: {
        include: {
          modalidades: true, // pega as modalidades da quadra
        },
      },
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
}

async function limparPartidasPorModalidade(modalidadeId) {
  if (!modalidadeId) throw new Error("ID da modalidade é obrigatório");

  await prisma.partida.deleteMany({
    where: { modalidadeId: Number(modalidadeId) }
  });
}

async function vincularUsuarioAPartida(partidaId, usuarioId, permissaoId) {
  const partida = await prisma.partida.findUnique({ where: { id: Number(partidaId) } });
  if (!partida) throw new Error("Partida não encontrada");

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
  if (!usuario) throw new Error("Usuário não encontrado");

  const vinculo = await prisma.partidaUsuario.create({
    data: {
      partidaId: Number(partidaId),
      usuarioId: Number(usuarioId),
      permissaoId: Number(permissaoId)
    },
    include: { usuario: true, partida: true }
  });

  return vinculo;
}

async function vincularJogadorPartida(partidaId, jogadorId, stats = {}) {
    const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
    if (!partida) throw new Error("Partida não encontrada");

    const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
    if (!jogador) throw new Error("Jogador não encontrado");

    const vinculo = await prisma.jogadorPartida.create({
      data: {
        partidaId,
        jogadorId,
        gols: stats.gols || 0,
        cartoesAmarelos: stats.cartoesAmarelos || 0,
        cartoesVermelhos: stats.cartoesVermelhos || 0
      }
    });

    return vinculo;
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
  limparPartidasPorModalidade,
  vincularUsuarioAPartida,
  vincularJogadorPartida
};