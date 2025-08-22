const { broadcast } = require("../websocket");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cadastrarModalidade(nome) {
  if (!nome) return { error: 'Nome da modalidade é obrigatório' };

  return prisma.modalidade.create({ data: { nome } });
}

async function removerModalidade(id) {
  if (!id) return { error: 'ID da modalidade é obrigatório' };

  const existente = await prisma.modalidade.findUnique({ where: { id: Number(id) } });
  if (!existente) return { error: 'Modalidade não encontrada' };

  return prisma.modalidade.delete({ where: { id: Number(id) } });
}

async function listarModalidades() {
  return prisma.modalidade.findMany({ include: { times: true, quadras: true } });
}

async function criarTime({ nome, foto, modalidadeId }) {
  if (!nome || !modalidadeId) return { error: 'Nome e modalidadeId são obrigatórios' };

  const time = await prisma.time.create({
    data: { nome, foto, modalidadeId: Number(modalidadeId) },
  });

  await criarPlacar({ timeId: time.id });
  return time;
}

async function removerTime(id) {
  if (!id) return { error: 'ID do time é obrigatório' };

  await prisma.placar.deleteMany({ where: { timeId: Number(id) } });
  return prisma.time.delete({ where: { id: Number(id) } });
}

async function listarTimesPorModalidade(modalidadeId) {
  if (!modalidadeId) return { error: 'modalidadeId é obrigatório' };

  return prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    include: { modalidade: true, placar: true },
    orderBy: { nome: 'asc' },
  });
}

async function listarTodosTimes() {
  return prisma.time.findMany({
    include: { modalidade: true, placar: true },
    orderBy: { nome: 'asc' },
  });
}

async function criarPlacar({ timeId }) {
  if (!timeId) return { error: 'timeId é obrigatório' };

  const existente = await prisma.placar.findUnique({ where: { timeId: Number(timeId) } });
  if (existente) return existente;

  return prisma.placar.create({
    data: {
      timeId: Number(timeId), jogos: 0, posicao: 0, pontuacao: 0, vitorias: 0, empates: 0, derrotas: 0,
      golsPro: 0, golsSofridos: 0, saldoDeGols: 0, setsVencidos: 0, vitoria2x0: 0, vitoria2x1: 0,
      derrota2x1: 0, derrota2x0: 0, derrotaWo: 0, cartoesAmarelos: 0, cartoesVermelhos: 0, visivel: true
    }
  });
}

async function atualizarPlacar(id, dados) {
  if (!id || !dados) return { error: 'ID e dados são obrigatórios' };

  const placarAtualizado = await prisma.placar.update({
    where: { id: Number(id) },
    data: dados,
    include: { time: true } 
  });

  return placarAtualizado;
}

async function listarPlacarPorModalidade(modalidadeId) {
  if (!modalidadeId) return { error: 'modalidadeId é obrigatório' };

  return prisma.placar.findMany({
    where: { time: { modalidadeId: Number(modalidadeId) } },
    include: { time: true },
    orderBy: { pontuacao: 'desc' },
  });
}

async function resetarPlacarPorModalidade(modalidadeId) {
  if (!modalidadeId) return { error: 'modalidadeId é obrigatório' };

  return prisma.placar.updateMany({
    where: { time: { modalidadeId: Number(modalidadeId) } },
    data: {
      jogos: 0, posicao: 0, pontuacao: 0, vitorias: 0, empates: 0, derrotas: 0,
      golsPro: 0, golsSofridos: 0, saldoDeGols: 0, setsVencidos: 0, vitoria2x0: 0, vitoria2x1: 0,
      derrota2x1: 0, derrota2x0: 0, derrotaWo: 0, cartoesAmarelos: 0, cartoesVermelhos: 0, visivel: true
    }
  });
}

async function ocultarPlacarGeral() {
  await prisma.placar.updateMany({ data: { visivel: false } });
  const placaresAtualizados = await prisma.placar.findMany({
    include: { time: true },
    orderBy: { pontuacao: 'desc' }
  });

  broadcast({
    tipo: 'visibilidadeAtualizada',
    acao: 'ocultarGeral',
    placares: placaresAtualizados
  });

  return { message: 'Todos os placares foram ocultados na Home.' };
}

async function ocultarPlacarPorModalidade(modalidadeId) {
  if (!modalidadeId) return { error: 'modalidadeId é obrigatório' };

  const times = await prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    select: { id: true, modalidade: true }
  });

  if (times.length === 0) return { error: 'Nenhum placar encontrado' };

  const timeIds = times.map(t => t.id);

  await prisma.placar.updateMany({
    where: { timeId: { in: timeIds } },
    data: { visivel: false }
  });

  const placaresAtualizados = await prisma.placar.findMany({
    where: { timeId: { in: timeIds }, visivel: true },
    include: { time: true },
    orderBy: { pontuacao: 'desc' }
  });

  broadcast({
    tipo: 'visibilidadeAtualizada',
    acao: 'ocultarModalidade',
    modalidadeId: Number(modalidadeId),
    modalidade: times[0]?.modalidade?.nome,
    placares: placaresAtualizados
  });

  return { message: `Placares da modalidade ${modalidadeId} ocultados.` };
}

async function mostrarPlacarGeral() {
  await prisma.placar.updateMany({ data: { visivel: true } });

  const placaresAtualizados = await prisma.placar.findMany({
    include: { time: true },
    orderBy: { pontuacao: 'desc' }
  });

  broadcast({
    tipo: 'visibilidadeAtualizada',
    acao: 'mostrarGeral',
    placares: placaresAtualizados
  });

  return placaresAtualizados;
}

async function mostrarPlacarPorModalidade(modalidadeId) {
  if (!modalidadeId) return { error: 'modalidadeId é obrigatório' };

  const times = await prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    select: { id: true, modalidade: true }
  });

  if (times.length === 0) return { error: 'Nenhum placar encontrado' };

  const timeIds = times.map(t => t.id);

  await prisma.placar.updateMany({
    where: { timeId: { in: timeIds } },
    data: { visivel: true }
  });

  const placaresAtualizados = await prisma.placar.findMany({
    where: { timeId: { in: timeIds }, visivel: true },
    include: { time: true },
    orderBy: { pontuacao: 'desc' }
  });

  broadcast({
    tipo: 'visibilidadeAtualizada',
    acao: 'mostrarModalidade',
    modalidadeId: Number(modalidadeId),
    modalidade: times[0]?.modalidade?.nome,
    placares: placaresAtualizados
  });

  return placaresAtualizados;
}

async function listarVisibilidade() {
  const modalidades = await prisma.modalidade.findMany({
    select: { id: true, nome: true }
  });

  const resultado = await Promise.all(
    modalidades.map(async (m) => {
      const placar = await prisma.placar.findFirst({
        where: { time: { modalidadeId: m.id } },
        select: { visivel: true }
      });

      let visivel = true;
      if (placar) {
        visivel = placar.visivel;
      }

      return {
        modalidadeId: m.id,
        nome: m.nome,
        visivel
      };
    })
  );

  return resultado;
}

module.exports = {
  cadastrarModalidade,
  removerModalidade,
  listarModalidades,
  criarTime,
  removerTime,
  listarTimesPorModalidade,
  listarTodosTimes,
  criarPlacar,
  atualizarPlacar,
  listarPlacarPorModalidade,
  resetarPlacarPorModalidade,
  ocultarPlacarGeral,
  ocultarPlacarPorModalidade,
  mostrarPlacarGeral,
  mostrarPlacarPorModalidade,
  listarVisibilidade
};