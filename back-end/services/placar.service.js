const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function atualizarPlacar(id, dados) {
  return prisma.placar.update({
    where: { id: Number(id) },
    data: dados,
    include: {
      time: true,
      campeonato: true
    }
  });
}

async function listarPlacarPorCampeonato(campeonatoId) {
  return prisma.placar.findMany({
    where: {
      campeonatoId: Number(campeonatoId),
      visivel: true
    },
    include: {
      time: true,
      campeonato: true
    },
    orderBy: {
      pontuacao: 'desc'
    }
  });
}

async function salvarOrdemClassificacao(campeonatoId, novaOrdem) {
  await prisma.campeonato.update({
    where: { id: Number(campeonatoId) },
    data: { ordemClassificacao: novaOrdem }
  });

  const placares = await prisma.placar.findMany({
    where: { campeonatoId: Number(campeonatoId), visivel: true, deletedAt: null },
    include: { time: true }
  });

  async function calcularConfrontoDireto(timeAId, timeBId) {
    const partidas = await prisma.partida.findMany({
      where: {
        campeonatoId: Number(campeonatoId),
        OR: [
          { timeAId, timeBId },
          { timeAId: timeBId, timeBId: timeAId }
        ],
        status: "FINALIZADA"
      }
    });

    let pontosA = 0;
    let pontosB = 0;

    for (const p of partidas) {
      if (p.pontosTimeA > p.pontosTimeB) {
        if (p.timeAId === timeAId) pontosA += 3;
        else pontosB += 3;
      } else if (p.pontosTimeB > p.pontosTimeA) {
        if (p.timeBId === timeAId) pontosA += 3;
        else pontosB += 3;
      } else {
        pontosA += 1;
        pontosB += 1;
      }
    }
    return pontosB - pontosA;
  }

  const confrontoCache = {};
  async function getConfronto(aId, bId) {
    const chave = `${aId}-${bId}`;
    if (confrontoCache[chave] !== undefined) return confrontoCache[chave];
    const valor = await calcularConfrontoDireto(aId, bId);
    confrontoCache[chave] = valor;
    confrontoCache[`${bId}-${aId}`] = -valor;
    return valor;
  }

  for (let i = 0; i < placares.length; i++) {
    for (let j = i + 1; j < placares.length; j++) {
      const a = placares[i];
      const b = placares[j];
      let resultado = 0;

      for (const criterio of novaOrdem) {
        if (criterio.value === "confrontoDireto") {
          resultado = await getConfronto(a.timeId, b.timeId);
          if (resultado !== 0) break;
          continue;
        }

        if (criterio.value === "sorteio") {
          resultado = Math.random() - 0.5;
          break;
        }

        const valorA = a[criterio.value] ?? 0;
        const valorB = b[criterio.value] ?? 0;
        if (valorB !== valorA) {
          resultado = valorB - valorA;
          break;
        }
      }

      if (resultado > 0) {
        placares[i] = b;
        placares[j] = a;
      }
    }
  }

  // Atualiza a posição no banco
  for (let i = 0; i < placares.length; i++) {
    await prisma.placar.update({
      where: { id: placares[i].id },
      data: { posicao: i + 1 }
    });
  }

  return placares.map((p, index) => {
    return {
      id: p.id,
      timeId: p.timeId,
      campeonatoId: p.campeonatoId,
      pontuacao: p.pontuacao,
      saldoDeGols: p.saldoDeGols,
      vitorias: p.vitorias,
      empates: p.empates,
      derrotas: p.derrotas,
      golsPro: p.golsPro,
      golsSofridos: p.golsSofridos,
      visivel: p.visivel,
      deletedAt: p.deletedAt,
      posicao: index + 1,
      time: p.time 
    }
  });

}

async function listarOrdemClassificacao(campeonatoId) {
  const campeonato = await prisma.campeonato.findUnique({
    where: { id: campeonatoId },
    select: {
      id: true,
      nome: true,
      modalidadeId: true,
      ordemClassificacao: true,
    },
  });

  if (!campeonato) {
    throw new Error("Campeonato não encontrado");
  }

  return campeonato.ordemClassificacao || [];
}

module.exports = { atualizarPlacar, listarPlacarPorCampeonato, salvarOrdemClassificacao, listarOrdemClassificacao };