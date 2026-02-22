const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function grupoModalidade(nomeModalidade) {
  const nome = normalizarTexto(nomeModalidade);
  if (
    nome.includes('volei') ||
    nome.includes('futevolei') ||
    (nome.includes('beach') && nome.includes('tenis'))
  ) {
    return 'VOLEI';
  }
  return 'FUTEBOL';
}

function regrasPadraoPorModalidade(nomeModalidade) {
  const grupo = grupoModalidade(nomeModalidade);

  if (grupo === 'VOLEI') {
    return {
      grupoRegras: 'VOLEI',
      quantidadeSetsPartida: 5,
      pontosPorSet: 25,
      regraPontosVitoria: 'VITORIA_2_SEMPRE',
      regraPontosDerrota: 'DERROTA_0_SEMPRE',
      pontosEmpate: 0,
      suspensaoAmarelos: null,
      suspensaoVermelhos: null,
      separarCartoesPorFase: false,
      resetarCartoesCadaFase: false
    };
  }

  return {
    grupoRegras: 'FUTEBOL',
    pontosVitoria: 3,
    pontosEmpate: 1,
    pontosDerrota: 0,
    suspensaoAmarelos: null,
    suspensaoVermelhos: null,
    separarCartoesPorFase: false,
    resetarCartoesCadaFase: false
  };
}

function normalizarRegrasCampeonato(regras, nomeModalidade) {
  return {
    ...regrasPadraoPorModalidade(nomeModalidade),
    ...(regras || {})
  };
}

function calcularPontosVoleiParaResultado(setsVencedor, setsPerdedor, regras) {
  const diff = Math.abs((Number(setsVencedor) || 0) - (Number(setsPerdedor) || 0));

  let pontosVencedor = 2;
  if (regras.regraPontosVitoria === 'VITORIA_3_SEMPRE') {
    pontosVencedor = 3;
  } else if (regras.regraPontosVitoria === 'VITORIA_3_DIF_SETS_MAIOR_1') {
    pontosVencedor = diff > 1 ? 3 : 2;
  }

  let pontosPerdedor = 0;
  if (regras.regraPontosDerrota === 'DERROTA_1_SEMPRE') {
    pontosPerdedor = 1;
  } else if (regras.regraPontosDerrota === 'DERROTA_1_DIF_SETS_MENOR_2') {
    pontosPerdedor = diff < 2 ? 1 : 0;
  }

  return { pontosVencedor, pontosPerdedor };
}

async function recalcularPosicoesDoPlacar(campeonatoId, faseId, ordemClassificacao = [], regras = {}, grupo = 'FUTEBOL') {
  const placares = await prisma.placar.findMany({
    where: {
      campeonatoId: Number(campeonatoId),
      faseId: faseId ? Number(faseId) : null,
      visivel: true,
      deletedAt: null
    },
    include: { time: true }
  });

  const ordem = Array.isArray(ordemClassificacao) ? ordemClassificacao : [];

  async function confrontoDiretoDiff(timeAId, timeBId) {
    const partidas = await prisma.partida.findMany({
      where: {
        campeonatoId: Number(campeonatoId),
        faseId: faseId ? Number(faseId) : null,
        status: 'FINALIZADA',
        OR: [
          { timeAId, timeBId },
          { timeAId: timeBId, timeBId: timeAId }
        ]
      }
    });

    let pontosA = 0;
    let pontosB = 0;

    for (const p of partidas) {
      if (p.pontosTimeA > p.pontosTimeB) {
        if (grupo === 'FUTEBOL') {
          const v = Number(regras.pontosVitoria) || 0;
          const d = Number(regras.pontosDerrota) || 0;
          if (p.timeAId === timeAId) {
            pontosA += v;
            pontosB += d;
          } else {
            pontosB += v;
            pontosA += d;
          }
        } else {
          const pts = calcularPontosVoleiParaResultado(p.pontosTimeA, p.pontosTimeB, regras);
          if (p.timeAId === timeAId) {
            pontosA += pts.pontosVencedor;
            pontosB += pts.pontosPerdedor;
          } else {
            pontosB += pts.pontosVencedor;
            pontosA += pts.pontosPerdedor;
          }
        }
      } else if (p.pontosTimeB > p.pontosTimeA) {
        if (grupo === 'FUTEBOL') {
          const v = Number(regras.pontosVitoria) || 0;
          const d = Number(regras.pontosDerrota) || 0;
          if (p.timeBId === timeAId) {
            pontosA += v;
            pontosB += d;
          } else {
            pontosB += v;
            pontosA += d;
          }
        } else {
          const pts = calcularPontosVoleiParaResultado(p.pontosTimeB, p.pontosTimeA, regras);
          if (p.timeBId === timeAId) {
            pontosA += pts.pontosVencedor;
            pontosB += pts.pontosPerdedor;
          } else {
            pontosB += pts.pontosVencedor;
            pontosA += pts.pontosPerdedor;
          }
        }
      } else {
        const e = Number(regras.pontosEmpate) || 0;
        pontosA += e;
        pontosB += e;
      }
    }

    return pontosB - pontosA;
  }

  const confrontoCache = new Map();

  async function getConfronto(aId, bId) {
    const chave = `${aId}-${bId}`;
    if (confrontoCache.has(chave)) return confrontoCache.get(chave);
    const valor = await confrontoDiretoDiff(aId, bId);
    confrontoCache.set(chave, valor);
    confrontoCache.set(`${bId}-${aId}`, -valor);
    return valor;
  }

  const copia = placares.slice();

  for (let i = 0; i < copia.length; i += 1) {
    for (let j = i + 1; j < copia.length; j += 1) {
      const a = copia[i];
      const b = copia[j];
      let resultado = 0;

      for (const criterio of ordem) {
        if (criterio.value === 'confrontoDireto') {
          resultado = await getConfronto(a.timeId, b.timeId);
          if (resultado !== 0) break;
          continue;
        }

        if (criterio.value === 'sorteio') {
          resultado = Math.random() - 0.5;
          break;
        }

        const valorA = a[criterio.value] ?? 0;
        const valorB = b[criterio.value] ?? 0;
        if (valorB !== valorA) {
          resultado = valorB - valorA;
          break;
        }
      }

      if (ordem.length === 0 && resultado === 0) {
        resultado = (b.pontuacao ?? 0) - (a.pontuacao ?? 0);
      }

      if (resultado > 0) {
        copia[i] = b;
        copia[j] = a;
      }
    }
  }

  for (let i = 0; i < copia.length; i += 1) {
    await prisma.placar.update({
      where: { id: copia[i].id },
      data: { posicao: i + 1 }
    });
  }
}

async function recalcularPlacarCampeonatoFase(campeonatoId, faseId) {
  if (!campeonatoId || !faseId) return;

  const campeonato = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) },
    select: {
      id: true,
      regras: true,
      ordemClassificacao: true,
      modalidade: { select: { nome: true } }
    }
  });

  if (!campeonato) return;

  const regras = normalizarRegrasCampeonato(campeonato.regras, campeonato.modalidade?.nome);
  const grupo = grupoModalidade(campeonato.modalidade?.nome);

  const placares = await prisma.placar.findMany({
    where: {
      campeonatoId: Number(campeonatoId),
      faseId: Number(faseId),
      deletedAt: null
    }
  });

  const acumuladoPorTime = new Map();
  for (const p of placares) {
    acumuladoPorTime.set(p.timeId, {
      jogos: 0,
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
      aproveitamento: 0
    });
  }

  const partidasFinalizadas = await prisma.partida.findMany({
    where: {
      campeonatoId: Number(campeonatoId),
      faseId: Number(faseId),
      status: 'FINALIZADA'
    },
    select: {
      timeAId: true,
      timeBId: true,
      pontosTimeA: true,
      pontosTimeB: true,
      woTimeA: true,
      woTimeB: true
    }
  });

  for (const partida of partidasFinalizadas) {
    const a = acumuladoPorTime.get(partida.timeAId);
    const b = acumuladoPorTime.get(partida.timeBId);
    if (!a || !b) continue;

    a.jogos += 1;
    b.jogos += 1;

    if (grupo === 'FUTEBOL') {
      const golsA = Number(partida.pontosTimeA) || 0;
      const golsB = Number(partida.pontosTimeB) || 0;

      a.golsPro += golsA;
      a.golsSofridos += golsB;
      a.saldoDeGols = a.golsPro - a.golsSofridos;

      b.golsPro += golsB;
      b.golsSofridos += golsA;
      b.saldoDeGols = b.golsPro - b.golsSofridos;

      if (golsA > golsB) {
        a.vitorias += 1;
        b.derrotas += 1;
        a.pontuacao += Number(regras.pontosVitoria) || 0;
        b.pontuacao += Number(regras.pontosDerrota) || 0;
      } else if (golsB > golsA) {
        b.vitorias += 1;
        a.derrotas += 1;
        b.pontuacao += Number(regras.pontosVitoria) || 0;
        a.pontuacao += Number(regras.pontosDerrota) || 0;
      } else {
        a.empates += 1;
        b.empates += 1;
        a.pontuacao += Number(regras.pontosEmpate) || 0;
        b.pontuacao += Number(regras.pontosEmpate) || 0;
      }
    } else {
      const setsA = Number(partida.pontosTimeA) || 0;
      const setsB = Number(partida.pontosTimeB) || 0;
      const woA = !!partida.woTimeA;
      const woB = !!partida.woTimeB;

      a.setsVencidos += setsA;
      b.setsVencidos += setsB;

      if (woA && !woB) {
        a.derrotas += 1;
        a.derrotaWo += 1;
        b.vitorias += 1;
        const pts = calcularPontosVoleiParaResultado(setsB, setsA, regras);
        b.pontuacao += pts.pontosVencedor;
        a.pontuacao += pts.pontosPerdedor;
        continue;
      }

      if (woB && !woA) {
        b.derrotas += 1;
        b.derrotaWo += 1;
        a.vitorias += 1;
        const pts = calcularPontosVoleiParaResultado(setsA, setsB, regras);
        a.pontuacao += pts.pontosVencedor;
        b.pontuacao += pts.pontosPerdedor;
        continue;
      }

      if (setsA > setsB) {
        a.vitorias += 1;
        b.derrotas += 1;

        if (setsA === 3 && setsB === 0) a.vitoria3x0 += 1;
        if (setsA === 3 && setsB === 2) a.vitoria3x2 += 1;
        if (setsB === 2 && setsA === 3) b.derrota2x3 += 1;
        if (setsB === 0 && setsA === 3) b.derrota0x3 += 1;

        const pts = calcularPontosVoleiParaResultado(setsA, setsB, regras);
        a.pontuacao += pts.pontosVencedor;
        b.pontuacao += pts.pontosPerdedor;
      } else if (setsB > setsA) {
        b.vitorias += 1;
        a.derrotas += 1;

        if (setsB === 3 && setsA === 0) b.vitoria3x0 += 1;
        if (setsB === 3 && setsA === 2) b.vitoria3x2 += 1;
        if (setsA === 2 && setsB === 3) a.derrota2x3 += 1;
        if (setsA === 0 && setsB === 3) a.derrota0x3 += 1;

        const pts = calcularPontosVoleiParaResultado(setsB, setsA, regras);
        b.pontuacao += pts.pontosVencedor;
        a.pontuacao += pts.pontosPerdedor;
      } else {
        a.empates += 1;
        b.empates += 1;
        a.pontuacao += Number(regras.pontosEmpate) || 0;
        b.pontuacao += Number(regras.pontosEmpate) || 0;
      }
    }
  }

  const maxPontosPartida = grupo === 'FUTEBOL'
    ? Number(regras.pontosVitoria) || 0
    : (regras.regraPontosVitoria === 'VITORIA_2_SEMPRE' ? 2 : 3);

  for (const placar of placares) {
    const novo = acumuladoPorTime.get(placar.timeId);
    if (!novo) continue;

    novo.aproveitamento = novo.jogos > 0 && maxPontosPartida > 0
      ? Math.round((novo.pontuacao / (novo.jogos * maxPontosPartida)) * 100)
      : 0;

    await prisma.placar.update({
      where: { id: placar.id },
      data: {
        jogos: novo.jogos,
        pontuacao: novo.pontuacao,
        vitorias: novo.vitorias,
        empates: novo.empates,
        derrotas: novo.derrotas,
        golsPro: novo.golsPro,
        golsSofridos: novo.golsSofridos,
        saldoDeGols: novo.saldoDeGols,
        setsVencidos: novo.setsVencidos,
        vitoria3x0: novo.vitoria3x0,
        vitoria3x2: novo.vitoria3x2,
        derrota2x3: novo.derrota2x3,
        derrota0x3: novo.derrota0x3,
        derrotaWo: novo.derrotaWo,
        aproveitamento: novo.aproveitamento
      }
    });
  }

  await recalcularPosicoesDoPlacar(
    campeonatoId,
    faseId,
    campeonato.ordemClassificacao || [],
    regras,
    grupo
  );
}

async function validarSuspensaoJogador({ campeonatoId, faseId, jogadorId }) {
  if (!campeonatoId || !jogadorId) return;

  const campeonato = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) },
    select: {
      regras: true,
      modalidade: { select: { nome: true } }
    }
  });

  if (!campeonato) return;

  const regras = normalizarRegrasCampeonato(campeonato.regras, campeonato.modalidade?.nome);
  const limiteAmarelos = Number(regras.suspensaoAmarelos);
  const limiteVermelhos = Number(regras.suspensaoVermelhos);

  if (!Number.isFinite(limiteAmarelos) && !Number.isFinite(limiteVermelhos)) return;

  const filtrosPartida = {
    campeonatoId: Number(campeonatoId),
    status: 'FINALIZADA'
  };

  if (regras.separarCartoesPorFase || regras.resetarCartoesCadaFase) {
    filtrosPartida.faseId = faseId ? Number(faseId) : null;
  }

  const resumo = await prisma.jogadorPartida.aggregate({
    where: {
      jogadorId: Number(jogadorId),
      partida: filtrosPartida
    },
    _sum: {
      cartoesAmarelos: true,
      cartoesVermelhos: true
    }
  });

  const amarelos = Number(resumo._sum.cartoesAmarelos) || 0;
  const vermelhos = Number(resumo._sum.cartoesVermelhos) || 0;

  if (Number.isFinite(limiteAmarelos) && limiteAmarelos > 0 && amarelos >= limiteAmarelos) {
    throw new Error(`Jogador suspenso por cartoes amarelos (limite: ${limiteAmarelos}).`);
  }

  if (Number.isFinite(limiteVermelhos) && limiteVermelhos > 0 && vermelhos >= limiteVermelhos) {
    throw new Error(`Jogador suspenso por cartoes vermelhos (limite: ${limiteVermelhos}).`);
  }
}

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
      where: { id: Number(partidaId) },
      select: {
        id: true,
        campeonatoId: true,
        faseId: true
      }
    });

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
      for (const j of jogadores) {
        await validarSuspensaoJogador({
          campeonatoId: partida.campeonatoId,
          faseId: partida.faseId,
          jogadorId: j.jogadorId
        });
      }

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
      faseId: true,
      rodadaId: true,
      timeAId: true,
      timeBId: true,
      inicioPartida: true,
      status: true,
      modalidade: true,
      campeonato: {
        select: {
          id: true,
          nome: true,
          regras: true,
          modalidade: {
            select: { nome: true }
          }
        }
      },
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
    faseId: partida.faseId,
    rodadaId: partida.rodadaId,
    timeAId: partida.timeAId,
    timeBId: partida.timeBId,
    inicioPartida: partida.inicioPartida,
    status: partida.status,
    modalidade: partida.modalidade,
    campeonato: partida.campeonato
      ? {
          ...partida.campeonato,
          regras: normalizarRegrasCampeonato(
            partida.campeonato.regras,
            partida.campeonato.modalidade?.nome || partida.modalidade?.nome
          )
        }
      : null,
    quadra: partida.quadra,
    timeA: partida.timeA,
    timeB: partida.timeB,
    sets: partida.sets,
    jogadoresPartida: partida.jogadoresPartida,
    participantes: partida.participantes,
    usuarioCriador: partida.usuarioCriador,
  };

}

async function finalizarPartida(partidaId, payload = null) {
  const idNum = Number(partidaId)

  const partida = await prisma.partida.findUnique({
    where: { id: idNum },
    select: { id: true, status: true }
  })

  if (partida.status === 'FINALIZADA') {
    if (payload && Object.keys(payload).length) {
      const partidaComContexto = await prisma.partida.update({
        where: { id: idNum },
        data: payload,
        select: {
          campeonatoId: true,
          faseId: true
        }
      })

      await recalcularPlacarCampeonatoFase(partidaComContexto.campeonatoId, partidaComContexto.faseId)
    }

    const atualizada = await retornarPartida(idNum)
    return { mensagem: 'Dados atualizados sem alterar o status.', partida: atualizada }
  }

  if (partida.status !== 'EM_ANDAMENTO') {
    throw new Error(`Não é possível finalizar: status atual é ${partida.status}.`)
  }

  const partidaFinalizada = await prisma.partida.update({
    where: { id: idNum },
    data: { status: 'FINALIZADA' },
    select: {
      campeonatoId: true,
      faseId: true
    }
  })

  await recalcularPlacarCampeonatoFase(partidaFinalizada.campeonatoId, partidaFinalizada.faseId)

  const atualizada = await retornarPartida(idNum)
  return { mensagem: 'Partida finalizada com sucesso.', partida: atualizada }
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
  const isBeachTenis = modalidade.includes('beach') && modalidade.includes('tenis')
  let regrasCampeonato = null

  if (isVolei || isBeachTenis) {
    const campeonato = await prisma.campeonato.findUnique({
      where: { id: Number(partidaBase.campeonatoId) },
      select: {
        regras: true,
        modalidade: { select: { nome: true } }
      }
    })

    regrasCampeonato = normalizarRegrasCampeonato(
      campeonato?.regras,
      campeonato?.modalidade?.nome || partidaBase.modalidade?.nome
    )
  }

  const dataUpdate = {}

  if (pontosTimeA !== undefined) dataUpdate.pontosTimeA = Number(pontosTimeA)
  if (pontosTimeB !== undefined) dataUpdate.pontosTimeB = Number(pontosTimeB)
  if (tempoSegundos !== undefined) dataUpdate.tempoSegundos = Number(tempoSegundos)
  if (woTimeA !== undefined) dataUpdate.woTimeA = !!woTimeA
  if (woTimeB !== undefined) dataUpdate.woTimeB = !!woTimeB

  if (isFutebol || isFutsal) {
    if (faltasTimeA !== undefined) dataUpdate.faltasTimeA = Number(faltasTimeA)
    if (faltasTimeB !== undefined) dataUpdate.faltasTimeB = Number(faltasTimeB)

    if (substituicoesTimeA !== undefined) dataUpdate.substituicoesTimeA = Number(substituicoesTimeA)
    if (substituicoesTimeB !== undefined) dataUpdate.substituicoesTimeB = Number(substituicoesTimeB)

    if (cartoesAmarelosTimeA !== undefined) dataUpdate.cartoesAmarelosTimeA = Number(cartoesAmarelosTimeA)
    if (cartoesVermelhosTimeA !== undefined) dataUpdate.cartoesVermelhosTimeA = Number(cartoesVermelhosTimeA)

    if (cartoesAmarelosTimeB !== undefined) dataUpdate.cartoesAmarelosTimeB = Number(cartoesAmarelosTimeB)
    if (cartoesVermelhosTimeB !== undefined) dataUpdate.cartoesVermelhosTimeB = Number(cartoesVermelhosTimeB)
  }

  if ((isVolei || isBeachTenis) && Array.isArray(sets)) {
    const maxSets = Math.max(1, Number(regrasCampeonato?.quantidadeSetsPartida ?? 5))
    const setsA = Number(dataUpdate.pontosTimeA ?? partidaBase.pontosTimeA ?? 0)
    const setsB = Number(dataUpdate.pontosTimeB ?? partidaBase.pontosTimeB ?? 0)

    if (setsA < 0 || setsB < 0) {
      throw new Error('Quantidade de sets nao pode ser negativa.')
    }

    if (setsA > maxSets || setsB > maxSets || (setsA + setsB) > maxSets) {
      throw new Error(`Quantidade de sets por partida excede o limite configurado (${maxSets}).`)
    }

    for (const set of sets) {
      const numeroSet = Number(set.numero)
      const pontosASet = Number(set.pontosA ?? 0)
      const pontosBSet = Number(set.pontosB ?? 0)

      if (numeroSet < 1 || numeroSet > maxSets) {
        throw new Error(`Set invalido. O numero do set deve ficar entre 1 e ${maxSets}.`)
      }

      if (pontosASet < 0 || pontosBSet < 0) {
        throw new Error('Pontos do set nao podem ser negativos.')
      }

      await prisma.setPartida.upsert({
        where: {
          partidaId_numero: {
            partidaId,
            numero: numeroSet
          }
        },
        update: {
          pontosA: pontosASet,
          pontosB: pontosBSet
        },
        create: {
          partidaId,
          numero: numeroSet,
          pontosA: pontosASet,
          pontosB: pontosBSet
        }
      })
    }
  }

  await prisma.partida.update({
    where: { id: partidaId },
    data: dataUpdate
  })

  if (partidaBase.status === 'FINALIZADA') {
    await recalcularPlacarCampeonatoFase(partidaBase.campeonatoId, partidaBase.faseId)
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

  await validarSuspensaoJogador({
    campeonatoId: partida.campeonatoId,
    faseId: partida.faseId,
    jogadorId
  })

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

  const amarelos = Number(cartoesAmarelos) || 0;
  const vermelhos = Number(cartoesVermelhos) || 0;
  const golsInc = Number(gols) || 0;

  if (!atuacao) {
    atuacao = await prisma.jogadorPartida.create({
      data: {
        jogadorId: Number(jogadorId),
        partidaId: Number(partidaId),
        timeId: jogador.timeId,
        gols: golsInc,
        cartoesAmarelos: amarelos,
        cartoesVermelhos: vermelhos,
        emCampo: true
      }
    });

    const isTimeA = jogador.timeId === partida.timeAId;
    const updatePartida = {};

    if (amarelos !== 0)
      updatePartida[isTimeA ? 'cartoesAmarelosTimeA' : 'cartoesAmarelosTimeB'] = { increment: amarelos };

    if (vermelhos !== 0)
      updatePartida[isTimeA ? 'cartoesVermelhosTimeA' : 'cartoesVermelhosTimeB'] = { increment: vermelhos };

    if (Object.keys(updatePartida).length) {
      await prisma.partida.update({
        where: { id: Number(partidaId) },
        data: updatePartida
      });
    }

    return atuacao;
  }

  const novosAmarelos = (Number(atuacao.cartoesAmarelos) || 0) + amarelos;
  const novosVermelhos = (Number(atuacao.cartoesVermelhos) || 0) + vermelhos;

  const incrementoVermelhos = novosVermelhos - (Number(atuacao.cartoesVermelhos) || 0);

  atuacao = await prisma.jogadorPartida.update({
    where: { id: atuacao.id },
    data: {
      gols: (Number(atuacao.gols) || 0) + golsInc,
      cartoesAmarelos: novosAmarelos,
      cartoesVermelhos: novosVermelhos,
      emCampo: true
    }
  });

  const isTimeA = atuacao.timeId === partida.timeAId;
  const updatePartida = {};

  if (amarelos !== 0)
    updatePartida[isTimeA ? 'cartoesAmarelosTimeA' : 'cartoesAmarelosTimeB'] = { increment: amarelos };

  if (incrementoVermelhos !== 0)
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

  const modalidade = partida.modalidade.nome.toLowerCase();
  const isFutebol = modalidade.includes("futebol");

  await validarSuspensaoJogador({
    campeonatoId: partida.campeonatoId,
    faseId: partida.faseId,
    jogadorId: Number(jogadorEntraId)
  })

  const jogadorSai = await prisma.jogadorPartida.findFirst({
    where: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorSaiId),
      emCampo: true
    }
  });

  const jogadorEntraExistente = await prisma.jogadorPartida.findFirst({
    where: {
      partidaId: Number(partidaId),
      jogadorId: Number(jogadorEntraId)
    }
  });

  let tipoTime;
  if (partida.timeAId === jogadorSai.timeId) tipoTime = "A";
  else if (partida.timeBId === jogadorSai.timeId) tipoTime = "B";

  await prisma.jogadorPartida.update({
    where: { id: jogadorSai.id },
    data: { emCampo: false }
  });

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

  const updateData =
    tipoTime === "A"
      ? { substituicoesTimeA: { increment: 1 } }
      : { substituicoesTimeB: { increment: 1 } };

  await prisma.partida.update({
    where: { id: Number(partidaId) },
    data: updateData
  });


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
    select: {
      id: true,
      status: true,
      campeonatoId: true,
      faseId: true
    }
  });

  const dadosAtualizacao = {
    status: novoStatus
  };

  const partidaAtualizada = await prisma.partida.update({
    where: { id: partida.id },
    data: dadosAtualizacao
  });

  if (novoStatus === 'FINALIZADA' || novoStatus === 'CANCELADA') {
    await recalcularPlacarCampeonatoFase(partida.campeonatoId, partida.faseId)
  }

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
