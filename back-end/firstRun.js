const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function FirstRun() {
  try {
    await criarPermissoes()
    const quadra = await criarQuadraPadrao()
    await criarUsuarioDesenvolvedor(quadra.id)

    console.log('Setup inicial concluído com sucesso!')
  } catch (error) {
    console.error(' Erro no setup inicial:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function criarPermissoes() {
  const permissoes = [
    'DESENVOLVEDOR',
    'ADMINISTRADOR',
    'USUARIO',
    'MESARIO'
  ]

  for (const descricao of permissoes) {
    await prisma.permissao.upsert({
      where: { descricao },
      update: {},
      create: { descricao }
    })
  }

  console.log('✔ Permissões verificadas/criadas')
}

async function criarQuadraPadrao() {
  const quadra = await prisma.quadra.upsert({
    where: { nome: 'Quadra Livre' },
    update: {},
    create: {
      nome: 'Quadra Livre',
      endereco: 'Rua das Quadras, 123',
      foto: 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png'
    }
  })

  console.log('✔ Quadra padrão verificada/criada')
  return quadra
}

async function criarUsuarioDesenvolvedor(quadraId) {
  const permissao = await prisma.permissao.findFirst({
    where: { descricao: 'DESENVOLVEDOR' }
  })

  if (!permissao) {
    throw new Error('Permissão DESENVOLVEDOR não encontrada')
  }

  await prisma.usuario.upsert({
    where: { email: 'samuelpc4567@gmail.com' },
    update: {},
    create: {
      nome: 'Samuel',
      email: 'samuelpc4567@gmail.com',
      telefone: '84999999999',
      funcao: 'DESENVOLVEDOR',
      foto: 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png',
      permissaoId: permissao.id,
      quadraId
    }
  })

  console.log('✔ Usuário desenvolvedor verificado/criado')
}

if (require.main === module) {
  FirstRun().then(() => process.exit(0))
}

module.exports = { FirstRun }