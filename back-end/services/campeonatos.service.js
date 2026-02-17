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
    foto
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
      data: { ativo: false, cancelada: true, deletedAt: agora }
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

    return campeonato;
  } catch (err) {
    throw err;
  }
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
module.exports = { CRITERIOS_MODALIDADE, criarCampeonato, removerCampeonato, listarCampeonatosPorModalidade, listarCampeonatosAnoAtual, listarArtilhariaCampeonato, getCampeonatoById, listarPlacarPorFase, listarFasesERodadas, criarFase, criarRodada };