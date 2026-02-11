const { enviarEmailAlteracaoPermissao, enviarEmailVinculoTime } = require('./email.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cadastrarUsuario(user) {
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

async function atualizarUsuario(user) {
  return prisma.$transaction(async tx => {
    const usuarioDb = await tx.usuario.findUnique({
      where: { email: user.email },
      include: {
        quadra: true,
        permissao: true,
      },
    });

    if (!usuarioDb || usuarioDb.deletedAt) {
      throw new Error('Usuário não encontrado');
    }

    const dadosAtualizados = {
      permissaoId: user.permissaoId,
      quadraId: null,
    };

    if (user.permissaoId === 2 && user.quadraId) {
      const quadra = await tx.quadra.findUnique({
        where: { id: user.quadraId },
      });

      dadosAtualizados.quadraId = quadra ? quadra.id : null;
    }

    // Se NÃO for Jogador
    if (user.permissaoId !== 3) {
      await tx.usuarioTime.updateMany({
        where: {
          usuarioId: usuarioDb.id,
          ativo: true,
        },
        data: { ativo: false },
      });
    }

    const usuarioAtualizado = await tx.usuario.update({
      where: { id: usuarioDb.id },
      data: dadosAtualizados,
      include: {
        quadra: true,
        permissao: true,
      },
    });

    await enviarEmailAlteracaoPermissao(usuarioAtualizado);

    return usuarioAtualizado;
  });
}

async function getUsuarios() {
  const usuarios = await prisma.usuario.findMany({
    where: {
      ativo: true,
      deletedAt: null,
    },
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

      timesJogador = user.jogador.times
        .filter(jt => jt.ativo)
        .map(jt => ({
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
      times: user.times
        .filter(ut => ut.ativo)
        .map(ut => ({
          id: ut.time.id,
          nome: ut.time.nome,
        })),
      timesComoTreinador: user.treinadorTimes
        .filter(tt => tt.time?.ativo)
        .map(tt => ({
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
  return prisma.$transaction(async tx => {
    const usuario = await tx.usuario.findUnique({
      where: { id: usuarioId },
      include: { permissao: true },
    });
    if (!usuario || usuario.deletedAt) throw new Error('Usuário não encontrado');

    const time = await tx.time.findUnique({
      where: { id: timeId },
      include: { modalidade: true },
    });
    if (!time || time.deletedAt) throw new Error('Time não encontrado');

    const jogador = await tx.jogador.findUnique({
      where: { id: jogadorId },
      include: {
        times: {
          where: { ativo: true },
          include: {
            time: true,
            modalidade: true,
          },
        },
      },
    });
    if (!jogador || jogador.deletedAt) throw new Error('Jogador não encontrado');

    if (usuario.jogadorId !== jogadorId) {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { jogadorId },
      });
    }

    await tx.usuarioTime.upsert({
      where: {
        usuarioId_timeId: { usuarioId, timeId },
      },
      update: { ativo: true },
      create: { usuarioId, timeId },
    });

    const modalidadeId = time.modalidadeId;

    await tx.jogadorTime.upsert({
      where: {
        jogadorId_modalidadeId: { jogadorId, modalidadeId },
      },
      update: {
        timeId,
        ativo: true,
      },
      create: {
        jogadorId,
        timeId,
        modalidadeId,
      },
    });

    const jogadorAtualizado = await tx.jogador.findUnique({
      where: { id: jogadorId },
      include: {
        times: {
          where: { ativo: true },
          include: {
            time: true,
            modalidade: true,
          },
        },
      },
    });

    await enviarEmailVinculoTime(usuario, time, jogadorAtualizado);

    return { jogador: jogadorAtualizado };
  });
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
  cadastrarUsuario,
  atualizarUsuario,
  getUsuarios,
  getUsuarioTimesService,
  listarPermissoes,
  vincularUsuarioTime,
};