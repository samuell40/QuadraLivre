const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarQuadra(dados){
    const quadra = await prisma.quadra.create({
        data: {
            nome: dados.nome,
            foto: dados.foto,
            descricao: dados.descricao,
            endereco: dados.endereco
        },
    });
    return quadra;
};

module.exports = { criarQuadra };