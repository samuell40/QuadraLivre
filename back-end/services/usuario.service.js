const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function postUsuario(user) {
  const cadastro = await prisma.Usuario.create({
    data: {
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      funcao: "USUARIO",
      foto: user.foto,
      permissaoId: 3,
    },
  })
  return cadastro;
}

async function updateUsuario(user) {
  const usuarioDb = await prisma.usuario.findUnique({
    where: { email: user.email },
  });

  if (!usuarioDb) {
    throw new Error('Usuário não encontrado');
  }

  // Valores base sempre atualizados
  let dadosAtualizados = {
    funcao: user.funcao,
    permissaoId: user.permissaoId,
    quadraId: null, // padrão
  };

  // Apenas atualiza quadra se for ADMINISTRADOR
  if (user.permissaoId === 2 && user.quadra) {
    const quadra = await prisma.quadra.findUnique({ where: { id: user.quadra } });
    dadosAtualizados.quadraId = quadra ? quadra.id : null;
  }

  // Remove vínculos de time se não for USUARIO
  if (user.permissaoId !== 3) {
    await prisma.usuarioTime.deleteMany({ where: { usuarioId: usuarioDb.id } });
  }

  // Atualiza usuário
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
      times: {
        include: {
          time: true,
        }
      }
    }
  });

  const usuariosFormatados = usuarios.map(user => ({
    id: user.id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    foto: user.foto,
    funcao: user.funcao,
    quadra: user.quadra ? user.quadra.nome : null,
    times: user.times.map(ut => ut.time), 
    totalAgendamentos: user.agendamentos.length,
  }));

  return usuariosFormatados;
}

async function listarPermissoes() {
  return await prisma.permissao.findMany();
}

async function vincularUsuarioTime(usuarioId, timeId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });
  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  const time = await prisma.time.findUnique({
    where: { id: timeId },
    include: { modalidade: true },
  });
  if (!time) {
    throw new Error('Time não encontrado');
  }

  const vinculoMesmoModalidade = await prisma.usuarioTime.findFirst({
    where: {
      usuarioId,
      time: { modalidadeId: time.modalidadeId },
    },
    include: { time: true },
  });

  if (vinculoMesmoModalidade) {
    if (vinculoMesmoModalidade.time.id === timeId) {
      throw new Error('Usuário já está vinculado a este time');
    }

    await prisma.usuarioTime.delete({
      where: { usuarioId_timeId: { usuarioId, timeId: vinculoMesmoModalidade.time.id } },
    });
  }

  const vinculo = await prisma.usuarioTime.create({
    data: { usuarioId, timeId },
  });

  return vinculo;
}

module.exports = { postUsuario, updateUsuario, getUsuarios, listarPermissoes, vincularUsuarioTime};