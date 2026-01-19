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
    include: {
      quadra: true,
      permissao: true,
    },
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

  // 🔴 Se NÃO for Jogador (3)
  if (user.permissaoId !== 3) {
    // Remove vínculo Usuario ↔ Time
    await prisma.usuarioTime.deleteMany({
      where: { usuarioId: usuarioDb.id },
    });
  }

  // Atualiza usuário
  const usuarioAtualizado = await prisma.usuario.update({
    where: { email: user.email },
    data: dadosAtualizados,
    include: {
      quadra: true,
      permissao: true,
    },
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

      jogador: {
        include: {
          times: {
            include: {
              time: true,
              modalidade: true,
            },
          },
        },
      },

      times: {
        include: {
          time: true,
        },
      },

      treinadorTimes: {
        include: {
          time: true,
        },
      },
    },
  });

  return usuarios.map(user => {
    let jogador = null;
    let timesJogador = [];

    if (user.jogador) {
      jogador = {
        id: user.jogador.id,
        nome: user.jogador.nome,
        foto: user.jogador.foto,
      };

      timesJogador = user.jogador.times.map(jt => ({
        id: jt.time.id,
        nome: jt.time.nome,
        modalidade: jt.modalidade.nome,
      }));
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      foto: user.foto,
      permissaoId: user.permissaoId,
      permissao: user.permissao,
      quadra: user.quadra,

      jogador,
      timesJogador,

      times: user.times.map(ut => ({
        id: ut.time.id,
        nome: ut.time.nome,
      })),

      timesComoTreinador: user.treinadorTimes.map(tt => ({
        id: tt.time.id,
        nome: tt.time.nome,
      })),

      totalAgendamentos: user.agendamentos.length,
    };
  });
}

async function listarPermissoes() {
  return prisma.permissao.findMany({
    orderBy: { id: 'asc' },
  });
}

async function vincularUsuarioTime(usuarioId, timeId, jogadorId) {
  // 1️⃣ Busca usuário
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { permissao: true },
  });
  if (!usuario) throw new Error('Usuário não encontrado');

  // 2️⃣ Busca time
  const time = await prisma.time.findUnique({
    where: { id: timeId },
    include: { modalidade: true },
  });
  if (!time) throw new Error('Time não encontrado');

  // 3️⃣ Busca jogador
  const jogador = await prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: {
      times: {
        include: {
          time: true,
          modalidade: true,
        },
      },
    },
  });
  if (!jogador) throw new Error('Jogador não encontrado');

  const modalidadeId = time.modalidadeId;

  // 4️⃣ VINCULA USUÁRIO ↔ JOGADOR (ERA O QUE FALTAVA)
  if (!usuario.jogadorId || usuario.jogadorId !== jogadorId) {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        jogadorId,
      },
    });
  }

  // 5️⃣ VINCULA USUÁRIO ↔ TIME
  await prisma.usuarioTime.upsert({
    where: {
      usuarioId_timeId: {
        usuarioId,
        timeId,
      },
    },
    update: {},
    create: {
      usuarioId,
      timeId,
    },
  });

  // 6️⃣ VINCULA / ATUALIZA JOGADOR ↔ TIME ↔ MODALIDADE
  const jogadorTimeExistente = await prisma.jogadorTime.findUnique({
    where: {
      jogadorId_modalidadeId: {
        jogadorId,
        modalidadeId,
      },
    },
  });

  if (jogadorTimeExistente) {
    await prisma.jogadorTime.update({
      where: {
        jogadorId_modalidadeId: {
          jogadorId,
          modalidadeId,
        },
      },
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

  // 7️⃣ Busca jogador atualizado
  const jogadorAtualizado = await prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: {
      times: {
        include: {
          time: true,
          modalidade: true,
        },
      },
    },
  });

  // 8️⃣ Envia e-mail
  await enviarEmailVinculoTime(usuario, time, jogadorAtualizado);

  // 9️⃣ Retorno
  return {
    vinculo: {
      usuarioId,
      timeId,
    },
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