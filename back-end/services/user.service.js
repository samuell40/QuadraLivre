const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('../utils/bcrypt.utils');
const config = require('../config/app.config');
require('dotenv').config();

// services/user.service.js
async function LoginUser({ email, senha }) {
    const user = await prisma.Usuario.findFirst({
        where: { email }
    });

    if (!user) {
        throw new Error('Usuário ou senha não encontrados');
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
        throw new Error('Usuário ou senha inválidos');
    }

    return { user };
}

module.exports = { LoginUser };


