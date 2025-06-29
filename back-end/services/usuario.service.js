const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function postUsuario(user) {
  const cadastro = await prisma.Usuario.create({
    data: {
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      funcao: "Usuario",
      foto: user.foto,
      permissaoId: 45,
    },
  })
  return cadastro;
}
async function updateUsuario(user) {
  const permissao = await prisma.permissao.findFirst({
    where: { descricao: user.funcao },
  });

  let dadosAtualizados = {
    permissaoId: permissao.id,
    funcao: permissao.descricao,
  };

  // Se a permissão NÃO for DESENVOLVEDOR_DE_SISTEMA nem USUARIO, atualiza quadraId
  if (permissao.descricao !== 'DESENVOLVEDOR_DE_SISTEMA' && permissao.descricao !== 'USUARIO') {
    const quadra = await prisma.quadra.findFirst({
      where: { nome: user.quadra },
    });

    dadosAtualizados.quadraId = quadra.id;
  } else {
    dadosAtualizados.quadraId = null; 
  }

  const usuarioAtualizado = await prisma.usuario.update({
    where: { email: user.email },
    data: dadosAtualizados,
  });

  return usuarioAtualizado;
}

async function getUsuarios() {
  const usuarios = await prisma.usuario.findMany({
    include: {
      agendamentos: true,
      quadra: true,
    },
  });

  const usuariosFormatados = usuarios.map((user) => ({
    id: user.id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    foto: user.foto,
    funcao: user.funcao,
    quadra: user.quadra ? user.quadra.nome : null,
    totalAgendamentos: user.agendamentos.length,
  }));

  return usuariosFormatados;
}

async function listarPermissoes() {
  return await prisma.permissao.findMany();
}

module.exports = { postUsuario, updateUsuario, getUsuarios, listarPermissoes};