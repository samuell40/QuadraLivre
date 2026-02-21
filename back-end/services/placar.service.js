const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CRITERIOS_PADRAO = {
  futebol: [
    { value: "pontuacao", label: "Pontuação" },
    { value: "vitorias", label: "Vitórias" },
    { value: "saldoDeGols", label: "Saldo de gols" },
    { value: "golsPro", label: "Gols pró" },
    { value: "golsSofridos", label: "Gols sofridos" },
    { value: "empates", label: "Empates" },
    { value: "derrotas", label: "Derrotas" },
    { value: "confrontoDireto", label: "Confronto direto" },
    { value: "sorteio", label: "Sorteio" }
  ],
  volei: [
    { value: "pontuacao", label: "Pontuação" },
    { value: "setsVencidos", label: "Sets vencidos" },
    { value: "vitoria3x0", label: "Vitória 3x0" },
    { value: "vitoria3x2", label: "Vitória 3x2" },
    { value: "derrota2x3", label: "Derrota 2x3" },
    { value: "derrota0x3", label: "Derrota 0x3" },
    { value: "sorteio", label: "Sorteio" }
  ]
};

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function grupoModalidade(nomeModalidade) {
  const nome = normalizarTexto(nomeModalidade);
  if (
    nome.includes('volei') ||
    nome.includes('futevolei') ||
    (nome.includes('beach') && nome.includes('tenis'))
  ) {
    return 'VOLEI';
  }
  return 'FUTEBOL';
}

function criteriosPadraoPorModalidade(nomeModalidade) {
  const grupo = grupoModalidade(nomeModalidade);
  return grupo === 'VOLEI' ? CRITERIOS_PADRAO.volei : CRITERIOS_PADRAO.futebol;
}

function regrasPadraoPorModalidade(nomeModalidade) {
  const grupo = grupoModalidade(nomeModalidade);
  if (grupo === 'VOLEI') {
    return {
      regraPontosVitoria: 'VITORIA_2_SEMPRE',
      regraPontosDerrota: 'DERROTA_0_SEMPRE',
      pontosEmpate: 0,
      pontosVitoria: 3,
      pontosDerrota: 0
    };
  }
  return {
    pontosVitoria: 3,
    pontosEmpate: 1,
    pontosDerrota: 0
  };
}

function normalizarRegrasCampeonato(regras, nomeModalidade) {
  return {
    ...regrasPadraoPorModalidade(nomeModalidade),
    ...(regras || {})
  };
}

function calcularPontosVoleiParaResultado(setsVencedor, setsPerdedor, regras) {
  const diff = Math.abs((Number(setsVencedor) || 0) - (Number(setsPerdedor) || 0));

  let pontosVencedor = 2;
  if (regras.regraPontosVitoria === 'VITORIA_3_SEMPRE') {
    pontosVencedor = 3;
  } else if (regras.regraPontosVitoria === 'VITORIA_3_DIF_SETS_MAIOR_1') {
    pontosVencedor = diff > 1 ? 3 : 2;
  }

  let pontosPerdedor = 0;
  if (regras.regraPontosDerrota === 'DERROTA_1_SEMPRE') {
    pontosPerdedor = 1;
  } else if (regras.regraPontosDerrota === 'DERROTA_1_DIF_SETS_MENOR_2') {
    pontosPerdedor = diff < 2 ? 1 : 0;
  }

  return { pontosVencedor, pontosPerdedor };
}

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
  const campeonato = await prisma.campeonato.update({
    where: { id: Number(campeonatoId) },
    data: { ordemClassificacao: novaOrdem },
    select: {
      id: true,
      regras: true,
      modalidade: { select: { nome: true } }
    }
  });

  const regras = normalizarRegrasCampeonato(campeonato.regras, campeonato.modalidade?.nome);
  const grupo = grupoModalidade(campeonato.modalidade?.nome);

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
        if (grupo === 'FUTEBOL') {
          const v = Number(regras.pontosVitoria) || 0;
          const d = Number(regras.pontosDerrota) || 0;
          if (p.timeAId === timeAId) {
            pontosA += v;
            pontosB += d;
          } else {
            pontosB += v;
            pontosA += d;
          }
        } else {
          const pts = calcularPontosVoleiParaResultado(p.pontosTimeA, p.pontosTimeB, regras);
          if (p.timeAId === timeAId) {
            pontosA += pts.pontosVencedor;
            pontosB += pts.pontosPerdedor;
          } else {
            pontosB += pts.pontosVencedor;
            pontosA += pts.pontosPerdedor;
          }
        }
      } else if (p.pontosTimeB > p.pontosTimeA) {
        if (grupo === 'FUTEBOL') {
          const v = Number(regras.pontosVitoria) || 0;
          const d = Number(regras.pontosDerrota) || 0;
          if (p.timeBId === timeAId) {
            pontosA += v;
            pontosB += d;
          } else {
            pontosB += v;
            pontosA += d;
          }
        } else {
          const pts = calcularPontosVoleiParaResultado(p.pontosTimeB, p.pontosTimeA, regras);
          if (p.timeBId === timeAId) {
            pontosA += pts.pontosVencedor;
            pontosB += pts.pontosPerdedor;
          } else {
            pontosB += pts.pontosVencedor;
            pontosA += pts.pontosPerdedor;
          }
        }
      } else {
        const e = Number(regras.pontosEmpate) || 0;
        pontosA += e;
        pontosB += e;
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
      modalidade: { select: { nome: true } },
      ordemClassificacao: true,
    },
  });

  if (!campeonato) {
    throw new Error("Campeonato não encontrado");
  }

  if (Array.isArray(campeonato.ordemClassificacao) && campeonato.ordemClassificacao.length > 0) {
    return campeonato.ordemClassificacao;
  }

  return criteriosPadraoPorModalidade(campeonato.modalidade?.nome);
}

module.exports = { atualizarPlacar, listarPlacarPorCampeonato, salvarOrdemClassificacao, listarOrdemClassificacao };
