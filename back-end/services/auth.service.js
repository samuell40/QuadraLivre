const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserByEmail(email) {
  const user = await prisma.usuario.findUnique({
    where: { email },
    include: {
      quadra: true,
      permissao: true,
      times: true
    }
  });

  return user;
}

module.exports = { findUserByEmail };
