const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserByEmail(email) {
  const buscarEmail = await prisma.usuario.findUnique({
    where: { email }
  });
  return buscarEmail;
}

module.exports = {
  findUserByEmail
};
