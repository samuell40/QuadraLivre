const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

  const listaDatasReais = Array.isArray(datasJogos)
    ? datasJogos.map(d => new Date(d))
    : [];

  const timesArray = Array.isArray(times) ? times : [];

  return await prisma.$transaction(async (tx) => {

    // Lógica para remover agendamentos conflitantes
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
      modalidadeId: Number(modalidadeId),
      status: "Confirmado",
      tipo: "EVENTO",
      duracao: 1
    }));

    // Cria o campeonato
    const campeonato = await tx.campeonato.create({
      data: {
        nome,
        tipo,
        foto,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        status,
        modalidadeId: Number(modalidadeId),
        quadraId: Number(quadraId),
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

    // Se for campeonato de pontos corridos, criar fase e rodada
    if (tipo === "PONTOS_CORRIDOS") {
      const fase = await tx.fase.create({
        data: {
          nome: "Fase Única",
          campeonatoId: campeonato.id
        }
      });

      // Cria a primeira rodada associada à fase
      await tx.rodada.create({
        data: {
          nome: "Rodada 1",
          faseId: fase.id
        }
      });

      // Atualiza os placares para vincular à fase criada
      await tx.placar.updateMany({
        where: { campeonatoId: campeonato.id },
        data: { faseId: fase.id }
      });
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
        },
        agendamentos: {
          where: { deletedAt: null }
        }
      },
      orderBy: { dataInicio: 'desc' }
    });

    return campeonatos;
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao listar campeonatos por modalidade.');
  }
}

async function listarCampeonatosAnoAtual() {
  const anoAtual = new Date().getFullYear();
  const dataInicio = new Date(`${anoAtual}-01-01`);
  const dataFim = new Date(`${anoAtual}-12-31T23:59:59.999`);

  return prisma.campeonato.findMany({
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
    if (!Array.isArray(times) || times.length === 0) {
      throw new Error('É necessário informar os times da fase');
    }

    // cria a fase
    const fase = await prisma.fase.create({
      data: {
        nome,
        campeonatoId,
        ativo: true,
      },
    });

    // cria placar APENAS para os times da fase
    const placaresData = times.map(timeId => ({
      campeonatoId,
      faseId: fase.id,
      timeId,
    }));

    await prisma.placar.createMany({
      data: placaresData,
      skipDuplicates: true, // segurança extra
    });

    return fase;
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { criarCampeonato, removerCampeonato, listarCampeonatosPorModalidade, listarCampeonatosAnoAtual, listarArtilhariaCampeonato, getCampeonatoById, listarPlacarPorFase, listarFasesERodadas, criarFase };