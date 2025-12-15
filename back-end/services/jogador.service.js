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

 await prisma.jogador.findFirst({
    where: {
      nome: dados.nome,
      time: {
        modalidadeId: time.modalidadeId
      }
    }
  });

  const jogador = await prisma.jogador.create({
    data: {
      nome: dados.nome,
      foto: dados.foto,
      timeId: dados.timeId,
      funcaoId: dados.funcaoId,
    },
    include: {
      time: true,
      funcao: true
    },
  });

  return jogador;
}

async function removerJogadorTime(jogadorId) {
  const jogador = await prisma.jogador.findUnique({
    where: { id: jogadorId },
  });
  await prisma.jogador.delete({
    where: { id: jogadorId },
  });
  return jogador;
}

async function listarJogadoresPorTime(timeId) {
  const time = await prisma.time.findUnique({
    where: { id: timeId },
    include: {
      jogadores: {
        include: {
          funcao: true, 
        },
      },
    },
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

async function atualizarAtuacaoJogador({ jogadorId, partidaId, gols = 0, cartoesAmarelos = 0, cartoesVermelhos = 0 }) {
  let atuacao = await prisma.jogadorPartida.findFirst({
    where: { jogadorId: Number(jogadorId), partidaId: Number(partidaId) },
  });

  if (!atuacao) {
    atuacao = await prisma.jogadorPartida.create({
      data: {
        jogadorId: Number(jogadorId),
        partidaId: Number(partidaId),
        gols,
        cartoesAmarelos,
        cartoesVermelhos
      }
    });
  } else {
    atuacao = await prisma.jogadorPartida.update({
      where: { id: atuacao.id },
      data: {
        gols: atuacao.gols + Number(gols),
        cartoesAmarelos: atuacao.cartoesAmarelos + Number(cartoesAmarelos),
        cartoesVermelhos: atuacao.cartoesVermelhos + Number(cartoesVermelhos)
      }
    });
  }

  return atuacao;
}

async function listarJogadoresPartida(timeId, partidaId) {
  const jogadores = await prisma.jogador.findMany({
    where: { timeId: Number(timeId) },
    include: {
      atuacoes: {
        where: { partidaId: Number(partidaId) },
      },
    },
  });

  return jogadores.map(j => ({
    id: j.id,
    nome: j.nome,
    foto: j.foto,
    gols: j.atuacoes[0]?.gols || 0,
    cartoesAmarelos: j.atuacoes[0]?.cartoesAmarelos || 0,
    cartoesVermelhos: j.atuacoes[0]?.cartoesVermelhos || 0
  }));
}

module.exports = {
  adicionarJogador,
  removerJogadorTime,
  listarJogadoresPorTime,
  adicionarFuncaoJogador,
  removerFuncaoJogador,
  listarFuncoesJogador,
  atualizarFuncaoJogador,
  atualizarAtuacaoJogador,
  listarJogadoresPartida
};