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
  } = data;

  const campeonatoData = {
    nome,
    descricao,
    dataInicio: new Date(dataInicio),
    modalidadeId: Number(modalidadeId),
  };

  if (status) {
    campeonatoData.status = status;
  }

  if (dataFim) {
    campeonatoData.dataFim = new Date(dataFim);
  }

  if (quadraId) {
    campeonatoData.quadraId = Number(quadraId);
  }

  const campeonato = await prisma.campeonato.create({
    data: campeonatoData,
    include: {
      modalidade: true,
      quadra: true,
    },
  });

  return campeonato;
}

async function listarCampeonatosPorModalidade(modalidadeId) {
  try {
    const campeonatos = await prisma.campeonato.findMany({
      where: {
        modalidadeId: modalidadeId
      },
      include: {
        modalidade: true, // Inclui detalhes da modalidade
        quadra: true,     // Inclui detalhes da quadra
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


module.exports = { criarCampeonato, listarCampeonatosPorModalidade };