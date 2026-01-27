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
        emCampo: true
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
  const partida = await prisma.partida.findUnique({
    where: { id: Number(id) },
    include: {
      timeA: { include: { placares: true } },
      timeB: { include: { placares: true } },
      modalidade: true
    }
  });

  if (!partida) throw new Error("Partida não encontrada");

  await prisma.partida.update({
    where: { id: Number(id) },
    data: { finalizada: true, partidaIniciada: false }
  });

  const isVolei = partida.modalidade.nome.toLowerCase().includes("vôlei");
  const isFutsal = partida.modalidade.nome.toLowerCase().includes("futsal");

  let incrementoA = {};
  let incrementoB = {};

  /* VÔLEI */
  if (isVolei) {
    let pontosA = 0;
    let pontosB = 0;

    const woA = partida.woTimeA === true;
    const woB = partida.woTimeB === true;
    if (woA || woB) {

      if (woA) {
        pontosA = 0;
        pontosB = 3;
      }

      if (woB) {
        pontosA = 3;
        pontosB = 0;
      }

      incrementoA = {
        jogos: 1,
        setsVencidos: woB ? 3 : 0,
        vitorias: woB ? 1 : 0,
        derrotas: woA ? 1 : 0,
        pontuacao: pontosA,
        vitoria3x0: woB ? 1 : 0,
        derrota0x3: woA ? 1 : 0,
        derrotaWo: woA ? 1 : 0
      };

      incrementoB = {
        jogos: 1,
        setsVencidos: woA ? 3 : 0,
        vitorias: woA ? 1 : 0,
        derrotas: woB ? 1 : 0,
        pontuacao: pontosB,
        vitoria3x0: woA ? 1 : 0,
        derrota0x3: woB ? 1 : 0,
        derrotaWo: woB ? 1 : 0
      };
    }

    else {
      if (partida.pontosTimeA > partida.pontosTimeB) {
        pontosA = partida.pontosTimeB === 2 ? 2 : 3;
        pontosB = partida.pontosTimeB === 2 ? 1 : 0;
      } else if (partida.pontosTimeB > partida.pontosTimeA) {
        pontosB = partida.pontosTimeA === 2 ? 2 : 3;
        pontosA = partida.pontosTimeA === 2 ? 1 : 0;
      }

      incrementoA = {
        jogos: 1,
        setsVencidos: partida.pontosTimeA,
        vitorias: partida.pontosTimeA > partida.pontosTimeB ? 1 : 0,
        derrotas: partida.pontosTimeA < partida.pontosTimeB ? 1 : 0,
        pontuacao: pontosA,
        vitoria3x0: partida.pontosTimeA === 3 && partida.pontosTimeB <= 1 ? 1 : 0,
        vitoria3x2: partida.pontosTimeA === 3 && partida.pontosTimeB === 2 ? 1 : 0,
        derrota2x3: partida.pontosTimeA === 2 && partida.pontosTimeB === 3 ? 1 : 0,
        derrota0x3: partida.pontosTimeA === 0 && partida.pontosTimeB === 3 ? 1 : 0
      };

      incrementoB = {
        jogos: 1,
        setsVencidos: partida.pontosTimeB,
        vitorias: partida.pontosTimeB > partida.pontosTimeA ? 1 : 0,
        derrotas: partida.pontosTimeB < partida.pontosTimeA ? 1 : 0,
        pontuacao: pontosB,
        vitoria3x0: partida.pontosTimeB === 3 && partida.pontosTimeA <= 1 ? 1 : 0,
        vitoria3x2: partida.pontosTimeB === 3 && partida.pontosTimeA === 2 ? 1 : 0,
        derrota2x3: partida.pontosTimeB === 2 && partida.pontosTimeA === 3 ? 1 : 0,
        derrota0x3: partida.pontosTimeB === 0 && partida.pontosTimeA === 3 ? 1 : 0
      };
    }
  }

  /*FUTEBOL*/
  else {
    let pontosA = 0;
    let pontosB = 0;

    if (partida.pontosTimeA > partida.pontosTimeB) pontosA = 3;
    else if (partida.pontosTimeB > partida.pontosTimeA) pontosB = 3;
    else {
      pontosA = 1;
      pontosB = 1;
    }

    incrementoA = {
      jogos: 1,
      vitorias: partida.pontosTimeA > partida.pontosTimeB ? 1 : 0,
      empates: partida.pontosTimeA === partida.pontosTimeB ? 1 : 0,
      derrotas: partida.pontosTimeA < partida.pontosTimeB ? 1 : 0,
      golsPro: partida.pontosTimeA,
      golsSofridos: partida.pontosTimeB,
      saldoDeGols: partida.pontosTimeA - partida.pontosTimeB,
      pontuacao: pontosA
    };

    incrementoB = {
      jogos: 1,
      vitorias: partida.pontosTimeB > partida.pontosTimeA ? 1 : 0,
      empates: partida.pontosTimeB === partida.pontosTimeA ? 1 : 0,
      derrotas: partida.pontosTimeB < partida.pontosTimeA ? 1 : 0,
      golsPro: partida.pontosTimeB,
      golsSofridos: partida.pontosTimeA,
      saldoDeGols: partida.pontosTimeB - partida.pontosTimeA,
      pontuacao: pontosB
    };
  }
  if (partida.campeonatoId) {
    const placarA = await obterOuCriarPlacar(
      partida.campeonatoId,
      partida.timeAId
    );

    const placarB = await obterOuCriarPlacar(
      partida.campeonatoId,
      partida.timeBId
    );

    await incrementarPlacar(placarA.id, incrementoA);
    await incrementarPlacar(placarB.id, incrementoB);
  }

  return partida;
}

async function obterOuCriarPlacar(campeonatoId, timeId) {
  return prisma.placar.upsert({
    where: {
      campeonatoId_timeId: {
        campeonatoId: Number(campeonatoId),
        timeId: Number(timeId),
      },
    },
    update: {},
    create: {
      campeonatoId: Number(campeonatoId),
      timeId: Number(timeId),
    },
  });
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
    sets,

    // comuns futebol / futsal
    faltasTimeA,
    faltasTimeB,
    substituicoesTimeA,
    substituicoesTimeB,
    cartoesAmarelosTimeA,
    cartoesVermelhosTimeA,
    cartoesAmarelosTimeB,
    cartoesVermelhosTimeB
  }
) {
  // 🔎 busca a modalidade antes
  const partidaBase = await prisma.partida.findUnique({
    where: { id: Number(id) },
    include: { modalidade: true }
  });

  if (!partidaBase) throw new Error("Partida não encontrada");

  const modalidade = partidaBase.modalidade.nome.toLowerCase();
  const isVolei = modalidade.includes("vôlei");
  const isFutebol = modalidade.includes("futebol");
  const isFutsal = modalidade.includes("futsal");

  // 🧠 dados comuns a todas
  const dataUpdate = {
    pontosTimeA,
    pontosTimeB,
    tempoSegundos,
    woTimeA,
    woTimeB,
    emIntervalo
  };

  // ⚽ FUTEBOL / FUTSAL
  if (isFutebol || isFutsal) {
    Object.assign(dataUpdate, {
      faltasTimeA,
      faltasTimeB,
      substituicoesTimeA,
      substituicoesTimeB,
      cartoesAmarelosTimeA,
      cartoesVermelhosTimeA,
      cartoesAmarelosTimeB,
      cartoesVermelhosTimeB
    });
  }

  // 🏐 VÔLEI → sets tratados separadamente
  const partidaAtualizada = await prisma.partida.update({
    where: { id: Number(id) },
    data: dataUpdate,
    include: {
      timeA: { include: { placares: true } },
      timeB: { include: { placares: true } },
      modalidade: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } }
    }
  });

  // 🏐 Persistência dos sets (somente vôlei)
  if (isVolei && Array.isArray(sets) && sets.length > 0) {
    for (const set of sets) {
      await prisma.setPartida.upsert({
        where: {
          partidaId_numero: {
            partidaId: Number(id),
            numero: set.numero
          }
        },
        update: {
          pontosA: set.pontosA,
          pontosB: set.pontosB
        },
        create: {
          partidaId: Number(id),
          numero: set.numero,
          pontosA: set.pontosA,
          pontosB: set.pontosB
        }
      });
    }
  }

  return partidaAtualizada;
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
    select: {
      id: true,
      tempoSegundos: true,
      partidaIniciada: true,

      // (FUTEBOL)
      pontosTimeA: true,
      pontosTimeB: true,
      faltasTimeA: true,
      faltasTimeB: true,

      substituicoesTimeA: true,
      substituicoesTimeB: true,
      cartoesAmarelosTimeA: true,
      cartoesVermelhosTimeA: true,
      cartoesAmarelosTimeB: true,
      cartoesVermelhosTimeB: true,

      // 🏐 VÔLEI
      woTimeA: true,
      woTimeB: true,

      modalidadeId: true,
      quadraId: true,
      campeonatoId: true,
      timeAId: true,
      timeBId: true,

      modalidade: true,
      quadra: true,

      timeA: true,
      timeB: true,

      sets: {
        orderBy: {
          numero: 'asc'
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
      gols: stats.gols,
      cartoesAmarelos: stats.cartoesAmarelos,
      cartoesVermelhos: stats.cartoesVermelhos,
      emCampo: true
    },
  });

  return vinculo;
}

async function listarJogadoresSelecionados(partidaId) {
  const jogadoresPartida = await prisma.jogadorPartida.findMany({
    where: {
      partidaId: Number(partidaId),
      emCampo: true
    },
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
  const partida = await prisma.partida.findUnique({
    where: { id: Number(partidaId) }
  });

  const jogador = await prisma.jogador.findUnique({
    where: { id: Number(jogadorId) }
  });

  let atuacao = await prisma.jogadorPartida.findFirst({
    where: {
      jogadorId: Number(jogadorId),
      partidaId: Number(partidaId)
    }
  });

  const amarelos = Math.max(0, Number(cartoesAmarelos));
  const vermelhos = Math.max(0, Number(cartoesVermelhos));


  if (!atuacao) {
    const vermelhoAutomatico = amarelos >= 2 ? 1 : 0;
    const totalVermelhos = vermelhos + vermelhoAutomatico;

    atuacao = await prisma.jogadorPartida.create({
      data: {
        jogadorId: Number(jogadorId),
        partidaId: Number(partidaId),
        timeId: jogador.timeId,
        gols: Math.max(0, Number(gols)),
        cartoesAmarelos: amarelos,
        cartoesVermelhos: totalVermelhos,
        emCampo: totalVermelhos === 0
      }
    });

    const isTimeA = jogador.timeId === partida.timeAId;
    const updatePartida = {};

    if (amarelos > 0)
      updatePartida[isTimeA ? 'cartoesAmarelosTimeA' : 'cartoesAmarelosTimeB'] = { increment: amarelos };

    if (totalVermelhos > 0)
      updatePartida[isTimeA ? 'cartoesVermelhosTimeA' : 'cartoesVermelhosTimeB'] = { increment: totalVermelhos };

    if (Object.keys(updatePartida).length) {
      await prisma.partida.update({
        where: { id: Number(partidaId) },
        data: updatePartida
      });
    }

    return atuacao;
  }

  let novosAmarelos = atuacao.cartoesAmarelos + amarelos;
  let novosVermelhos = atuacao.cartoesVermelhos + vermelhos;

  if (atuacao.cartoesAmarelos < 2 && novosAmarelos >= 2) {
    novosVermelhos += 1;
  }

  const incrementoVermelhos = novosVermelhos - atuacao.cartoesVermelhos;

  atuacao = await prisma.jogadorPartida.update({
    where: { id: atuacao.id },
    data: {
      gols: atuacao.gols + Math.max(0, Number(gols)),
      cartoesAmarelos: novosAmarelos,
      cartoesVermelhos: novosVermelhos,
      emCampo: novosVermelhos === 0
    }
  });

  const isTimeA = atuacao.timeId === partida.timeAId;
  const updatePartida = {};

  if (amarelos > 0)
    updatePartida[isTimeA ? 'cartoesAmarelosTimeA' : 'cartoesAmarelosTimeB'] = { increment: amarelos };

  if (incrementoVermelhos > 0)
    updatePartida[isTimeA ? 'cartoesVermelhosTimeA' : 'cartoesVermelhosTimeB'] = { increment: incrementoVermelhos };

  if (Object.keys(updatePartida).length) {
    await prisma.partida.update({
      where: { id: Number(partidaId) },
      data: updatePartida
    });
  }

  return atuacao;
}

async function substituirJogadorPartida(
  partidaId,
  jogadorSaiId,
  jogadorEntraId
) {
  // 🔎 Busca partida com modalidade
  const partida = await prisma.partida.findUnique({
    where: { id: Number(partidaId) },
    include: { modalidade: true }
  });

  if (!partida) throw new Error("Partida não encontrada");
  if (partida.finalizada)
    throw new Error("Não é possível substituir jogadores em partida finalizada");

  const modalidade = partida.modalidade.nome.toLowerCase();
  const isFutebol = modalidade.includes("futebol");
  const isFutsal = modalidade.includes("futsal");

  // 🔎 Jogador que sai (precisa estar em campo)
  const jogadorSai = await prisma.jogadorPartida.findFirst({
    where: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorSaiId),
      emCampo: true
    }
  });

  if (!jogadorSai)
    throw new Error("Jogador que sai não está em campo nesta partida");

  // 🔎 Jogador que entra (pode já existir no banco)
  const jogadorEntraExistente = await prisma.jogadorPartida.findFirst({
    where: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorEntraId)
    }
  });

  if (jogadorEntraExistente?.emCampo)
    throw new Error("Jogador que entra já está em campo");

  // 🏳️ Descobre se é Time A ou B
  let tipoTime;
  if (partida.timeAId === jogadorSai.timeId) tipoTime = "A";
  else if (partida.timeBId === jogadorSai.timeId) tipoTime = "B";
  else throw new Error("Time do jogador não pertence à partida");

  // ⚽ REGRA DE SUBSTITUIÇÃO
  // Futebol → limite 3
  // Futsal → ilimitado
  if (isFutebol) {
    if (
      (tipoTime === "A" && partida.substituicoesTimeA >= 3) ||
      (tipoTime === "B" && partida.substituicoesTimeB >= 3)
    ) {
      throw new Error("Limite de 3 substituições por time atingido");
    }
  }

  // 🔄 Tira jogador que sai
  await prisma.jogadorPartida.update({
    where: { id: jogadorSai.id },
    data: { emCampo: false }
  });

  // 🔄 Coloca jogador que entra
  let novoJogador;

  if (jogadorEntraExistente) {
    novoJogador = await prisma.jogadorPartida.update({
      where: { id: jogadorEntraExistente.id },
      data: { emCampo: true }
    });
  } else {
    novoJogador = await prisma.jogadorPartida.create({
      data: {
        partidaId: Number(partidaId),
        jogadorId: Number(jogadorEntraId),
        timeId: jogadorSai.timeId,
        gols: 0,
        cartoesAmarelos: 0,
        cartoesVermelhos: 0,
        emCampo: true
      }
    });
  }

  // ➕ Incrementa substituições APENAS se for futebol
  if (isFutebol) {
    const updateData =
      tipoTime === "A"
        ? { substituicoesTimeA: { increment: 1 } }
        : { substituicoesTimeB: { increment: 1 } };

    await prisma.partida.update({
      where: { id: Number(partidaId) },
      data: updateData
    });
  }

  return novoJogador;
}

async function getJogadoresForaDaPartida(partidaId, timeId) {
  partidaId = Number(partidaId)
  timeId = Number(timeId)

  const jogadoresEmCampo = await prisma.jogadorPartida.findMany({
    where: {
      partidaId,
      emCampo: true
    },
    select: { jogadorId: true }
  })

  const idsEmCampo = jogadoresEmCampo.map(j => j.jogadorId)

  const jogadoresFora = await prisma.jogadorTime.findMany({
    where: {
      timeId,
      jogadorId: {
        notIn: idsEmCampo.length ? idsEmCampo : [0]
      }
    },
    include: {
      jogador: {
        include: { funcao: true }
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

async function removerJogadorDeCampo(partidaId, jogadorId) {
  const partida = await prisma.partida.findUnique({
    where: { id: Number(partidaId) }
  });

  if (!partida) {
    throw new Error("Partida não encontrada");
  }

  if (partida.finalizada) {
    throw new Error("Não é possível alterar jogadores em partida finalizada");
  }

  const jogadorEmCampo = await prisma.jogadorPartida.findFirst({
    where: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorId),
      emCampo: true
    }
  });

  if (!jogadorEmCampo) {
    throw new Error("Jogador não está em campo nesta partida");
  }

  // Remove o jogador do campo
  const jogadorAtualizado = await prisma.jogadorPartida.update({
    where: { id: jogadorEmCampo.id },
    data: { emCampo: false }
  });

  return jogadorAtualizado;
}

async function detalharPartida(partidaId) {
  const partida = await prisma.partida.findUnique({
    where: { id: Number(partidaId) },
    include: {
      campeonato: {
        select: {
          id: true,
          nome: true
        }
      },
      modalidade: {
        select: {
          id: true,
          nome: true
        }
      },
      quadra: {
        select: {
          id: true,
          nome: true,
          endereco: true
        }
      },
      timeA: {
        select: {
          id: true,
          nome: true,
          foto: true
        }
      },
      timeB: {
        select: {
          id: true,
          nome: true,
          foto: true
        }
      },
      jogadoresPartida: {
        include: {
          jogador: {
            select: {
              id: true,
              nome: true,
              foto: true
            }
          }
        }
      },
      sets: {
        orderBy: {
          numero: 'asc'
        }
      }
    }
  })

  if (!partida) {
    throw new Error('Partida não encontrada')
  }

  return partida
}

module.exports = {
  criarPartida,
  finalizarPartida,
  obterOuCriarPlacar,
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
  getJogadoresForaDaPartida,
  removerJogadorDeCampo,
  detalharPartida
};