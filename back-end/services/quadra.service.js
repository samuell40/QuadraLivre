const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarQuadra(dados) {
  const quadra = await prisma.quadra.create({
    data: {
      nome: dados.nome,
      endereco: dados.endereco,
      foto: dados.foto,
      modalidades: {
        connect: dados.modalidades, 
      },
    },
    include: {
      modalidades: true,
    },
  });

  return quadra;
}

async function getQuadras(modalidadeId) {
  return prisma.quadra.findMany({
    where: modalidadeId
      ? {
          modalidades: {
            some: {
              id: Number(modalidadeId),
            },
          },
        }
      : undefined,

    include: {
      modalidades: true,
    },
  });
}

module.exports = { criarQuadra, getQuadras};