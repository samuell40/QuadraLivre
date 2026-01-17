const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function adicionarJogador(dados) {
  const time = await prisma.time.findUnique({
    where: { id: dados.timeId },
    include: { modalidade: true }
  });

  if (!time) {
    throw new Error("Time não encontrado");
  }

  let funcaoIdFinal = dados.funcaoId;

  if (!funcaoIdFinal) {
    let funcaoNenhuma = await prisma.funcaoJogador.findFirst({
      where: {
        nome: "Nenhuma",
        modalidadeId: time.modalidadeId
      }
    });

    if (!funcaoNenhuma) {
      funcaoNenhuma = await prisma.funcaoJogador.create({
        data: {
          nome: "Nenhuma",
          modalidadeId: time.modalidadeId
        }
      });
    }

    funcaoIdFinal = funcaoNenhuma.id;
  }

  const dataCriacao = {
    nome: dados.nome,
    foto: dados.foto,
    timeId: dados.timeId,
    funcaoId: funcaoIdFinal,
  };

  if (dados.usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: dados.usuarioId }
    });

    if (!usuario) {
      throw new Error("Usuário informado não existe");
    }

    dataCriacao.usuarioId = dados.usuarioId;
  }

  const jogador = await prisma.jogador.create({
    data: dataCriacao,
    include: {
      time: true,
      funcao: true,
      usuario: true
    }
  });

  if (dados.usuarioId) {
    await prisma.usuarioTime.upsert({
      where: {
        usuarioId_timeId: {
          usuarioId: dados.usuarioId,
          timeId: dados.timeId
        }
      },
      update: {},
      create: {
        usuarioId: dados.usuarioId,
        timeId: dados.timeId
      }
    });
  }

  return jogador;
}

async function removerJogadorTime(jogadorId) {
  jogadorId = Number(jogadorId);
  await prisma.jogadorPartida.deleteMany({
    where: { jogadorId }
  });

  await prisma.jogador.deleteMany({
    where: { id: jogadorId }
  });

  return { message: 'Jogador removido (se existia)' };
}

async function listarJogadoresPorTime(timeId) {
  const time = await prisma.time.findUnique({
    where: { id: Number(timeId) },
    include: {
      jogadores: {
        include: {
          funcao: true,
          atuacoes: true
        }
      }
    }
  });

  if (!time) {
    throw new Error("Time não encontrado");
  }

  return time.jogadores;
}

async function adicionarFuncaoJogador(dados) {
  const { nome, modalidadeId } = dados;

  const existente = await prisma.funcaoJogador.findFirst({
    where: {
      nome: nome.trim(),
      modalidadeId: modalidadeId,
    },
  });

  if (existente) {
    throw new Error("Essa função já existe para essa modalidade");
  }

  const funcao = await prisma.funcaoJogador.create({
    data: {
      nome: nome.trim(),
      modalidadeId: modalidadeId,
    },
  });

  return funcao;
}

async function removerFuncaoJogador(dados) {
  const { id, modalidadeId } = dados;

  const existente = await prisma.funcaoJogador.findFirst({
    where: {
      id: Number(id),
      modalidadeId: Number(modalidadeId),
    },
  });

  if (!existente) {
    throw new Error("Função não encontrada para essa modalidade");
  }

  await prisma.jogador.updateMany({
    where: {
      funcaoId: Number(id),
    },
    data: {
      funcaoId: null,
    },
  });

  await prisma.funcaoJogador.delete({
    where: { id: Number(id) },
  });

  return { message: "Função removida com sucesso" };
}

async function listarFuncoesJogador(modalidadeId) {
  const funcoes = await prisma.funcaoJogador.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    include: {
      _count: {
        select: { jogadores: true }
      }
    }
  });
  return funcoes;
}

async function atualizarFuncaoJogador(jogadorId, funcaoId) {
  const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
  if (!jogador) throw new Error("Jogador não encontrado");

  if (funcaoId) {
    const funcao = await prisma.funcaoJogador.findUnique({ where: { id: funcaoId } });
    if (!funcao) throw new Error("Função de jogador não encontrada");
  }

  const jogadorAtualizado = await prisma.jogador.update({
    where: { id: jogadorId },
    data: { funcaoId },
    include: { funcao: true, time: true },
  });

  return jogadorAtualizado;
}

module.exports = {
  adicionarJogador,
  removerJogadorTime,
  listarJogadoresPorTime,
  adicionarFuncaoJogador,
  removerFuncaoJogador,
  listarFuncoesJogador,
  atualizarFuncaoJogador
};