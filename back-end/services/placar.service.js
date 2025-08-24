const { broadcast } = require("../websocket");
const { PrismaClient } = require('@prisma/client');
const { enviarEmailNovaModalidade } = require('./email.service')
const prisma = new PrismaClient();

async function cadastrarModalidade(nome) {
  const existente = await prisma.modalidade.findUnique({ where: { nome } });
  if (existente) throw new Error(`A modalidade "${nome}" já existe.`);

  const modalidade = await prisma.modalidade.create({ data: { nome } });

  const placar = await prisma.placar.findFirst({
    where: { time: { modalidadeId: modalidade.id } },
    include: { time: true }
  });

  if (!placar) {
    const ID_DESENVOLVEDOR_SISTEMA = 1;
    const desenvolvedores = await prisma.usuario.findMany({
      where: { permissaoId: ID_DESENVOLVEDOR_SISTEMA },
      select: { nome: true, email: true }
    });

    for (const dev of desenvolvedores) {
      await enviarEmailNovaModalidade(dev, modalidade.nome);
    }
  }

  return modalidade;
}

async function removerModalidade(id) {
  const times = await prisma.time.findMany({ where: { modalidadeId: Number(id) } });

  for (const time of times) {
    await prisma.placar.deleteMany({ where: { timeId: time.id } });
  }

  await prisma.time.deleteMany({ where: { modalidadeId: Number(id) } });

  return prisma.modalidade.delete({ where: { id: Number(id) } });
}

async function listarModalidades() {
  return prisma.modalidade.findMany({ include: { times: true, quadras: true } });
}

async function criarTime({ nome, foto, modalidadeId }) {
  const time = await prisma.time.create({
    data: { nome: nome.trim(), foto, modalidadeId: Number(modalidadeId) },
  });

  await criarPlacar({ timeId: time.id });
  return time;
}

async function removerTime(id) {
  const timeId = Number(id);
  await prisma.usuarioTime.deleteMany({
    where: { timeId }
  });

  await prisma.placar.deleteMany({
    where: { timeId }
  });

  return prisma.time.delete({
    where: { id: timeId }
  });
}

async function listarTimesPorModalidade(modalidadeId) {
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
  return prisma.placar.create({
    data: {
      timeId: Number(timeId),
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
      visivel: true
    }
  });
}

async function atualizarPlacar(id, dados) {
  return prisma.placar.update({
    where: { id: Number(id) },
    data: dados,
    include: { time: true }
  });
}

async function listarPlacarPorModalidade(modalidadeId) {
  return prisma.placar.findMany({
    where: { time: { modalidadeId: Number(modalidadeId) } },
    include: { time: true },
    orderBy: { pontuacao: 'desc' },
  });
}

async function resetarPlacarPorModalidade(modalidadeId) {
  return prisma.placar.updateMany({
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
      visivel: true
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
  const times = await prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    select: { id: true, modalidade: true }
  });

  const timeIds = times.map(t => t.id);

  await prisma.placar.updateMany({
    where: { timeId: { in: timeIds } },
    data: { visivel: false }
  });

  const placaresAtualizados = await prisma.placar.findMany({
    where: { timeId: { in: timeIds } },
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
  const times = await prisma.time.findMany({
    where: { modalidadeId: Number(modalidadeId) },
    select: { id: true, modalidade: true }
  });

  const timeIds = times.map(t => t.id);

  await prisma.placar.updateMany({
    where: { timeId: { in: timeIds } },
    data: { visivel: true }
  });

  const placaresAtualizados = await prisma.placar.findMany({
    where: { timeId: { in: timeIds } },
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

      return {
        modalidadeId: m.id,
        nome: m.nome,
        visivel: placar?.visivel ?? true
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