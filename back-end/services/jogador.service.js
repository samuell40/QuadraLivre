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

  const jogadorExistente = await prisma.jogador.findFirst({
    where: {
      nome: dados.nome,
      time: {
        modalidadeId: time.modalidadeId
      }
    }
  });

  if (jogadorExistente) {
    throw new Error(`O jogador "${dados.nome}" já faz parte de outro time na modalidade "${time.modalidade.nome}"`);
  }

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

  if (!jogador) {
    throw new Error("Jogador não encontrado");
  }

  await prisma.jogador.delete({
    where: { id: jogadorId },
  });

  return { message: "Jogador removido com sucesso" };
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
  const existente = await prisma.funcaoJogador.findFirst({
    where: { nome: dados.nome.trim() },
  });
  if (existente) {
    throw new Error("Essa função já existe");
  }

  const funcao = await prisma.funcaoJogador.create({
    data: {
      nome: dados.nome.trim(),
    },
  });

  return funcao;
}

async function listarFuncoesJogador() {
  const funcoes = await prisma.funcaoJogador.findMany();
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

module.exports = {
  adicionarJogador,
  removerJogadorTime,
  listarJogadoresPorTime,
  adicionarFuncaoJogador,
  listarFuncoesJogador,
  atualizarFuncaoJogador,
  atualizarAtuacaoJogador
};