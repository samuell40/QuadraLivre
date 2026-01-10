const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarAviso(dados) {
  return await prisma.aviso.create({
    data: {
      titulo: dados.titulo,
      descricao: dados.descricao,
      foto: dados.foto,
      quadraId: Number(dados.quadraId),
      autorId: Number(dados.autorId)
    }
  });
}

async function listarAvisosPorQuadra(idDaQuadra) {
  return await prisma.aviso.findMany({
    where: { quadraId: Number(idDaQuadra) },
    orderBy: { data: 'desc' },
    include: { autor: true }
  });
}

module.exports = { criarAviso, listarAvisosPorQuadra };