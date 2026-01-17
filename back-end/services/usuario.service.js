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
        include: { time: true }, // vínculo de usuário com times
      },
    },
  });

  const usuariosComJogador = [];

  for (const user of usuarios) {
    // Busca o jogador vinculado ao usuário
    const jogador = await prisma.jogador.findFirst({
      where: { usuarioId: user.id },
      include: {
        times: {
          include: {
            time: true,       // pega o time
            modalidade: true, // opcional, se quiser mostrar modalidade
          },
        },
      },
    });

    let jogadorFormatado = null;

    if (jogador) {
      // Pega todos os nomes de times do jogador
      const nomesTimes = jogador.times.map(t => t.time.nome);

      jogadorFormatado = {
        id: jogador.id,
        nome: jogador.nome,
        times: nomesTimes, // array de todos os nomes de times
      };
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
      times: user.times.map(ut => ut.time), // times do usuário
      jogador: jogadorFormatado,             // agora com todos os times
      totalAgendamentos: user.agendamentos.length,
    });
  }

  return usuariosComJogador;
}

async function listarPermissoes() {
  return prisma.permissao.findMany({
    orderBy: { id: 'asc' },
  });
}

async function vincularUsuarioTime(usuarioId, timeId, jogadorId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { permissao: true, jogador: true },
  });
  if (!usuario) throw new Error('Usuário não encontrado');

  const time = await prisma.time.findUnique({
    where: { id: timeId },
    include: { modalidade: true },
  });
  if (!time) throw new Error('Time não encontrado');

  const jogador = await prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: { times: { include: { modalidade: true, time: true } } },
  });
  if (!jogador) throw new Error('Jogador não encontrado');

  const modalidadeId = time.modalidadeId;

  const jogadorTimeExistente = await prisma.jogadorTime.findUnique({
    where: { jogadorId_modalidadeId: { jogadorId, modalidadeId } },
  });

  if (jogadorTimeExistente) {
    await prisma.jogadorTime.update({
      where: { jogadorId_modalidadeId: { jogadorId, modalidadeId } },
      data: { timeId },
    });
  } else {
    await prisma.jogadorTime.create({
      data: {
        jogadorId,
        timeId,
        modalidadeId,
      },
    });
  }

  if (!jogador.usuarioId || jogador.usuarioId !== usuarioId) {
    await prisma.jogador.update({
      where: { id: jogadorId },
      data: { usuarioId },
    });
  }

  const jogadorAtualizado = await prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: { times: { include: { time: true, modalidade: true } } },
  });

  await enviarEmailVinculoTime(usuario, time, jogadorAtualizado);

  return jogadorAtualizado;
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