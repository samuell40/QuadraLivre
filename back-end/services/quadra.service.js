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

module.exports = { criarQuadra, getQuadras, getNomesTimes, atualizarTime};
