const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function adicionarJogador(dados) {
  const time = await prisma.time.findUnique({
    where: { id: dados.timeId },
    include: { modalidade: true }
  });

  if (!time) throw new Error("Time não encontrado");

  let funcaoIdFinal = dados.funcaoId;

  if (!funcaoIdFinal) {
    let funcaoNenhuma = await prisma.funcaoJogador.findFirst({
      where: { nome: "Nenhuma", modalidadeId: time.modalidadeId }
    });

    if (!funcaoNenhuma) {
      funcaoNenhuma = await prisma.funcaoJogador.create({
        data: { nome: "Nenhuma", modalidadeId: time.modalidadeId }
      });
    }

    funcaoIdFinal = funcaoNenhuma.id;
  }

  const dataCriacao = {
    nome: dados.nome,
    foto: dados.foto,
    funcaoId: funcaoIdFinal
  };

  if (dados.usuarioId) {
    const usuario = await prisma.usuario.findUnique({ where: { id: dados.usuarioId } });
    if (!usuario) throw new Error("Usuário informado não existe");
    dataCriacao.usuarioId = dados.usuarioId;
  }

  const jogador = await prisma.jogador.create({
    data: dataCriacao,
    include: { funcao: true, usuario: true, times: { include: { time: true, modalidade: true } } }
  });

  // Criar vínculo com o time via JogadorTime
  await prisma.jogadorTime.create({
    data: {
      jogadorId: jogador.id,
      timeId: dados.timeId,
      modalidadeId: time.modalidadeId
    }
  });

  // Criar vínculo com usuarioTime se houver usuário
  if (dados.usuarioId) {
    await prisma.usuarioTime.upsert({
      where: {
        usuarioId_timeId: { usuarioId: dados.usuarioId, timeId: dados.timeId }
      },
      update: {},
      create: { usuarioId: dados.usuarioId, timeId: dados.timeId }
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
          jogador: { include: { funcao: true, usuario: true, atuacoes: true } }
        }
      }
    }
  });

  if (!time) throw new Error("Time não encontrado");

  return time.jogadores.map(jt => jt.jogador);
}

async function listarTodosJogadores(modalidadeId) {
  const jogadores = await prisma.jogador.findMany({
    include: {
      funcao: true,
      usuario: true,
      atuacoes: true,
      times: {
        where: {
          time: {
            modalidadeId: Number(modalidadeId),
          },
        },
        include: {
          time: true,
        },
      },
    },
  });

  return jogadores.map(j => ({
    id: j.id,
    nome: j.nome,
    foto: j.foto,
    funcao: j.funcao,
    usuario: j.usuario,
    atuacoes: j.atuacoes,
    times: j.times.map(jt => ({
      id: jt.time.id,
      nome: jt.time.nome,
      modalidadeId: jt.time.modalidadeId,
    })),
  }));
}

async function atualizarFuncaoJogador(jogadorId, funcaoId) {
  const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
  if (!jogador) throw new Error("Jogador não encontrado");

  if (funcaoId) {
    const funcao = await prisma.funcaoJogador.findUnique({ where: { id: funcaoId } });
    if (!funcao) throw new Error("Função de jogador não encontrada");
  }

  return prisma.jogador.update({
    where: { id: jogadorId },
    data: { funcaoId },
    include: { funcao: true, usuario: true, times: { include: { time: true, modalidade: true } } }
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

  // Cria a nova função
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

async function moverJogadorDeTime(jogadorId, novoTimeId) {
  const jogador = await prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: { usuario: true, times: { include: { time: true, modalidade: true } } }
  });

  if (!jogador) throw new Error("Jogador não encontrado");

  const novoTime = await prisma.time.findUnique({
    where: { id: novoTimeId },
    include: { modalidade: true }
  });
  if (!novoTime) throw new Error("Time de destino não encontrado");

  const modalidadeId = novoTime.modalidadeId;

  // Remover vínculo antigo do jogador para esta modalidade
  await prisma.jogadorTime.deleteMany({
    where: {
      jogadorId,
      modalidadeId
    }
  });

  // Criar novo vínculo do jogador com o novo time
  const jogadorTimeAtualizado = await prisma.jogadorTime.create({
    data: {
      jogadorId,
      timeId: novoTimeId,
      modalidadeId
    },
    include: { time: true, modalidade: true }
  });

  if (jogador.usuarioId) {
    const usuarioId = jogador.usuarioId;

    await prisma.usuarioTime.deleteMany({
      where: { usuarioId, timeId: jogador.times.find(t => t.modalidadeId === modalidadeId)?.timeId }
    });

    await prisma.usuarioTime.upsert({
      where: { usuarioId_timeId: { usuarioId, timeId: novoTimeId } },
      update: {},
      create: { usuarioId, timeId: novoTimeId }
    });
  }

  const jogadorAtualizado = await prisma.jogador.findUnique({
    where: { id: jogadorId },
    include: { usuario: true, times: { include: { time: true, modalidade: true } } }
  });

  return jogadorAtualizado;
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