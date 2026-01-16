const { enviarEmailAlteracaoPermissao, enviarEmailVinculoTime } = require('./email.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function postUsuario(user) {
  return prisma.usuario.create({
    data: {
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      foto: user.foto,
      permissaoId: 3,
      quadraId: null,
    },
    include: {
      permissao: true,
    },
  });
}

async function updateUsuario(user) {
  const usuarioDb = await prisma.usuario.findUnique({
    where: { email: user.email },
    include: { quadra: true, permissao: true },
  });

  if (!usuarioDb) {
    throw new Error('Usuário não encontrado');
  }

  const dadosAtualizados = {
    permissaoId: user.permissaoId,
    quadraId: null,
  };

  // Se for ADMIN (2), pode ter quadra
  if (user.permissaoId === 2 && user.quadraId) {
    const quadra = await prisma.quadra.findUnique({
      where: { id: user.quadraId },
    });

    dadosAtualizados.quadraId = quadra ? quadra.id : null;
  }

  // 🔴 Se NÃO for Jogador
  if (user.permissaoId !== 3) {
    // Remove vínculo com times
    await prisma.usuarioTime.deleteMany({
      where: { usuarioId: usuarioDb.id },
    });

    // Remove vínculo com jogador
    await prisma.jogador.updateMany({
      where: { usuarioId: usuarioDb.id },
      data: { usuarioId: null },
    });
  }

  const usuarioAtualizado = await prisma.usuario.update({
    where: { email: user.email },
    data: dadosAtualizados,
    include: { quadra: true, permissao: true },
  });

  await enviarEmailAlteracaoPermissao(usuarioAtualizado);

  return usuarioAtualizado;
}

async function getUsuarios() {
  const usuarios = await prisma.usuario.findMany({
    include: {
      agendamentos: true,
      quadra: true,
      permissao: true,
      times: {
        include: { time: true },
      },
    },
  })

  const usuariosComJogador = []

  for (const user of usuarios) {
    const jogador = await prisma.jogador.findFirst({
      where: { usuarioId: user.id },
      include: { time: true },
    })

    let jogadorFormatado = null

    if (jogador) {
      let nomeTime = null

      if (jogador.time) {
        nomeTime = jogador.time.nome
      }

      jogadorFormatado = {
        id: jogador.id,
        nome: jogador.nome,
        time: nomeTime,
      }
    }

    usuariosComJogador.push({
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      foto: user.foto,
      permissaoId: user.permissaoId,
      permissao: user.permissao,
      quadra: user.quadra,
      times: user.times.map(ut => ut.time),
      jogador: jogadorFormatado,
      totalAgendamentos: user.agendamentos.length,
    })
  }

  return usuariosComJogador
}

async function listarPermissoes() {
  return prisma.permissao.findMany({
    orderBy: { id: 'asc' },
  });
}

async function vincularUsuarioTime(usuarioId, timeId, jogadorId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { permissao: true },
  });

  if (!usuario) throw new Error('Usuário não encontrado');

  const time = await prisma.time.findUnique({
    where: { id: timeId },
    include: { modalidade: true },
  });

  if (!time) throw new Error('Time não encontrado');

  const jogador = await prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: { time: { include: { modalidade: true } } },
  });

  if (!jogador) throw new Error('Jogador não encontrado');

  if (jogador.timeId !== timeId) {
    throw new Error('Jogador não pertence a este time');
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
      where: {
        usuarioId_timeId: {
          usuarioId,
          timeId: vinculoMesmoModalidade.time.id,
        },
      },
    });
  }

  const vinculo = await prisma.usuarioTime.create({
    data: { usuarioId, timeId },
  });

  const jogadorAtualizado = await prisma.jogador.update({
    where: { id: jogadorId },
    data: {
      usuarioId: usuario.id,
      timeId: time.id,
    },
  });

  await enviarEmailVinculoTime(usuario, time, jogadorAtualizado);

  return {
    vinculo,
    jogador: jogadorAtualizado,
  };
}

async function getUsuarioTimesService(usuarioId) {
  return prisma.usuario.findUnique({
    where: { id: Number(usuarioId) },
    include: {
      times: {
        include: {
          time: {
            include: {
              modalidade: true,
            },
          },
        },
      },
    },
  });
}

module.exports = {
  postUsuario,
  updateUsuario,
  getUsuarios,
  getUsuarioTimesService,
  listarPermissoes,
  vincularUsuarioTime,
};