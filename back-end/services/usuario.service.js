const { enviarEmailAlteracaoPermissao, enviarEmailVinculoTime } = require('./email.service');
const { PrismaClient } = require('@prisma/client');
const { validarNumeroUnicoNoTime } = require('./jogador.service');

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
      createdAt: new Date(),
    },
    include: {
      permissao: true,
    },
  });
}

async function atualizarUsuario(user) {
  const usuarioAtualizado = await prisma.$transaction(async (tx) => {
    const agora = new Date();

    const usuarioDb = await tx.usuario.findUnique({
      where: { email: user.email },
      include: {
        quadra: true,
        permissao: true,
      },
    });

    if (!usuarioDb || usuarioDb.deletedAt) {
      throw new Error('Usuario nao encontrado');
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

    if (user.permissaoId !== 3) {
      await tx.usuarioTime.updateMany({
        where: {
          usuarioId: usuarioDb.id,
          ativo: true,
          deletedAt: null,
        },
        data: {
          ativo: false,
          deletedAt: agora,
        },
      });
    }

    if (user.permissaoId !== 5) {
      await tx.treinadorTime.deleteMany({
        where: {
          usuarioId: usuarioDb.id,
        },
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

    return usuarioAtualizado;
  });

  try {
    await enviarEmailAlteracaoPermissao(usuarioAtualizado);
  } catch (erroEmail) {
    console.error('Erro ao enviar email de alteracao de permissao:', erroEmail);
  }

  return usuarioAtualizado;
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
        where: {
          ativo: true,
          deletedAt: null,
        },
        include: {
          time: true,
        },
      },
      treinadorTimes: {
        where: {
          ativo: true,
          deletedAt: null,
        },
        include: {
          time: true,
        },
      },
    },
  });

  return usuarios.map((user) => {
    let jogador = null;
    let timesJogador = [];
    const agendamentosAtivos = (user.agendamentos || []).filter((ag) => !ag.deletedAt);
    const agora = new Date();

    const obterDataAgendamento = (agendamento) => {
      if (agendamento?.datahora) {
        return new Date(agendamento.datahora);
      }

      if (
        Number.isInteger(agendamento?.ano) &&
        Number.isInteger(agendamento?.mes) &&
        Number.isInteger(agendamento?.dia)
      ) {
        return new Date(
          agendamento.ano,
          Math.max(0, agendamento.mes - 1),
          agendamento.dia,
          agendamento.hora || 0,
          0,
          0
        );
      }

      return null;
    };

    const datasAgendamentos = agendamentosAtivos
      .map(obterDataAgendamento)
      .filter((data) => data instanceof Date && !Number.isNaN(data.getTime()));

    const agendamentosNoMes = datasAgendamentos.filter(
      (data) =>
        data.getMonth() === agora.getMonth() &&
        data.getFullYear() === agora.getFullYear()
    ).length;

    const ultimaAtividade = datasAgendamentos.length
      ? new Date(Math.max(...datasAgendamentos.map((data) => data.getTime())))
      : null;

    const dataCadastro = user.createdAt || null;

    if (user.jogador) {
      jogador = {
        id: user.jogador.id,
        nome: user.jogador.nome,
        foto: user.jogador.foto,
      };

      timesJogador = user.jogador.times
        .filter((jt) => jt.ativo)
        .map((jt) => ({
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
      dataCadastro,
      permissaoId: user.permissaoId,
      permissao: user.permissao,
      quadra: user.quadra,
      jogador,
      timesJogador,
      times: user.times
        .filter((ut) => ut.ativo && !ut.deletedAt && ut.time?.ativo && !ut.time?.deletedAt)
        .map((ut) => ({
          id: ut.time.id,
          nome: ut.time.nome,
        })),
      timesComoTreinador: user.treinadorTimes
        .filter((tt) => tt.ativo && !tt.deletedAt && tt.time?.ativo && !tt.time?.deletedAt)
        .map((tt) => ({
          id: tt.time.id,
          nome: tt.time.nome,
        })),
      totalAgendamentos: agendamentosAtivos.length,
      agendamentosNoMes,
      ultimaAtividade,
    };
  });
}

async function listarPermissoes() {
  return prisma.permissao.findMany({
    orderBy: { id: 'asc' },
  });
}

async function vincularUsuarioTime(usuarioId, timeId, jogadorId) {
  const resultado = await prisma.$transaction(async (tx) => {
    const usuarioIdNum = Number(usuarioId);
    const timeIdNum = Number(timeId);
    const jogadorIdNum = jogadorId ? Number(jogadorId) : null;

    const usuario = await tx.usuario.findUnique({
      where: { id: usuarioIdNum },
      include: { permissao: true },
    });
    if (!usuario || usuario.deletedAt) throw new Error('Usuario nao encontrado');

    const time = await tx.time.findUnique({
      where: { id: timeIdNum },
      include: { modalidade: true },
    });
    if (!time || time.deletedAt) throw new Error('Time nao encontrado');

    await tx.usuarioTime.upsert({
      where: {
        usuarioId_timeId: { usuarioId: usuarioIdNum, timeId: timeIdNum },
      },
      update: { ativo: true, deletedAt: null },
      create: { usuarioId: usuarioIdNum, timeId: timeIdNum },
    });

    if (!jogadorIdNum) {
      return {
        vinculo: { usuarioId: usuarioIdNum, timeId: timeIdNum },
        jogador: null,
        notificacaoEmail: null,
      };
    }

    const jogador = await tx.jogador.findUnique({
      where: { id: jogadorIdNum },
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
    if (!jogador || jogador.deletedAt) throw new Error('Jogador nao encontrado');

    if (Number(usuario.jogadorId) !== jogadorIdNum) {
      await tx.usuario.update({
        where: { id: usuarioIdNum },
        data: { jogadorId: jogadorIdNum },
      });
    }

    await validarNumeroUnicoNoTime({
      timeId: timeIdNum,
      numero: jogador.numero,
      jogadorIgnorarId: jogadorIdNum,
      tx,
    });

    await tx.jogadorTime.upsert({
      where: {
        jogadorId_modalidadeId: { jogadorId: jogadorIdNum, modalidadeId: time.modalidadeId },
      },
      update: {
        timeId: timeIdNum,
        ativo: true,
      },
      create: {
        jogadorId: jogadorIdNum,
        timeId: timeIdNum,
        modalidadeId: time.modalidadeId,
      },
    });

    const jogadorAtualizado = await tx.jogador.findUnique({
      where: { id: jogadorIdNum },
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

    return {
      vinculo: { usuarioId: usuarioIdNum, timeId: timeIdNum },
      jogador: jogadorAtualizado,
      notificacaoEmail: {
        usuario,
        time,
        jogador: jogadorAtualizado,
      },
    };
  });

  if (resultado.notificacaoEmail) {
    try {
      await enviarEmailVinculoTime(
        resultado.notificacaoEmail.usuario,
        resultado.notificacaoEmail.time,
        resultado.notificacaoEmail.jogador
      );
    } catch (erroEmail) {
      console.error('Erro ao enviar email de vinculo com time:', erroEmail);
    }
  }

  return {
    vinculo: resultado.vinculo,
    jogador: resultado.jogador,
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
  cadastrarUsuario,
  atualizarUsuario,
  getUsuarios,
  getUsuarioTimesService,
  listarPermissoes,
  vincularUsuarioTime,
};
