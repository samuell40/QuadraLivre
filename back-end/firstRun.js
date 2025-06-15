const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function FirstRun() {

  await criarPermissoes();
  const quadra = await criarQuadra();
  await criarUsuarioAdmin(quadra.id);
}

async function criarPermissoes() {
  const existentes = await prisma.permissao.findMany();
  if (existentes.length > 0) {
    console.log('Permissões já existem');
    return;
  }

  await prisma.permissao.createMany({
    data: [
      { descricao: 'Admin' },
      { descricao: 'Usuario' },
    ],
  });

  console.log('Permissões criadas');
}

async function criarQuadra() {
  const existente = await prisma.quadra.findFirst({
    where: { nome: 'Quadra Livre' },
  });

  if (existente) {
    console.log('Quadra já existe');
    return existente;
  }

  const quadra = await prisma.quadra.create({
    data: {
      nome: 'Quadra Livre',
      descricao: 'Quadra oficial do sistema',
      foto: 'https://example.com/foto.png',
      endereco: 'Rua das Quadras, 123',
    },
  });
  return quadra;
}

async function criarUsuarioAdmin(quadraId) {
  const existe = await prisma.usuario.findFirst({
    where: { email: 'admin@quadra.com' },
  });

  if (existe) {
    console.log('Usuário admin já existe');
    return;
  }

  const permissao = await prisma.permissao.findFirst({
    where: { descricao: 'Admin' },
  });

  if (!permissao) {
    console.error('Permissão Admin não encontrada');
    return;
  }

  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@quadra.com',
      telefone: '84999999999',
      funcao: 'Administrador do Sistema',
      foto: 'https://example.com/admin.png',
      permissaoId: permissao.id,
      quadraId: quadraId,
    },
  });

  console.log('Usuário admin criado');
}

module.exports = { FirstRun };
