const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function buscarModalidadeId(nome) {
  let modalidade = await prisma.modalidade.findUnique({
    where: { nome },
  });

  if (!modalidade) {
    modalidade = await prisma.modalidade.create({
      data: { nome },
    });
  }

  return modalidade.id;
}

async function cadastrarModalidade(nome) {
  const novaModalidade = await prisma.modalidade.create({
    data: { nome },
  });

  return novaModalidade;
}

async function removerModalidade(nome) {
  const modalidade = await prisma.modalidade.findUnique({
    where: { nome },
  });

  await prisma.placar.deleteMany({
    where: { modalidadeId: modalidade.id },
  });

  await prisma.modalidade.delete({
    where: { id: modalidade.id },
  });

  return modalidade;
}

async function listarModalidades() {
  return await prisma.modalidade.findMany({
    orderBy: { nome: 'asc' },
  });
}

async function criarTimeService(dados) {
  const modalidadeId = await buscarModalidadeId(dados.modalidade);

  const placar = await prisma.placar.create({
    data: {
      modalidadeId,
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
  const modalidadeId = await buscarModalidadeId(modalidade);

  await prisma.placar.delete({
    where: {
      modalidadeId_time: {
        modalidadeId,
        time: nome,
      },
    },
  });
}

async function listarTimesPorModalidade(modalidade) {
  const modalidadeId = await buscarModalidadeId(modalidade);

  const times = await prisma.placar.findMany({
    where: { modalidadeId },
    select: {
      time: true,
      foto: true,
      posicao: true,
      pontuacao: true,
      vitorias: true,
      derrotas: true,
      empates: true,
      golsMarcados: true,
      setsVencidos: true,
    },
    orderBy: { posicao: 'asc' },
  });

  return times.map(t => ({ ...t, modalidade }));
}


async function buscarTimeNome(modalidade, nome) {
  const modalidadeId = await buscarModalidadeId(modalidade);

  return await prisma.placar.findUnique({
    where: {
      modalidadeId_time: {
        modalidadeId,
        time: nome,
      },
    },
  });
}

async function atualizarTime(modalidade, nome, dados) {
  const modalidadeId = await buscarModalidadeId(modalidade);

  return await prisma.placar.update({
    where: {
      modalidadeId_time: {
        modalidadeId,
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
}

async function listarPlacar(modalidade) {
  const modalidadeId = await buscarModalidadeId(modalidade);

  return await prisma.placar.findMany({
    where: { modalidadeId },
    orderBy: { pontuacao: 'desc' },
  });
}

async function resetarPlacarPorModalidade(modalidade) {
  const modalidadeId = await buscarModalidadeId(modalidade);

  await prisma.placar.updateMany({
    where: { modalidadeId },
    data: {
      pontuacao: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      golsMarcados: 0,
      setsVencidos: 0,
    },
  });
}

module.exports = {  buscarModalidadeId, criarTimeService, deletarTime, listarTimesPorModalidade, buscarTimeNome, atualizarTime, listarPlacar, resetarPlacarPorModalidade, cadastrarModalidade, removerModalidade, listarModalidades };
