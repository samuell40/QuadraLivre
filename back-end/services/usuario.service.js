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
  const quadra = await prisma.quadra.findFirst({
    where: { nome: user.quadra },
  });

  const permissao = await prisma.permissao.findFirst({
    where: { descricao: user.funcao },
  });

  const usuarioAtualizado = await prisma.usuario.update({
    where: { email: user.email },
    data: {
      quadraId: quadra.id,
      permissaoId: permissao.id,
      funcao:permissao.descricao,
    },
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
  return await prisma.permissao.findMany({
    where: {
      descricao: {
        in: ['ADMINISTRADOR', 'DESENVOLVEDOR_DE_SISTEMA'], 
      },
    },
  });
}

module.exports = { postUsuario, updateUsuario, getUsuarios, listarPermissoes};