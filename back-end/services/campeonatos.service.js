const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarCampeonato(data) {
  const { nome, descricao, dataInicio, dataFim, status, modalidadeId, quadraId, times } = data;

  const campeonato = await prisma.campeonato.create({
    data: {
      nome,
      descricao,
      dataInicio: new Date(dataInicio),
      dataFim: dataFim ? new Date(dataFim) : null,
      status,
      modalidadeId: Number(modalidadeId),
      quadraId: quadraId ? Number(quadraId) : null,

      times: {
        create: times.map(timeId => ({
          timeId: Number(timeId)
        }))
      }
    },
    include: {
      modalidade: true,
      quadra: true,
      times: {
        include: {
          time: true
        }
      }
    }
  });

  return campeonato;
}

async function removerCampeonato(campeonatoId) {
  if (!campeonatoId) {
    throw new Error('ID do campeonato é obrigatório.');
  }

  const campeonato = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) }
  });

  if (!campeonato) {
    throw new Error('Campeonato não encontrado.');
  }

  await prisma.partida.deleteMany({ where: { campeonatoId: Number(campeonatoId) } });
  await prisma.placar.deleteMany({ where: { campeonatoId: Number(campeonatoId) } });
  await prisma.campeonatoTime.deleteMany({ where: { campeonatoId: Number(campeonatoId) } });

  await prisma.campeonato.delete({ where: { id: Number(campeonatoId) } });

  return { mensagem: 'Campeonato removido com sucesso.' };
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
        placares: true
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

module.exports = { criarCampeonato, removerCampeonato, listarCampeonatosPorModalidade };