const prisma = require('../lib/prisma');

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
