const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarQuadra(dados){
    const quadra = await prisma.quadra.create({
        data: {
            nome: dados.nome,
            descricao: dados.descricao,
            endereco: dados.endereco,
            foto: dados.foto, 
        },
    });
    return quadra;
};

async function getQuadras(){
    return await prisma.quadra.findMany()
}

async function criarTimeService(dados) {
   console.log('Dados recebidos:', dados);
  const placar = await prisma.placar.create({
    data: {
      time: dados.time,
      foto: dados.foto,
      pontuacao: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      golsMarcados: 0,
    }
  });
  return placar;
}

async function getNomesTimes() {
  try {
    const placares = await prisma.placar.findMany({
      select: {
        time: true
      },
      distinct: ['time']
    });

    return placares.map(p => p.time);
  } catch (error) {
    throw error;
  }
}

async function buscarTimeNome(nome) {
   const time = await prisma.placar.findUnique({
      where: { time: nome }
    });
    return time;
}

async function atualizarTime(nome, dados) {
  return await prisma.placar.update({
    where: { time: nome },
    data: {
      golsMarcados: dados.gols,
      pontuacao: dados.pts,
      empates: dados.empates,
      vitorias: dados.vitorias,
      derrotas: dados.derrotas
    }
  });
}

async function listarPlacar(){
  return await prisma.placar.findMany({
    orderBy: { pontuacao: 'desc' },
  });
}

module.exports = { criarQuadra, getQuadras, criarTimeService, getNomesTimes, buscarTimeNome, atualizarTime, listarPlacar};