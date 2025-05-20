const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const bcryptUtil = require("../utils/bcrypt.utils");

async function postUsuario(user) {

    let senha_user = bcryptUtil.hash(user.usuario.senha, 10);
    const cadastro = await prisma.Usuario.create({
        data: {
            nome: user.usuario.nome,
            email: user.usuario.email,
            senha: senha_user,
            foto: user.usuario.foto,
            permissaoId: 1,
            quadraId: user.usuario.quadraId
        },
    });

    return cadastro;
}


module.exports = { postUsuario };