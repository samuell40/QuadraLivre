const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarPartida(data, usuarioId) {
  const { modalidadeId, timeAId, timeBId, quadraId, campeonatoId, jogadores = [] } = data;

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
    jogadoresPartida: {
      create: jogadores.map(j => ({
        jogadorId: Number(j.jogadorId),
        timeId: Number(j.timeId), 
      })),
    },
  };

  if (quadraId) dataPartida.quadraId = Number(quadraId);
  if (campeonatoId) dataPartida.campeonatoId = Number(campeonatoId);

  const partida = await prisma.partida.create({
    data: dataPartida,
    include: {
      campeonato: true,
      modalidade: true,
      timeA: true,
      timeB: true,
      usuarioCriador: true,
      jogadoresPartida: {
        include: {
          jogador: true,
          time: true,
        },
      },
      participantes: {
        include: { usuario: true },
      },
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
      timeA: { include: { placares: true } },
      timeB: { include: { placares: true } },
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

async function listarPartidasemAndamento(modalidadeId, campeonatoId) {
  const where = {
    finalizada: false,
    emIntervalo: false,
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

async function listarPartidasPausadas(modalidadeId, campeonatoId) {
  try {
    const partidasPausadas = await prisma.partida.findMany({
      where: {
        modalidadeId: Number(modalidadeId),
        campeonatoId: Number(campeonatoId),
        partidaIniciada: true,
        finalizada: false,
        emIntervalo: true 
      },
      include: {
        timeA: true,
        timeB: true,
        quadra: true
      },
      orderBy: {
        data: 'desc'
      }
    });

    return partidasPausadas;
  } catch (error) {
    console.error('Erro no service listarPartidasPausadas:', error);
    throw error;
  }
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
      timeA: { include: { placares: true } },
      timeB: { include: { placares: true } },
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
      timeA: { include: { placares: true } },
      timeB: { include: { placares: true } },
      modalidade: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });
}

async function retornarPartidaEmAndamento(partidaId) {
  const partida = await prisma.partida.findFirst({
    where: {
      id: Number(partidaId),
      finalizada: false,
      partidaIniciada: true,
      emIntervalo: false
    },
    include: {
      modalidade: true,
      quadra: true,

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

      jogadoresPartida: {
        include: {
          jogador: {
            include: {
              funcao: true,
              times: {
                include: {
                  time: true
                }
              }
            }
          }
        }
      },
      participantes: {
        include: {
          usuario: true,
          permissao: true
        }
      },

      usuarioCriador: true
    }
  });

  if (!partida) {
    throw new Error('Partida não encontrada ou não está em andamento');
  }

  return partida;
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

async function vincularJogadorPartida(partidaId, jogadorId, timeId, stats = {}) {
  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) throw new Error("Partida não encontrada");

  const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
  if (!jogador) throw new Error("Jogador não encontrado");

  if (timeId !== partida.timeAId && timeId !== partida.timeBId) {
    throw new Error("Time não pertence a esta partida");
  }

  const vinculo = await prisma.jogadorPartida.create({
    data: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorId),
      timeId: Number(timeId), 
      gols: stats.gols || 0,
      cartoesAmarelos: stats.cartoesAmarelos || 0,
      cartoesVermelhos: stats.cartoesVermelhos || 0,
    },
  });

  return vinculo;
}

async function listarJogadoresSelecionados(partidaId) {
  const jogadoresPartida = await prisma.jogadorPartida.findMany({
    where: { partidaId: Number(partidaId) },
    include: {
      time: {
        select: {
          id: true,
          nome: true,
          foto: true
        }
      },
      jogador: {
        select: {
          id: true,
          nome: true,
          foto: true,
          funcao: {
            select: { nome: true }
          }
        }
      }
    }
  });

  return jogadoresPartida.map(jp => ({
    id: jp.jogador.id,
    nome: jp.jogador.nome,
    foto: jp.jogador.foto,
    funcao: jp.jogador.funcao?.nome,

    timeId: jp.time.id,
    timeNome: jp.time.nome,
    timeFoto: jp.time.foto,

    gols: jp.gols,
    cartoesAmarelos: jp.cartoesAmarelos,
    cartoesVermelhos: jp.cartoesVermelhos
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

async function substituirJogadorPartida(partidaId, jogadorSaiId, jogadorEntraId) {
  const partida = await prisma.partida.findUnique({
    where: { id: Number(partidaId) }
  });
  if (!partida) throw new Error("Partida não encontrada");

  if (partida.finalizada)
    throw new Error("Não é possível substituir jogadores em partida finalizada");

  const jogadorEntraExistente = await prisma.jogadorPartida.findFirst({
    where: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorEntraId)
    }
  });
  if (jogadorEntraExistente)
    throw new Error("Jogador que entra já está na partida");

  const jogadorSai = await prisma.jogadorPartida.findFirst({
    where: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorSaiId)
    }
  });
  if (!jogadorSai)
    throw new Error("Jogador que sai não está na partida");


  let tipoTime;
  if (partida.timeAId === jogadorSai.timeId) tipoTime = 'A';
  else if (partida.timeBId === jogadorSai.timeId) tipoTime = 'B';
  else throw new Error("Time do jogador não pertence à partida");

  if (
    (tipoTime === 'A' && partida.substituicoesTimeA >= 3) ||
    (tipoTime === 'B' && partida.substituicoesTimeB >= 3)
  ) {
    throw new Error("Limite de 3 substituições por time atingido");
  }

  await prisma.jogadorPartida.delete({
    where: { id: jogadorSai.id }
  });

  // cria quem entra NO MESMO TIME
  const novoJogador = await prisma.jogadorPartida.create({
    data: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorEntraId),
      timeId: jogadorSai.timeId, 
      gols: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0
    }
  });

  const updateData =
    tipoTime === 'A'
      ? { substituicoesTimeA: { increment: 1 } }
      : { substituicoesTimeB: { increment: 1 } };

  await prisma.partida.update({
    where: { id: Number(partidaId) },
    data: updateData
  });

  return novoJogador;
}

 async function getJogadoresForaDaPartida(partidaId, timeId) {
    const jogadoresNaPartida = await prisma.jogadorPartida.findMany({
      where: { partidaId },
      select: { jogadorId: true }
    })

    const idsNaPartida = jogadoresNaPartida.map(j => j.jogadorId)
    const jogadoresFora = await prisma.jogadorTime.findMany({
      where: {
        timeId,
        jogadorId: {
          notIn: idsNaPartida.length ? idsNaPartida : [0]
        }
      },
      include: {
        jogador: {
          include: {
            funcao: true
          }
        }
      }
    })

    return jogadoresFora.map(jt => ({
      id: jt.jogador.id,
      nome: jt.jogador.nome,
      foto: jt.jogador.foto,
      funcao: jt.jogador.funcao?.nome,
      timeId
    }))
  }

module.exports = {
  criarPartida,
  finalizarPartida,
  excluirPartida,
  atualizarParcial,
  incrementarPlacar,
  listarPartidasemAndamento,
  listarPartidasPausadas,
  listarPartidasEncerradas,
  pausarPartida,
  retomarPartida,
  retornarPartidaEmAndamento,
  vincularUsuarioAPartida,
  vincularJogadorPartida,
  listarJogadoresSelecionados,
  atualizarAtuacaoJogadorPartida,
  substituirJogadorPartida,
  getJogadoresForaDaPartida
};