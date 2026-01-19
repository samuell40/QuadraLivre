const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function adicionarJogador(dados) {
  const time = await prisma.time.findUnique({
    where: { id: dados.timeId },
    include: { modalidade: true },
  });
  if (!time) throw new Error("Time não encontrado");
  let funcaoIdFinal = dados.funcaoId;

  if (!funcaoIdFinal) {
    let funcaoNenhuma = await prisma.funcaoJogador.findFirst({
      where: {
        nome: "Nenhuma",
        modalidadeId: time.modalidadeId,
      },
    });

    if (!funcaoNenhuma) {
      funcaoNenhuma = await prisma.funcaoJogador.create({
        data: {
          nome: "Nenhuma",
          modalidadeId: time.modalidadeId,
        },
      });
    }

    funcaoIdFinal = funcaoNenhuma.id;
  }

  const jogador = await prisma.jogador.create({
    data: {
      nome: dados.nome,
      foto: dados.foto,
      funcaoId: funcaoIdFinal,
    },
    include: {
      funcao: true,
      times: {
        include: {
          time: true,
          modalidade: true,
        },
      },
    },
  });

  await prisma.jogadorTime.create({
    data: {
      jogadorId: jogador.id,
      timeId: dados.timeId,
      modalidadeId: time.modalidadeId,
    },
  });

  if (dados.usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: dados.usuarioId },
    });
    if (!usuario) throw new Error("Usuário informado não existe");

    await prisma.usuarioTime.upsert({
      where: {
        usuarioId_timeId: {
          usuarioId: dados.usuarioId,
          timeId: dados.timeId,
        },
      },
      update: {},
      create: {
        usuarioId: dados.usuarioId,
        timeId: dados.timeId,
      },
    });
  }
  return jogador;
}

async function removerJogadorTime(jogadorId, timeId) {
  jogadorId = Number(jogadorId);
  timeId = Number(timeId);

  const vinculo = await prisma.jogadorTime.findFirst({
    where: {
      jogadorId,
      timeId,
    },
  });

  if (!vinculo) {
    throw new Error('Jogador não está vinculado a este time');
  }
  await prisma.jogadorTime.delete({
    where: {
      id: vinculo.id,
    },
  });

  return { message: 'Jogador removido do time com sucesso' };
}

async function listarJogadoresPorTime(timeId) {
  const time = await prisma.time.findUnique({
    where: { id: Number(timeId) },
    include: {
      jogadores: {
        include: {
          jogador: {
            include: {
              funcao: true,
              atuacoes: true,
            },
          },
        },
      },
    },
  });

  if (!time) throw new Error("Time não encontrado");

  return time.jogadores.map(jt => ({
    id: jt.jogador.id,
    nome: jt.jogador.nome,
    foto: jt.jogador.foto,
    funcao: jt.jogador.funcao,
    atuacoes: jt.jogador.atuacoes,
  }));
}

async function listarTodosJogadores(modalidadeId) {
  const jogadores = await prisma.jogador.findMany({
    where: {
      times: {
        some: {
          modalidadeId: Number(modalidadeId),
        },
      },
    },
    include: {
      funcao: true,
      atuacoes: true,
      times: {
        where: {
          modalidadeId: Number(modalidadeId),
        },
        include: {
          time: true,
          modalidade: true,
        },
      },
    },
  });

  return jogadores.map(j => ({
    id: j.id,
    nome: j.nome,
    foto: j.foto,
    funcao: j.funcao,
    atuacoes: j.atuacoes,
    times: j.times.map(jt => ({
      id: jt.time.id,
      nome: jt.time.nome,
      modalidadeId: jt.modalidadeId,
    })),
  }));
}

async function atualizarFuncaoJogador(jogadorId, funcaoId) {
  const jogador = await prisma.jogador.findUnique({
    where: { id: jogadorId },
  });

  if (!jogador) {
    throw new Error("Jogador não encontrado");
  }

  if (funcaoId !== null) {
    const funcao = await prisma.funcaoJogador.findUnique({
      where: { id: funcaoId },
    });

    if (!funcao) {
      throw new Error("Função de jogador não encontrada");
    }
  }

  return prisma.jogador.update({
    where: { id: jogadorId },
    data: { funcaoId },
    include: {
      funcao: true,
      times: {
        include: {
          time: true,
          modalidade: true,
        },
      },
    },
  });
}

async function adicionarFuncaoJogador(dados) {
  const { nome, modalidadeId } = dados;

  const existente = await prisma.funcaoJogador.findFirst({
    where: {
      nome: nome.trim(),
      modalidadeId: Number(modalidadeId),
    },
  });

  if (existente) {
    throw new Error("Essa função já existe para essa modalidade");
  }

  const funcao = await prisma.funcaoJogador.create({
    data: {
      nome: nome.trim(),
      modalidadeId: Number(modalidadeId),
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

async function moverJogadorDeTime(jogadorId, novoTimeId) {
  const jogador = await prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: {
      times: { include: { time: { include: { modalidade: true } } } }
    }
  });
  if (!jogador) throw new Error("Jogador não encontrado");

  const novoTime = await prisma.time.findUnique({
    where: { id: novoTimeId },
    include: { modalidade: true }
  });
  if (!novoTime) throw new Error("Time de destino não encontrado");

  const modalidadeId = novoTime.modalidadeId;

  const vinculoAntigo = jogador.times.find(
    jt => jt.time.modalidadeId === modalidadeId
  );

  if (vinculoAntigo) {
    await prisma.jogadorTime.delete({
      where: { id: vinculoAntigo.id }
    });
  }

  await prisma.jogadorTime.create({
    data: {
      jogadorId,
      timeId: novoTimeId,
      modalidadeId
    }
  });

  return prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: {
      times: { include: { time: true, modalidade: true } }
    }
  });
}

module.exports = {
  adicionarJogador,
  removerJogadorTime,
  listarJogadoresPorTime,
  listarTodosJogadores,
  adicionarFuncaoJogador,
  removerFuncaoJogador,
  listarFuncoesJogador,
  atualizarFuncaoJogador,
  moverJogadorDeTime
};