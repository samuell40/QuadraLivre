const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarCampeonato(data) {
  const {
    nome,
    descricao,
    dataInicio,
    dataFim,
    status,
    modalidadeId,
    quadraId,
    times,
    datasJogos,
    usuarioId
  } = data;

  const listaDatasReais = datasJogos ? datasJogos.map(d => new Date(d)) : [];

  return await prisma.$transaction(async (tx) => {

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

    const campeonato = await tx.campeonato.create({
      data: {
        nome,
        descricao,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        status,
        modalidadeId: Number(modalidadeId),
        quadraId: Number(quadraId),

        times: {
          create: times.map(timeId => ({ timeId: Number(timeId) }))
        },

        agendamentos: {
          create: agendamentosParaCriar
        },

        placares: {
          create: times.map(timeId => ({ timeId: Number(timeId) }))
        }
      },
      include: {
        modalidade: true,
        quadra: true,
        times: { include: { time: true } },
        agendamentos: true
      }
    });

    return campeonato;
  });
}

async function removerCampeonato(campeonatoId) {  //ver essa questão de transação!
  if (!campeonatoId) {
    throw new Error('ID do campeonato é obrigatório.');
  }

  const idNum = Number(campeonatoId);

  const existe = await prisma.campeonato.findUnique({ where: { id: idNum } });
  if (!existe) throw new Error('Campeonato não encontrado.');

  await prisma.$transaction([
    prisma.partida.deleteMany({ where: { campeonatoId: idNum } }),
    prisma.placar.deleteMany({ where: { campeonatoId: idNum } }),
    prisma.campeonatoTime.deleteMany({ where: { campeonatoId: idNum } }),
    prisma.agendamento.deleteMany({ where: { campeonatoId: idNum } }),

    prisma.campeonato.delete({ where: { id: idNum } })
  ]);

  return { mensagem: 'Campeonato e seus agendamentos removidos com sucesso.' };
}

async function listarCampeonatosPorModalidade(modalidadeId, ano) {
  try {
    const anoFiltro = ano ? Number(ano) : new Date().getFullYear();

    const campeonatos = await prisma.campeonato.findMany({
      where: {
        modalidadeId: modalidadeId,
        dataInicio: {
          gte: new Date(`${anoFiltro}-01-01`),
          lte: new Date(`${anoFiltro}-12-31`)
        }
      },
      include: {
        modalidade: true,
        quadra: true,
        times: {
          include: {
            time: true
          }
        },
        placares: true,
        agendamentos: true
      },
      orderBy: {
        dataInicio: 'desc'
      }
    });

    return campeonatos;
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao listar campeonatos por modalidade.');
  }
}

async function listarCampeonatosAnoAtual() {
  const anoAtual = new Date().getFullYear()

  const dataInicio = new Date(`${anoAtual}-01-01`)
  const dataFim = new Date(`${anoAtual}-12-31T23:59:59.999`)

  return prisma.campeonato.findMany({
    where: {
      dataInicio: {
        gte: dataInicio,
        lte: dataFim
      }
    },
    include: {
      modalidade: true,
      quadra: true,
      placares: {
        where: {
          visivel: true
        },
        include: {
          time: true
        },
        orderBy: {
          posicao: 'asc'
        }
      }
    },
    orderBy: {
      dataInicio: 'desc'
    }
  })
}

async function listarArtilhariaCampeonato(campeonatoId, limite = 5) {
  const artilharia = await prisma.jogadorPartida.groupBy({
    by: ['jogadorId'],
    where: {
      partida: {
        campeonatoId: Number(campeonatoId),
        finalizada: true
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

  // buscar dados do jogador (nome, foto, time)
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

  // junta gols + dados do jogador
  return artilharia.map(item => {
    const jogador = jogadores.find(j => j.id === item.jogadorId);

    return {
      jogadorId: item.jogadorId,
      nome: jogador?.nome,
      foto: jogador?.foto,
      gols: item._sum.gols,
      times: jogador?.times.map(t => t.time.nome)
    };
  });
}


module.exports = { criarCampeonato, removerCampeonato, listarCampeonatosPorModalidade, listarCampeonatosAnoAtual, listarArtilhariaCampeonato };