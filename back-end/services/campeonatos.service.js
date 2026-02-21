const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CRITERIOS_MODALIDADE = {
  futebol: [
    { value: "pontuacao", label: "Pontuação" },
    { value: "vitorias", label: "Vitórias" },
    { value: "saldoDeGols", label: "Saldo de gols" },
    { value: "golsPro", label: "Gols pró" },
    { value: "golsSofridos", label: "Gols sofridos" },
    { value: "empates", label: "Empates" },
    { value: "derrotas", label: "Derrotas" },
    { value: "confrontoDireto", label: "Confronto direto" },
    { value: "sorteio", label: "Sorteio" }
  ],
  futsal: [],
  futebolDeAreia: [],
  volei: [
    { value: "pontuacao", label: "Pontuação" },
    { value: "setsVencidos", label: "Sets vencidos" },
    { value: "vitoria3x0", label: "Vitória 3x0" },
    { value: "vitoria3x2", label: "Vitória 3x2" },
    { value: "derrota2x3", label: "Derrota 2x3" },
    { value: "derrota0x3", label: "Derrota 0x3" },
    { value: "sorteio", label: "Sorteio" }
  ],
  voleiDeAreia: [],
  futevolei: []
};

CRITERIOS_MODALIDADE.futsal = CRITERIOS_MODALIDADE.futebol;
CRITERIOS_MODALIDADE.futebolDeAreia = CRITERIOS_MODALIDADE.futebol;
CRITERIOS_MODALIDADE.voleiDeAreia = CRITERIOS_MODALIDADE.volei;
CRITERIOS_MODALIDADE.futevolei = CRITERIOS_MODALIDADE.volei;
CRITERIOS_MODALIDADE.beachtenis = CRITERIOS_MODALIDADE.volei;
CRITERIOS_MODALIDADE.beachtennis = CRITERIOS_MODALIDADE.volei;

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

const REGRAS_PADRAO_CAMPEONATO = regrasPadraoPorModalidade('futebol');

function normalizarRegrasCampeonato(regras, nomeModalidade) {
  return {
    ...regrasPadraoPorModalidade(nomeModalidade),
    ...(regras || {})
  };
}

async function criarCampeonato(data) {
  const {
    nome,
    tipo,
    dataInicio,
    dataFim,
    status,
    modalidadeId,
    quadraId,
    times,
    datasJogos,
    usuarioId,
    foto,
    regras
  } = data;

  let listaDatasReais = Array.isArray(datasJogos) ? datasJogos.map(d => new Date(d)) : [];
  const timesArray = Array.isArray(times) ? times : [];

  return await prisma.$transaction(async (tx) => {
    const modalidadeDB = await tx.modalidade.findUnique({
      where: { id: Number(modalidadeId) }
    });

    if (!modalidadeDB) throw new Error("Modalidade não encontrada no banco.");
    const chaveAuto = modalidadeDB.nome
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, '') 
      .replace('deareia', 'DeAreia');

    const ordemClassificacao = CRITERIOS_MODALIDADE[chaveAuto];

    if (listaDatasReais.length > 0) {
      const conflitos = await tx.agendamento.findMany({
        where: {
          quadraId: Number(quadraId),
          datahora: { in: listaDatasReais }
        }
      });

      if (conflitos.length > 0) {
        await tx.agendamento.deleteMany({
          where: { id: { in: conflitos.map(c => c.id) } }
        });
      }
    }

    const agendamentosParaCriar = listaDatasReais.map(dataObj => ({
      datahora: dataObj,
      dia: dataObj.getUTCDate(),
      mes: dataObj.getUTCMonth() + 1,
      ano: dataObj.getUTCFullYear(),
      hora: dataObj.getUTCHours(),
      quadraId: Number(quadraId),
      usuarioId: Number(usuarioId),
      modalidadeId: modalidadeDB.id,
      status: "Confirmado",
      tipo: "EVENTO",
      duracao: 1
    }));

    const campeonato = await tx.campeonato.create({
      data: {
        nome,
        tipo,
        foto,
        regras: normalizarRegrasCampeonato(regras, modalidadeDB.nome),
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        status,
        modalidadeId: modalidadeDB.id,
        quadraId: Number(quadraId),
        ordemClassificacao, 
        times: {
          create: timesArray.map(timeId => ({ timeId: Number(timeId) }))
        },
        agendamentos: { create: agendamentosParaCriar },
        placares: { create: timesArray.map(timeId => ({ timeId: Number(timeId) })) }
      },
      include: {
        modalidade: true,
        quadra: true,
        times: { include: { time: true } },
        agendamentos: true,
        placares: true
      }
    });

    if (tipo === "PONTOS_CORRIDOS") {
      const fase = await tx.fase.create({ data: { nome: "1° Fase", campeonatoId: campeonato.id } });
      await tx.rodada.create({ data: { nome: "Rodada 1", faseId: fase.id } });
      await tx.placar.updateMany({ where: { campeonatoId: campeonato.id }, data: { faseId: fase.id } });
    }

    if (tipo === "PONTOS_CORRIDOS_ELIMINATORIAS") {
      const fase1 = await tx.fase.create({ data: { nome: "1° Fase", campeonatoId: campeonato.id } });
      await tx.rodada.create({ data: { nome: "Rodada 1", faseId: fase1.id } });
      await tx.placar.updateMany({ where: { campeonatoId: campeonato.id }, data: { faseId: fase1.id } });

      const fase2 = await tx.fase.create({ data: { nome: "Eliminatórias", campeonatoId: campeonato.id } });
      for (const rodadaNome of ["Quartas de Final", "Semifinal", "Final"]) {
        await tx.rodada.create({ data: { nome: rodadaNome, faseId: fase2.id } });
      }
    }

    if (tipo === "ELIMINATORIAS") {
      const fase = await tx.fase.create({ data: { nome: "Eliminatórias", campeonatoId: campeonato.id } });
      for (const rodadaNome of ["Quartas de Final", "Semifinal", "Final"]) {
        await tx.rodada.create({ data: { nome: rodadaNome, faseId: fase.id } });
      }
    }

    return campeonato;
  });
}

async function removerCampeonato(campeonatoId) {
  if (!campeonatoId) {
    throw new Error('ID do campeonato é obrigatório.');
  }

  const idNum = Number(campeonatoId);

  const existe = await prisma.campeonato.findUnique({ where: { id: idNum } });
  if (!existe) throw new Error('Campeonato não encontrado.');

  const agora = new Date();

  await prisma.$transaction([
    prisma.partida.updateMany({
      where: { campeonatoId: idNum },
      data: { status: 'DELETADA' }
    }),

    prisma.placar.updateMany({
      where: { campeonatoId: idNum },
      data: { visivel: false, deletedAt: agora }
    }),

    prisma.campeonatoTime.updateMany({
      where: { campeonatoId: idNum },
      data: { ativo: false, deletedAt: agora }
    }),

    prisma.agendamento.updateMany({
      where: { campeonatoId: idNum },
      data: { status: 'Cancelado', deletedAt: agora }
    }),

    prisma.campeonato.update({
      where: { id: idNum },
      data: { ativo: false, deletedAt: agora }
    })
  ]);

  return { mensagem: 'Campeonato e seus registros foram desativados com sucesso.' };
}

async function listarCampeonatosPorModalidade(modalidadeId, ano) {
  try {
    const anoFiltro = ano ? Number(ano) : new Date().getFullYear();

    const campeonatos = await prisma.campeonato.findMany({
      where: {
        modalidadeId: modalidadeId,
        ativo: true,
        deletedAt: null,
        dataInicio: {
          gte: new Date(`${anoFiltro}-01-01`),
          lte: new Date(`${anoFiltro}-12-31`)
        }
      },
      include: {
        modalidade: true,
        quadra: true,
        times: {
          where: { ativo: true, deletedAt: null },
          include: { time: true }
        },
        placares: {
          where: { visivel: true, deletedAt: null },
          include: { time: true },
          orderBy: { posicao: 'asc' }
        },
        agendamentos: {
          where: { deletedAt: null }
        }
      },
      orderBy: { dataInicio: 'desc' }
    });

    // Ajuste: adiciona os critérios de classificação
    return campeonatos.map(c => ({
      ...c,
      criteriosClassificacao: c.ordemClassificacao || []
    }));

  } catch (error) {
    console.error(error);
    throw new Error('Erro ao listar campeonatos por modalidade.');
  }
}

async function listarCampeonatosAnoAtual() {
  const anoAtual = new Date().getFullYear();
  const dataInicio = new Date(`${anoAtual}-01-01`);
  const dataFim = new Date(`${anoAtual}-12-31T23:59:59.999`);

  const campeonatos = await prisma.campeonato.findMany({
    where: {
      ativo: true,
      deletedAt: null,
      dataInicio: { gte: dataInicio, lte: dataFim }
    },
    include: {
      modalidade: true,
      quadra: true,
      placares: {
        where: { visivel: true, deletedAt: null },
        include: { time: true },
        orderBy: { posicao: 'asc' }
      }
    },
    orderBy: { dataInicio: 'desc' }
  });

  // Ajuste: inclui os critérios de classificação
  return campeonatos.map(c => ({
    ...c,
    criteriosClassificacao: c.ordemClassificacao || []
  }));
}

async function listarArtilhariaCampeonato(campeonatoId, limite = 5) {
  const artilharia = await prisma.jogadorPartida.groupBy({
    by: ['jogadorId'],
    where: {
      partida: {
        campeonatoId: Number(campeonatoId),
        status: 'FINALIZADA'
      }
    },
    _sum: {
      gols: true
    },
    orderBy: {
      _sum: {
        gols: 'desc'
      }
    },
    take: limite
  });

  const jogadoresIds = artilharia.map(a => a.jogadorId);

  const jogadores = await prisma.jogador.findMany({
    where: {
      id: { in: jogadoresIds }
    },
    include: {
      times: {
        include: {
          time: true
        }
      }
    }
  });

  // Retorna dados já com nome, foto, gols e times
  return artilharia.map(item => {
    const jogador = jogadores.find(j => j.id === item.jogadorId);

    return {
      jogadorId: item.jogadorId,
      nome: jogador?.nome,
      foto: jogador?.foto,
      gols: item._sum.gols,
      times: jogador?.times.map(t => t.time.nome) || []
    };
  });
}

async function getCampeonatoById(id) {
  try {
    const campeonato = await prisma.campeonato.findUnique({
      where: { id: Number(id) },
      include: {
        modalidade: true,
        quadra: true,
        times: true,
        partidas: true,
        placares: true
      }
    });

    if (!campeonato) return null;
    return {
      ...campeonato,
      regras: normalizarRegrasCampeonato(campeonato.regras, campeonato.modalidade?.nome)
    };
  } catch (err) {
    throw err;
  }
}

async function getRegrasCampeonato(campeonatoId) {
  const campeonato = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) },
    select: {
      id: true,
      modalidade: { select: { nome: true } },
      regras: true
    }
  });

  if (!campeonato) throw new Error("Campeonato nao encontrado");

  return normalizarRegrasCampeonato(campeonato.regras, campeonato.modalidade?.nome);
}

async function atualizarRegrasCampeonato(campeonatoId, regras) {
  const campeonatoAtual = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) },
    select: {
      id: true,
      modalidade: { select: { nome: true } }
    }
  });

  if (!campeonatoAtual) throw new Error("Campeonato nao encontrado");

  const atualizado = await prisma.campeonato.update({
    where: { id: Number(campeonatoId) },
    data: {
      regras: normalizarRegrasCampeonato(regras, campeonatoAtual.modalidade?.nome)
    },
    select: {
      id: true,
      regras: true
    }
  });

  return normalizarRegrasCampeonato(atualizado.regras, campeonatoAtual.modalidade?.nome);
}

async function atualizarDadosCampeonato(campeonatoId, dados) {
  const id = Number(campeonatoId);
  if (!id) throw new Error('ID de campeonato invalido');

  const existente = await prisma.campeonato.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!existente) throw new Error('Campeonato nao encontrado');

  const payload = {};

  if (typeof dados.nome === 'string' && dados.nome.trim()) {
    payload.nome = dados.nome.trim();
  }

  if (typeof dados.foto === 'string') {
    payload.foto = dados.foto.trim() || null;
  }

  if (dados.quadraId !== undefined) {
    payload.quadraId = dados.quadraId ? Number(dados.quadraId) : null;
  }

  if (dados.dataFim !== undefined) {
    payload.dataFim = dados.dataFim ? new Date(dados.dataFim) : null;
  }

  if (typeof dados.status === 'string' && dados.status.trim()) {
    const statusNormalizado = dados.status.trim().toUpperCase();
    const statusPermitidos = ['EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO'];
    if (!statusPermitidos.includes(statusNormalizado)) {
      throw new Error('Status de campeonato invalido');
    }
    payload.status = statusNormalizado;
  }

  const atualizado = await prisma.campeonato.update({
    where: { id },
    data: payload,
    include: {
      modalidade: true,
      quadra: true,
      times: true,
      partidas: true,
      placares: true
    }
  });

  return {
    ...atualizado,
    regras: normalizarRegrasCampeonato(atualizado.regras, atualizado.modalidade?.nome)
  };
}

async function finalizarCampeonato(campeonatoId) {
  const id = Number(campeonatoId);
  if (!id) throw new Error('ID de campeonato invalido');

  const existente = await prisma.campeonato.findUnique({
    where: { id },
    select: { id: true, status: true, dataFim: true }
  });

  if (!existente) throw new Error('Campeonato nao encontrado');

  const atualizado = await prisma.campeonato.update({
    where: { id },
    data: {
      status: 'FINALIZADO',
      dataFim: existente.dataFim || new Date()
    },
    include: {
      modalidade: true,
      quadra: true,
      times: true,
      partidas: true,
      placares: true
    }
  });

  return {
    ...atualizado,
    regras: normalizarRegrasCampeonato(atualizado.regras, atualizado.modalidade?.nome)
  };
}

async function listarPlacarPorFase(campeonatoId) {
  if (!campeonatoId) throw new Error("campeonatoId é obrigatório");

  // Busca todas as fases do campeonato
  const fases = await prisma.fase.findMany({
    where: { campeonatoId: Number(campeonatoId), ativo: true },
    orderBy: { id: 'asc' },
    include: {
      placares: {
        where: { visivel: true, deletedAt: null },
        include: { time: true },
        orderBy: { posicao: 'asc' }
      }
    }
  });

  // Retorna cada fase com seus placares
  return fases.map(fase => ({
    faseId: fase.id,
    nomeFase: fase.nome,
    placares: fase.placares
  }));
}

async function listarFasesERodadas(campeonatoId) {
  if (!campeonatoId) {
    throw new Error("campeonatoId é obrigatório");
  }

  const fases = await prisma.fase.findMany({
    where: { campeonatoId: Number(campeonatoId), ativo: true },
    orderBy: { id: "asc" },
    include: {
      rodadas: {
        orderBy: { id: "asc" }
      }
    }
  });

  return fases;
}

async function criarFase(campeonatoId, nome, times) {
  try {
    const fase = await prisma.fase.create({
      data: {
        nome,
        campeonatoId,
        ativo: true,
      },
    });

    const placaresData = times.map(timeId => ({
      campeonatoId,
      faseId: fase.id,
      timeId,
    }));

    await prisma.placar.createMany({
      data: placaresData,
      skipDuplicates: true,
    });

    return fase;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function criarRodada(faseId, nomeRodada) {
  const fase = await prisma.fase.findUnique({
    where: { id: faseId },
  });

  if (!fase) {
    throw new Error("Fase não encontrada");
  }

  const rodada = await prisma.rodada.create({
    data: {
      nome: nomeRodada,
      faseId: faseId,
    },
  });

  return rodada;
}
module.exports = {
  CRITERIOS_MODALIDADE,
  REGRAS_PADRAO_CAMPEONATO,
  criarCampeonato,
  removerCampeonato,
  listarCampeonatosPorModalidade,
  listarCampeonatosAnoAtual,
  listarArtilhariaCampeonato,
  getCampeonatoById,
  atualizarDadosCampeonato,
  finalizarCampeonato,
  getRegrasCampeonato,
  atualizarRegrasCampeonato,
  listarPlacarPorFase,
  listarFasesERodadas,
  criarFase,
  criarRodada
};
