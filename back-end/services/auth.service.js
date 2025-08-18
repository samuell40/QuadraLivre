const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const config = require('../config/app.config');

const prisma = new PrismaClient();

async function findUserByEmail(email) {
  const user = await prisma.usuario.findUnique({ where: { email } });

  if (!user) {
    const error = new Error('usuario_nao_cadastrado');
    error.statusCode = 404;
    throw error;
  }

  const dados_usuario = {
    id: user.id,
    nome: user.nome,
    email: user.email,
    permissaoId: user.permissaoId, // 👈 já manda o id da permissão
    foto: user.foto,
    telefone: user.telefone,
  };

  const token = jwt.sign(dados_usuario, config.jwtSecret, { expiresIn: config.JWT_EXPIRATION });

  return { user: dados_usuario, token };
}


module.exports = {
  findUserByEmail,
};
