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

async function listarTodasQuadras(modalidadeId) {
  if (modalidadeId) {
    return prisma.quadra.findMany({
      where: {
        modalidades: {
          some: {
            id: Number(modalidadeId)
          }
        }
      },
      include: {
        modalidades: true
      }
    })
  }

  return prisma.quadra.findMany({
    include: {
      modalidades: true
    }
  })
}

 async function listarQuadrasPorModalidade(modalidadeId) {
  return prisma.quadra.findMany({
    where: {
      modalidades: {
        some: {
          id: Number(modalidadeId)
        }
      }
    },
    include: {
      modalidades: true
    }
  })
}

module.exports = { criarQuadra, listarTodasQuadras, listarQuadrasPorModalidade };