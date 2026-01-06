const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarPartida(data, usuarioId) {
  const { modalidadeId, timeAId, timeBId, quadraId, campeonatoId } = data;

  if (campeonatoId) {
    await prisma.placar.upsert({
      where: {
        campeonatoId_timeId: {
          campeonatoId: Number(campeonatoId),
          timeId: Number(timeAId),
        },
      },
      update: {},
      create: {
        campeonatoId: Number(campeonatoId),
        timeId: Number(timeAId),
      },
    });

    await prisma.placar.upsert({
      where: {
        campeonatoId_timeId: {
          campeonatoId: Number(campeonatoId),
          timeId: Number(timeBId),
        },
      },
      update: {},
      create: {
        campeonatoId: Number(campeonatoId),
        timeId: Number(timeBId),
      },
    });
  }

  const dataPartida = {
    partidaIniciada: true,
    finalizada: false,
    modalidadeId: Number(modalidadeId),
    timeAId: Number(timeAId),
    timeBId: Number(timeBId),
    usuarioCriadorId: Number(usuarioId),
  };

  if (quadraId) {
    dataPartida.quadraId = Number(quadraId);
  }

  if (campeonatoId) {
    dataPartida.campeonatoId = Number(campeonatoId);
  }

  const partida = await prisma.partida.create({
    data: dataPartida,
    include: {
      campeonato: true,
      modalidade: true,
      timeA: { include: { placares: true } },
      timeB: { include: { placares: true } },
      usuarioCriador: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } },
    },
  });

  return partida;
}

async function finalizarPartida(id, { usuarioId }) {
  const partidaAtual = await prisma.partida.findUnique({
    where: { id: Number(id) }
  })

  if (!partidaAtual) {
    throw new Error('Partida não encontrada')
  }

  const dataAtualizacao = {
    finalizada: true,
    partidaIniciada: false
  }

  if (usuarioId) {
    dataAtualizacao.usuarioCriadorId = Number(usuarioId)
  }

  return prisma.partida.update({
    where: { id: Number(id) },
    data: dataAtualizacao,
    include: {
      timeA: {
        include: {
          placares: true
        }
      },
      timeB: {
        include: {
          placares: true
        }
      },
      modalidade: true,
      usuarioCriador: true,
      jogadoresPartida: {
        include: {
          jogador: true
        }
      },
      participantes: {
        include: {
          usuario: true
        }
      }
    }
  })
}

async function excluirPartida(partidaId) {
  if (!partidaId) throw new Error("ID da partida é obrigatório");

  const id = Number(partidaId);
  await prisma.jogadorPartida.deleteMany({
    where: { partidaId: id }
  });

  await prisma.partidaUsuario.deleteMany({
    where: { partidaId: id }
  });

  return await prisma.partida.delete({
    where: { id }
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

async function listarPartidasAtivas(modalidadeId, campeonatoId) {
  const where = {
    finalizada: false,
    modalidadeId: Number(modalidadeId),
  };

  if (campeonatoId) {
    where.campeonatoId = Number(campeonatoId);
  }

  return prisma.partida.findMany({
    where,
    orderBy: {
      data: 'desc',
    },
    include: {
      modalidade: { select: { id: true, nome: true } },
      campeonato: { select: { id: true, nome: true } },
      quadra: { select: { id: true, nome: true, foto: true } },

      timeA: { select: { id: true, nome: true, foto: true } },
      timeB: { select: { id: true, nome: true, foto: true } },

      jogadoresPartida: {
        include: {
          jogador: { select: { id: true, nome: true, foto: true } },
        },
      },
      participantes: {
        include: {
          usuario: { select: { id: true, nome: true, foto: true } },
        },
      },
    },
  });
}

async function listarPartidasEncerradas(modalidadeId, campeonatoId) {
  return prisma.partida.findMany({
    where: {
      finalizada: true,
      modalidadeId: Number(modalidadeId),
      campeonatoId: Number(campeonatoId),
    },
    orderBy: {
      data: 'desc',
    },
    include: {
      modalidade: {
        select: { id: true, nome: true },
      },
      campeonato: {
        select: { id: true, nome: true },
      },
      quadra: {
        select: { id: true, nome: true },
      },
      timeA: {
        select: { id: true, nome: true, foto: true },
      },
      timeB: {
        select: { id: true, nome: true, foto: true },
      },
      jogadoresPartida: {
        include: {
          jogador: {
            select: { id: true, nome: true, foto: true },
          },
        },
      },
      participantes: {
        include: {
          usuario: {
            select: { id: true, nome: true, foto: true },
          },
        },
      },
    },
  })
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
          modalidades: true,
        },
      },
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
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

async function listarJogadoresSelecionados(partidaId) {
  const jogadores = await prisma.jogadorPartida.findMany({
    where: { partidaId: Number(partidaId) },
    include: {
      jogador: {
        select: {
          id: true,
          nome: true,
          foto: true,
          funcao: { select: { nome: true } },
          timeId: true
        }
      }
    }
  });

  return jogadores.map(jp => ({
    id: jp.jogador.id,
    nome: jp.jogador.nome,
    foto: jp.jogador.foto,
    funcao: jp.jogador.funcao?.nome || "Nenhuma",
    timeId: jp.jogador.timeId,
    gols: jp.gols || 0,
    cartoesAmarelos: jp.cartoesAmarelos || 0,
    cartoesVermelhos: jp.cartoesVermelhos || 0
  }));
}

async function atualizarAtuacaoJogadorPartida({
  jogadorId,
  partidaId,
  gols = 0,
  cartoesAmarelos = 0,
  cartoesVermelhos = 0
}) {
  let atuacao = await prisma.jogadorPartida.findFirst({
    where: {
      jogadorId: Number(jogadorId),
      partidaId: Number(partidaId),
    },
  });

  if (!atuacao) {
    atuacao = await prisma.jogadorPartida.create({
      data: {
        jogadorId: Number(jogadorId),
        partidaId: Number(partidaId),
        gols: Math.max(0, Number(gols)),
        cartoesAmarelos: Math.max(0, Number(cartoesAmarelos)),
        cartoesVermelhos: Math.max(0, Number(cartoesVermelhos)),
      },
    });
  } else {
    atuacao = await prisma.jogadorPartida.update({
      where: { id: atuacao.id },
      data: {
        gols: Math.max(0, atuacao.gols + Number(gols)),
        cartoesAmarelos: Math.max(0, atuacao.cartoesAmarelos + Number(cartoesAmarelos)),
        cartoesVermelhos: Math.max(0, atuacao.cartoesVermelhos + Number(cartoesVermelhos)),
      },
    });
  }

  return atuacao;
}

module.exports = {
  criarPartida,
  finalizarPartida,
  excluirPartida,
  atualizarParcial,
  incrementarPlacar,
  listarPartidasAtivas,
  listarPartidasEncerradas,
  pausarPartida,
  retomarPartida,
  listarPartidaAtivaUsuario,
  vincularUsuarioAPartida,
  vincularJogadorPartida,
  listarJogadoresSelecionados,
  atualizarAtuacaoJogadorPartida
};