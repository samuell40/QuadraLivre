const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const config = require('../config/app.config');

const prisma = new PrismaClient();

async function findUserByEmail(email) {
  const user = await prisma.usuario.findUnique({
    where: { email },
    include: {
      quadra: true,        // 👈 já traz dados da quadra (se tiver)
      permissao: true,     // 👈 traz dados da permissão
      times: true          // 👈 se quiser já carregar times do usuário
    }
  });

  if (!user) {
    const error = new Error('usuario_nao_cadastrado');
    error.statusCode = 404;
    throw error;
  }

  const dados_usuario = {
    id: user.id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    funcao: user.funcao, 
    permissaoId: user.permissaoId,
    foto: user.foto,
    quadraId: user.quadraId,
  };

  const token = jwt.sign(dados_usuario, config.jwtSecret, { expiresIn: config.JWT_EXPIRATION });

  return { user: dados_usuario, token };
}
module.exports = {
  findUserByEmail,
};
