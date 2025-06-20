const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarTimeService(dados) {
  const count = await prisma.placar.count({
    where: { modalidade: dados.modalidade },
  });

  const placar = await prisma.placar.create({
    data: {
      modalidade: dados.modalidade,
      time: dados.time,
      foto: dados.foto,
      posicao: 0,
      pontuacao: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      golsMarcados: 0,
      setsVencidos: 0,
    },
  });
  return placar;
}

async function deletarTime(nome, modalidade) {
  const time = await prisma.placar.findUnique({
    where: {
      modalidade_time: {
        modalidade: modalidade,
        time: nome
      }
    }
  });

  await prisma.placar.delete({
    where: {
      modalidade_time: {
        modalidade: modalidade,
        time: nome
      }
    }
  });
}

async function getNomesTimes(modalidade) {
  const placares = await prisma.placar.findMany({
    where: { modalidade: modalidade },
    select: { time: true },
  });

  return placares.map((p) => p.time);
}

async function buscarTimeNome(modalidade, nome) {
  const time = await prisma.placar.findUnique({
    where: {
      modalidade_time: {
        modalidade: modalidade,
        time: nome,
      },
    },
  });
  return time;
}

async function atualizarTime(modalidade, nome, dados) {
  const atualizar = await prisma.placar.update({
    where: {
      modalidade_time: {
        modalidade: modalidade,
        time: nome,
      },
    },
    data: {
      golsMarcados: dados.gols,
      pontuacao: dados.pts,
      empates: dados.empates,
      vitorias: dados.vitorias,
      derrotas: dados.derrotas,
      setsVencidos: dados.setsVencidos,
    },
  });
  return atualizar;
}

async function listarPlacar(modalidade) {
  const listar = await prisma.placar.findMany({
    where: { modalidade: modalidade },
    orderBy: { pontuacao: 'desc' },
  });
  return listar;
}

async function resetarPlacarPorModalidade(modalidade) {
  await prisma.placar.updateMany({
    where: { modalidade: modalidade },
    data: {
      pontuacao: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      golsMarcados: 0,
      setsVencidos: 0
    }
  });
}

async function adicionarModalidade(dados) {
  const { modalidade, time, foto, posicao, pontuacao, vitorias, derrotas, empates, golsMarcados, setsVencidos } = dados;

  const novoPlacar = await prisma.placar.create({
    data: {
      modalidade,
      time,
      foto,
      posicao,
      pontuacao,
      vitorias,
      derrotas,
      empates,
      golsMarcados,
      setsVencidos,
    },
  });

  return novoPlacar;
}

module.exports = {
  criarTimeService, deletarTime, getNomesTimes, buscarTimeNome, atualizarTime, listarPlacar, resetarPlacarPorModalidade, adicionarModalidade};