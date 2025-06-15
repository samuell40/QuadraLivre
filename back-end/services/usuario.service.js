const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()


async function postUsuario(user){
    const cadastro = await prisma.Usuario.create({
        data: {
            nome: user.nome,
            email: user.email,
            telefone: user.telefone,
            funcao: "Usuario",
            foto: user.foto,
            permissaoId: 1,
        },
    })
      return cadastro;
}

async function updateUsuario(user){
    const usuarioAtualizado = await prisma.Usuario.update({
        where: { email: user.email},
        data: {
            email: user.email_novo,
            nome: user.nome,
            telefone: user.telefone,
            foto: user.foto,
            permissaoId: user.permissaoId,
            funcao: user.funcao
        },
    });
    return usuarioAtualizado;
}

module.exports = { postUsuario, updateUsuario };