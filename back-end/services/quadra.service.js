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
  const buscarQuadras = await prisma.quadra.findMany()
  return buscarQuadras;
}

module.exports = { criarQuadra, getQuadras};