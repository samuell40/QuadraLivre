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
  return await prisma.modalidade.create({
    data: { nome },
  });
}

async function removerModalidade(nome) {
  const modalidade = await prisma.modalidade.findUnique({
    where: { nome },
  });

  if (!modalidade) throw new Error('Modalidade não encontrada.');

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

  return await prisma.placar.create({
    data: {
      modalidadeId,
      time: dados.time,
      foto: dados.foto || null,
      jogos: 0,
      posicao: 0,
      pontuacao: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      golsPro: 0,
      golsSofridos: 0,
      saldoDeGols: 0,
      setsVencidos: 0,
      vitoria2x0: 0,
      vitoria2x1: 0,
      derrota2x1: 0,
      derrota2x0: 0,
      derrotaWo: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0,
    },
  });
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

  // Atualiza posições após exclusão
  await atualizarPosicoes(modalidade);
}

function ordenarTimesFutebol(times) {
  return times.sort((a, b) => {
    if (b.pontuacao !== a.pontuacao) return b.pontuacao - a.pontuacao;
    if (a.jogos !== b.jogos) return a.jogos - b.jogos;
    if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;
    if (a.golsSofridos !== b.golsSofridos) return a.golsSofridos - b.golsSofridos;
    if (b.saldoDeGols !== a.saldoDeGols) return b.saldoDeGols - a.saldoDeGols;
    if ((a.cartoesAmarelos) !== (b.cartoesAmarelos)) return (a.cartoesAmarelos) - (b.cartoesAmarelos);
    if ((a.cartoesVermelhos) !== (b.cartoesVermelhos)) return (a.cartoesVermelhos) - (b.cartoesVermelhos);
    return 0;
  });
}

function ordenarTimesVolei(times) {
  return times.sort((a, b) => {
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
    if (b.pontuacao !== a.pontuacao) return b.pontuacao - a.pontuacao;

    const aSetsV = (a.vitoria2x0) * 2 + (a.vitoria2x1) * 2 + (a.derrota2x1);
    const aSetsP = (a.vitoria2x1) + (a.derrota2x0) * 2 + (a.derrota2x1) * 2 + (a.derrotaWo) * 2;
    const aAvg = aSetsV / (aSetsP || 1);

    const bSetsV = (b.vitoria2x0) * 2 + (b.vitoria2x1) * 2 + (b.derrota2x1);
    const bSetsP = (b.vitoria2x1) + (b.derrota2x0) * 2 + (b.derrota2x1) * 2 + (b.derrotaWo) * 2;
    const bAvg = bSetsV / (bSetsP || 1);

    if (bAvg !== aAvg) return bAvg - aAvg;
    if (aSetsP !== bSetsP) return aSetsP - bSetsP;

    return 0;
  });
}

async function atualizarPosicoes(modalidade) {
  const modalidadeId = await buscarModalidadeId(modalidade);
  const times = await prisma.placar.findMany({ where: { modalidadeId } });

  // Ordena conforme modalidade
  const timesOrdenados = modalidade === 'volei'
    ? ordenarTimesVolei(times)
    : ordenarTimesFutebol(times);

  // Atualiza posição no banco para cada time
  for (let i = 0; i < timesOrdenados.length; i++) {
    const time = timesOrdenados[i];
    await prisma.placar.update({
      where: {
        modalidadeId_time: {
          modalidadeId,
          time: time.time,
        },
      },
      data: {
        posicao: i + 1,
      },
    });
  }
  
  return timesOrdenados.map((t, idx) => ({ ...t, posicao: idx + 1 }));
}

async function listarTimesPorModalidade(modalidade) {
  // Atualiza as posições antes de listar
  return await atualizarPosicoes(modalidade);
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

  await prisma.placar.update({
    where: {
      modalidadeId_time: {
        modalidadeId,
        time: nome,
      },
    },
    data: {
      pontuacao: dados.pontuacao,
      jogos: dados.jogos,
      vitorias: dados.vitorias,
      derrotas: dados.derrotas,
      empates: dados.empates,
      golsPro: dados.golsPro,
      golsSofridos: dados.golsSofridos,
      saldoDeGols: dados.golsPro - dados.golsSofridos,
      setsVencidos: dados.setsVencidos,
      vitoria2x0: dados.vitoria2x0,
      vitoria2x1: dados.vitoria2x1,
      derrota2x1: dados.derrota2x1,
      derrota2x0: dados.derrota2x0,
      derrotaWo: dados.derrotaWo,
      cartoesAmarelos: dados.cartoesAmarelos,
      cartoesVermelhos: dados.cartoesVermelhos,
    },
  });

  // Atualiza posições após a alteração
  return await atualizarPosicoes(modalidade);
}

async function listarPlacar(modalidade) {
  return await listarTimesPorModalidade(modalidade);
}

async function resetarPlacarPorModalidade(modalidade) {
  const modalidadeId = await buscarModalidadeId(modalidade);

  await prisma.placar.updateMany({
    where: { modalidadeId },
    data: {
      pontuacao: 0,
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      golsPro: 0,
      golsSofridos: 0,
      saldoDeGols: 0,
      setsVencidos: 0,
      vitoria2x0: 0,
      vitoria2x1: 0,
      derrota2x1: 0,
      derrota2x0: 0,
      derrotaWo: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0,
      posicao: 0, 
    },
  });

  // Atualiza posições para zerar corretamente
  return await atualizarPosicoes(modalidade);
}

module.exports = {
  buscarModalidadeId,
  criarTimeService,
  deletarTime,
  listarTimesPorModalidade,
  buscarTimeNome,
  atualizarTime,
  listarPlacar,
  resetarPlacarPorModalidade,
  cadastrarModalidade,
  removerModalidade,
  listarModalidades,
};
