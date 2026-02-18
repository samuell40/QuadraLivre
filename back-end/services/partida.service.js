const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarPartida(data, usuarioId) {
  const modalidadeId = Number(data.modalidadeId);
  const timeAId = Number(data.timeAId);
  const timeBId = Number(data.timeBId);
  const campeonatoId = Number(data.campeonatoId);
  const faseId = Number(data.faseId);
  const rodadaId = Number(data.rodadaId);
  const usuarioCriadorId = Number(usuarioId);
  const quadraId = Number(data.quadraId);

  const campeonato = await prisma.campeonato.findUnique({
    where: { id: campeonatoId },
    select: { quadraId: true }
  });

  const dataCreate = {
    status: 'EM_ANDAMENTO',

    modalidade: {
      connect: { id: modalidadeId }
    },

    campeonato: {
      connect: { id: campeonatoId }
    },

    fase: {
      connect: { id: faseId }
    },

    rodada: {
      connect: { id: rodadaId }
    },

    timeA: {
      connect: { id: timeAId }
    },

    timeB: {
      connect: { id: timeBId }
    },

    usuarioCriador: {
      connect: { id: usuarioCriadorId }
    }
  };

  if (quadraId) {
    dataCreate.quadra = {
      connect: { id: quadraId }
    };
  }

  const partida = await prisma.partida.create({
    data: dataCreate,
    include: {
      campeonato: true,
      modalidade: true,
      fase: true,
      rodada: true,
      timeA: true,
      timeB: true,
      quadra: true,
      usuarioCriador: true
    }
  });

  return partida;
}

async function iniciarPartida(partidaId, jogadores) {

  return await prisma.$transaction(async (tx) => {

    const partida = await tx.partida.findUnique({
      where: { id: Number(partidaId) }
    });

    if (!partida) {
      throw new Error("Partida não encontrada.");
    }

    if (partida.status !== "EM_ANDAMENTO") {
      throw new Error("Só é possível iniciar partidas AGENDADAS.");
    }

    // Atualiza status
    const partidaAtualizada = await tx.partida.update({
      where: { id: Number(partidaId) },
      data: {
        status: "EM_ANDAMENTO",
        inicioPartida: new Date(),
      }
    });

    // Cria jogadores da partida
    if (jogadores && jogadores.length > 0) {
      await tx.jogadorPartida.createMany({
        data: jogadores.map(j => ({
          partidaId: Number(partidaId),
          jogadorId: Number(j.jogadorId),
          timeId: Number(j.timeId),
          emCampo: true
        }))
      });
    }

    return partidaAtualizada;
  });
}

async function retornarPartida(partidaId) {
  const partida = await prisma.partida.findFirst({
    where: {
      id: Number(partidaId),
      status: {
        in: ['EM_ANDAMENTO', 'FINALIZADA']
      }
    },
    select: {
      id: true,
      tempoSegundos: true,
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
      woTimeA: true,
      woTimeB: true,
      modalidadeId: true,
      quadraId: true,
      campeonatoId: true,
      timeAId: true,
      timeBId: true,
      inicioPartida: true,
      status: true,
      modalidade: true,
      quadra: true,
      timeA: true,
      timeB: true,
      sets: {
        orderBy: { numero: 'asc' }
      },

      jogadoresPartida: {
        include: {
          jogador: {
            include: {
              funcao: true,
              times: { include: { time: true } }
            }
          }
        }
      },
      participantes: {
        include: { usuario: true, permissao: true }
      },

      usuarioCriador: true
    }
  });

  return {
    id: partida.id,
    tempoSegundos: partida.tempoSegundos,
    pontosTimeA: partida.pontosTimeA,
    pontosTimeB: partida.pontosTimeB,
    faltasTimeA: partida.faltasTimeA,
    faltasTimeB: partida.faltasTimeB,
    substituicoesTimeA: partida.substituicoesTimeA,
    substituicoesTimeB: partida.substituicoesTimeB,
    cartoesAmarelosTimeA: partida.cartoesAmarelosTimeA,
    cartoesVermelhosTimeA: partida.cartoesVermelhosTimeA,
    cartoesAmarelosTimeB: partida.cartoesAmarelosTimeB,
    cartoesVermelhosTimeB: partida.cartoesVermelhosTimeB,
    woTimeA: partida.woTimeA,
    woTimeB: partida.woTimeB,
    modalidadeId: partida.modalidadeId,
    quadraId: partida.quadraId,
    campeonatoId: partida.campeonatoId,
    timeAId: partida.timeAId,
    timeBId: partida.timeBId,
    inicioPartida: partida.inicioPartida,
    status: partida.status,
    modalidade: partida.modalidade,
    quadra: partida.quadra,
    timeA: partida.timeA,
    timeB: partida.timeB,
    sets: partida.sets,
    jogadoresPartida: partida.jogadoresPartida,
    participantes: partida.participantes,
    usuarioCriador: partida.usuarioCriador,
  };

}

async function finalizarPartida(partidaId) {
  const idNum = Number(partidaId)
  const partida = await prisma.partida.findUnique({
    where: { id: idNum },
    select: {
      id: true,
      status: true,
      campeonatoId: true,
      modalidadeId: true,
      quadraId: true,
      timeAId: true,
      timeBId: true
    }
  })

  if (partida.status !== 'EM_ANDAMENTO') {
    throw new Error(`Não é possível finalizar: status atual é ${partida.status}.`)
  }

  await prisma.partida.update({
    where: { id: idNum },
    data: {
      status: 'FINALIZADA'
    }
  })

  const atualizada = await retornarPartida(idNum)

  return {
    mensagem: 'Partida finalizada com sucesso.',
    partida: atualizada
  }
}

async function atualizarParcial(
  id,
  {
    pontosTimeA,
    pontosTimeB,
    tempoSegundos,
    woTimeA,
    woTimeB,
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
  const partidaId = Number(id)

  const partidaBase = await prisma.partida.findUnique({
    where: { id: partidaId },
    include: { modalidade: true }
  })

  if (!partidaBase) throw new Error('Partida não encontrada')

  const modalidade = (partidaBase.modalidade.nome || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const isVolei = modalidade.includes('volei')
  const isFutebol = modalidade.includes('futebol')
  const isFutsal = modalidade.includes('futsal')

  const dataUpdate = {}
  if (pontosTimeA !== undefined) dataUpdate.pontosTimeA = pontosTimeA
  if (pontosTimeB !== undefined) dataUpdate.pontosTimeB = pontosTimeB
  if (tempoSegundos !== undefined) dataUpdate.tempoSegundos = tempoSegundos
  if (woTimeA !== undefined) dataUpdate.woTimeA = woTimeA
  if (woTimeB !== undefined) dataUpdate.woTimeB = woTimeB

  if (isFutebol || isFutsal) {
    if (faltasTimeA !== undefined) dataUpdate.faltasTimeA = faltasTimeA
    if (faltasTimeB !== undefined) dataUpdate.faltasTimeB = faltasTimeB
    if (substituicoesTimeA !== undefined) dataUpdate.substituicoesTimeA = substituicoesTimeA
    if (substituicoesTimeB !== undefined) dataUpdate.substituicoesTimeB = substituicoesTimeB
    if (cartoesAmarelosTimeA !== undefined) dataUpdate.cartoesAmarelosTimeA = cartoesAmarelosTimeA
    if (cartoesVermelhosTimeA !== undefined) dataUpdate.cartoesVermelhosTimeA = cartoesVermelhosTimeA
    if (cartoesAmarelosTimeB !== undefined) dataUpdate.cartoesAmarelosTimeB = cartoesAmarelosTimeB
    if (cartoesVermelhosTimeB !== undefined) dataUpdate.cartoesVermelhosTimeB = cartoesVermelhosTimeB
  }

  await prisma.partida.update({
    where: { id: partidaId },
    data: dataUpdate
  })

  if (isVolei && Array.isArray(sets) && sets.length) {
    for (const set of sets) {
      await prisma.setPartida.upsert({
        where: {
          partidaId_numero: {
            partidaId,
            numero: set.numero
          }
        },
        update: {
          pontosA: set.pontosA,
          pontosB: set.pontosB
        },
        create: {
          partidaId,
          numero: set.numero,
          pontosA: set.pontosA,
          pontosB: set.pontosB
        }
      })
    }
  }

  const partidaAtualizada = await prisma.partida.findUnique({
    where: { id: partidaId },
    include: {
      timeA: { include: { placares: true } },
      timeB: { include: { placares: true } },
      modalidade: true,
      jogadoresPartida: { include: { jogador: true } },
      participantes: { include: { usuario: true } },
      sets: true
    }
  })

  return partidaAtualizada
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

  // Incrementa substituições APENAS se for futebol
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

async function listarPartidasDaRodadaDaFase(campeonatoId, faseId, rodadaId) {
  try {
    const partidas = await prisma.partida.findMany({
      where: {
        campeonatoId: Number(campeonatoId),
        faseId: Number(faseId),
        rodadaId: Number(rodadaId),
        // se você tiver campo ativo na partida, pode ligar:
        // ativo: true
      },
      include: {
        timeA: true,
        timeB: true,
        quadra: true,
        usuarioCriador: true,
        modalidade: true,
        fase: true,
        rodada: true,
        campeonato: true,

        sets: { orderBy: { numero: 'asc' } },

        jogadoresPartida: {
          include: {
            jogador: {
              include: {
                funcao: true,
                times: { include: { time: true } }
              }
            },
            time: true
          }
        },

        participantes: {
          include: {
            usuario: true,
            permissao: true
          }
        }
      },
      orderBy: { data: 'asc' }
    })

    return partidas
  } catch (error) {
    console.error('Erro ao listar partidas da fase/rodada:', error)
    throw new Error('Não foi possível listar as partidas')
  }
}

function listarStatusPartida() {
  return [
    'EM_ANDAMENTO',
    'FINALIZADA',
    'CANCELADA'
  ];
}

async function alterarStatusPartida(partidaId, novoStatus) {
  const partida = await prisma.partida.findUnique({
    where: { id: Number(partidaId) },
    select: { id: true, status: true }
  });

  const dadosAtualizacao = {
    status: novoStatus
  };

  const partidaAtualizada = await prisma.partida.update({
    where: { id: partida.id },
    data: dadosAtualizacao
  });

  return partidaAtualizada;
}

module.exports = {
  criarPartida,
  iniciarPartida,
  finalizarPartida,
  atualizarParcial,
  incrementarPlacar,
  retornarPartida,
  vincularJogadorPartida,
  listarJogadoresSelecionados,
  atualizarAtuacaoJogadorPartida,
  substituirJogadorPartida,
  getJogadoresForaDaPartida,
  removerJogadorDeCampo,
  detalharPartida,
  listarPartidasDaRodadaDaFase,
  listarStatusPartida,
  alterarStatusPartida
};