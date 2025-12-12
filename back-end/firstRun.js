const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function FirstRun() {
  try {
    await criarPermissoes();
    const quadra = await criarQuadra();
    await criarUsuarioAdmin(quadra.id);
    console.log('Setup inicial concluído!');
  } catch (error) {
    console.error('Erro no setup inicial:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function criarPermissoes() {
  const existentes = await prisma.permissao.findMany();
  if (existentes.length > 0) {
    console.log('Permissões já existem');
    return;
  }

  await prisma.permissao.createMany({
    data: [
      { descricao: 'DESENVOLVEDOR' },
      { descricao: 'ADMINISTRADOR' },
      { descricao: 'USUARIO' }, 
      { descricao: 'MESÁRIO' },
    ],
  });

  console.log('Permissões criadas');
}

async function criarQuadra() {
  let quadra = await prisma.quadra.findFirst({
    where: { nome: 'Quadra Livre' },
  });

  if (quadra) {
    console.log('Quadra já existe');
    return quadra;
  }

  quadra = await prisma.quadra.create({
    data: {
      nome: 'Quadra Livre',
      foto: 'https://example.com/foto.png',
      endereco: 'Rua das Quadras, 123',
    },
  });

  console.log('Quadra criada');
  return quadra;
}

async function criarUsuarioAdmin(quadraId) {
  const existe = await prisma.usuario.findFirst({
    where: { email: 'samuelpc4567@gmail.com' },
  });

  if (existe) {
    console.log('Usuário admin já existe');
    return;
  }

  const permissao = await prisma.permissao.findFirst({
    where: { descricao: 'DESENVOLVEDOR_DE_SISTEMA' },
  });

  if (!permissao) {
    console.error('Permissão ADMIN não encontrada');
    return;
  }

  await prisma.usuario.create({
    data: {
      nome: 'Samuel',
      email: 'samuelpc4567@gmail.com',
      telefone: '84999999999',
      funcao: 'usuario', 
      foto: 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png',
      permissaoId: permissao.id,
      quadraId: quadraId,
    },
  });

  console.log('Usuário admin criado');
}

if (require.main === module) {
  FirstRun().then(() => process.exit(0));
}

module.exports = { FirstRun };