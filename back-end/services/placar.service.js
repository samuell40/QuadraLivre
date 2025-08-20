const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ------------------ MODALIDADE ------------------
async function cadastrarModalidade(nome) {
  return await prisma.modalidade.create({
    data: { nome }
  });
}

async function removerModalidade(id) {
  return await prisma.modalidade.delete({
    where: { id: Number(id) }
  });
}

async function listarModalidades() {
  return await prisma.modalidade.findMany({
    include: { times: true, quadras: true },
  });
}

// ------------------ TIME ------------------
async function criarTime({ nome, foto, modalidadeId }) {
  const time = await prisma.time.create({
    data: {
      nome,
      foto,
      modalidadeId: Number(modalidadeId),
    },
  });

  // Cria placar automaticamente se não existir
  await criarPlacar({ timeId: time.id });

  return time;
}

async function removerTime(id) {
  // Remove o placar antes de remover o time
  await prisma.placar.deleteMany({ where: { timeId: Number(id) } });

  return await prisma.time.delete({ where: { id: Number(id) } });
}

async function listarTimesPorModalidade(modalidadeId) {
  if (!modalidadeId) throw new Error('modalidadeId é obrigatório');

  return await prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    include: { modalidade: true, placar: true },
    orderBy: { nome: 'asc' },
  });
}

// ------------------ PLACAR ------------------
async function criarPlacar(dados) {
  const { timeId } = dados;

  // Verifica se já existe placar para o time
  const existente = await prisma.placar.findUnique({ where: { timeId: Number(timeId) } });
  if (existente) return existente;

  return await prisma.placar.create({
    data: {
      timeId: Number(timeId),
      jogos: dados.jogos || 0,
      posicao: dados.posicao || 0,
      pontuacao: dados.pontuacao || 0,
      vitorias: dados.vitorias || 0,
      empates: dados.empates || 0,
      derrotas: dados.derrotas || 0,
      golsPro: dados.golsPro || 0,
      golsSofridos: dados.golsSofridos || 0,
      saldoDeGols: dados.saldoDeGols || 0,
      setsVencidos: dados.setsVencidos || 0,
      vitoria2x0: dados.vitoria2x0 || 0,
      vitoria2x1: dados.vitoria2x1 || 0,
      derrota2x1: dados.derrota2x1 || 0,
      derrota2x0: dados.derrota2x0 || 0,
      derrotaWo: dados.derrotaWo || 0,
      cartoesAmarelos: dados.cartoesAmarelos || 0,
      cartoesVermelhos: dados.cartoesVermelhos || 0,
      visivel: dados.visivel ?? true,
    },
  });
}

async function atualizarPlacar(id, dados) {
  return await prisma.placar.update({
    where: { id: Number(id) },
    data: {
      jogos: dados.jogos,
      posicao: dados.posicao,
      pontuacao: dados.pontuacao,
      vitorias: dados.vitorias,
      empates: dados.empates,
      derrotas: dados.derrotas,
      golsPro: dados.golsPro,
      golsSofridos: dados.golsSofridos,
      saldoDeGols: dados.saldoDeGols,
      setsVencidos: dados.setsVencidos,
      vitoria2x0: dados.vitoria2x0,
      vitoria2x1: dados.vitoria2x1,
      derrota2x1: dados.derrota2x1,
      derrota2x0: dados.derrota2x0,
      derrotaWo: dados.derrotaWo,
      cartoesAmarelos: dados.cartoesAmarelos,
      cartoesVermelhos: dados.cartoesVermelhos,
      visivel: dados.visivel,
    },
  });
}

async function listarPlacarPorModalidade(modalidadeId) {
  return await prisma.placar.findMany({
    where: { time: { modalidadeId: Number(modalidadeId) } },
    include: { time: true },
    orderBy: { pontuacao: 'desc' },
  });
}

async function resetarPlacarPorModalidade(modalidadeId) {
  return await prisma.placar.updateMany({
    where: { time: { modalidadeId: Number(modalidadeId) } },
    data: {
      jogos: 0,
      posicao: 0,
      pontuacao: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
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
      visivel: true,
    },
  });
}

// ------------------ ORDENAÇÃO ------------------
function ordenarTimesFutebol(times) {
  return times.sort((a, b) => {
    if (b.placar.pontuacao !== a.placar.pontuacao) return b.placar.pontuacao - a.placar.pontuacao;
    if (a.placar.jogos !== b.placar.jogos) return a.placar.jogos - b.placar.jogos;
    if (b.placar.golsPro !== a.placar.golsPro) return b.placar.golsPro - a.placar.golsPro;
    if (a.placar.golsSofridos !== b.placar.golsSofridos) return a.placar.golsSofridos - b.placar.golsSofridos;
    if (b.placar.saldoDeGols !== a.placar.saldoDeGols) return b.placar.saldoDeGols - a.placar.saldoDeGols;
    if (a.placar.cartoesAmarelos !== b.placar.cartoesAmarelos) return a.placar.cartoesAmarelos - b.placar.cartoesAmarelos;
    if (a.placar.cartoesVermelhos !== b.placar.cartoesVermelhos) return a.placar.cartoesVermelhos - b.placar.cartoesVermelhos;
    return 0;
  });
}

function ordenarTimesVolei(times) {
  return times.sort((a, b) => {
    if (b.placar.vitorias !== a.placar.vitorias) return b.placar.vitorias - a.placar.vitorias;
    if (b.placar.pontuacao !== a.placar.pontuacao) return b.placar.pontuacao - a.placar.pontuacao;

    const aSetsV = (a.placar.vitoria2x0 * 2) + (a.placar.vitoria2x1 * 2) + a.placar.derrota2x1;
    const aSetsP = a.placar.vitoria2x1 + (a.placar.derrota2x0 * 2) + (a.placar.derrota2x1 * 2) + (a.placar.derrotaWo * 2);
    const aAvg = aSetsV / (aSetsP || 1);

    const bSetsV = (b.placar.vitoria2x0 * 2) + (b.placar.vitoria2x1 * 2) + b.placar.derrota2x1;
    const bSetsP = b.placar.vitoria2x1 + (b.placar.derrota2x0 * 2) + (b.placar.derrota2x1 * 2) + (b.placar.derrotaWo * 2);
    const bAvg = bSetsV / (bSetsP || 1);

    if (bAvg !== aAvg) return bAvg - aAvg;
    if (aSetsP !== bSetsP) return aSetsP - bSetsP;

    return 0;
  });
}

// Ocultar todos os placares
async function ocultarPlacarGeral() {
  try {
    await prisma.placar.updateMany({
      data: { visivel: false }
    });
    return { message: 'Todos os placares foram ocultados na Home.' };
  } catch (error) {
    throw new Error('Erro ao ocultar placares: ' + error.message);
  }
}

// Ocultar placar por modalidade
async function ocultarPlacarPorModalidade(modalidadeId) {
  try {
    const times = await prisma.time.findMany({
      where: { modalidadeId: Number(modalidadeId) },
      select: { id: true }
    });

    if (times.length === 0) return { message: 'Nenhum placar encontrado para essa modalidade.' };

    const timeIds = times.map(t => t.id);

    await prisma.placar.updateMany({
      where: { timeId: { in: timeIds } },
      data: { visivel: false }
    });

    return { message: `Placar(s) da modalidade ${modalidadeId} ocultado(s) na Home.` };
  } catch (error) {
    throw new Error('Erro ao ocultar placares por modalidade: ' + error.message);
  }
}

// Deixar todos os placares visíveis
async function mostrarPlacarGeral() {
  try {
    await prisma.placar.updateMany({
      data: { visivel: true }
    });
    return { message: 'Todos os placares foram exibidos na Home.' };
  } catch (error) {
    throw new Error('Erro ao exibir placares: ' + error.message);
  }
}

// Deixar placar por modalidade visível
async function mostrarPlacarPorModalidade(modalidadeId) {
  try {
    const times = await prisma.time.findMany({
      where: { modalidadeId: Number(modalidadeId) },
      select: { id: true }
    });

    if (times.length === 0) return { message: 'Nenhum placar encontrado para essa modalidade.' };

    const timeIds = times.map(t => t.id);

    await prisma.placar.updateMany({
      where: { timeId: { in: timeIds } },
      data: { visivel: true }
    });

    return { message: `Placar(s) da modalidade ${modalidadeId} exibido(s) na Home.` };
  } catch (error) {
    throw new Error('Erro ao exibir placares por modalidade: ' + error.message);
  }
}

async function listarVisibilidade() {
  try {
    // Buscar todas as modalidades
    const modalidades = await prisma.modalidade.findMany({
      select: { id: true, nome: true }
    });

    // Para cada modalidade, verifica se existe algum placar visível
    const resultado = await Promise.all(
      modalidades.map(async (m) => {
        const placar = await prisma.placar.findFirst({
          where: { time: { modalidadeId: m.id } },
          select: { visivel: true }
        });

        return {
          modalidadeId: m.id,
          nome: m.nome,
          visivel: placar ? placar.visivel : true 
        };
      })
    );

    return resultado;
  } catch (error) {
    throw new Error("Erro ao buscar visibilidade: " + error.message);
  }
}

module.exports = {
  cadastrarModalidade,
  removerModalidade,
  listarModalidades,
  criarTime,
  removerTime,
  listarTimesPorModalidade,
  criarPlacar,
  atualizarPlacar,
  listarPlacarPorModalidade,
  resetarPlacarPorModalidade,
  ordenarTimesFutebol,
  ordenarTimesVolei,
  ocultarPlacarGeral, ocultarPlacarPorModalidade, mostrarPlacarGeral, mostrarPlacarPorModalidade, listarVisibilidade
};
