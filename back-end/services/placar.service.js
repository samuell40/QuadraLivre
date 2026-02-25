const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CRITERIOS_PADRAO = {
  futebol: [
    { value: 'pontuacao', label: 'Pontuacao' },
    { value: 'vitorias', label: 'Vitorias' },
    { value: 'saldoDeGols', label: 'Saldo de gols' },
    { value: 'golsPro', label: 'Gols pro' },
    { value: 'golsSofridos', label: 'Gols sofridos' },
    { value: 'empates', label: 'Empates' },
    { value: 'derrotas', label: 'Derrotas' },
    { value: 'confrontoDireto', label: 'Confronto direto' },
    { value: 'sorteio', label: 'Sorteio' }
  ],
  volei: [
    { value: 'pontuacao', label: 'Pontuacao' },
    { value: 'setsVencidos', label: 'Sets vencidos' },
    { value: 'vitoria3x0', label: 'Vitoria 3x0' },
    { value: 'vitoria3x2', label: 'Vitoria 3x2' },
    { value: 'derrota2x3', label: 'Derrota 2x3' },
    { value: 'derrota0x3', label: 'Derrota 0x3' },
    { value: 'sorteio', label: 'Sorteio' }
  ]
};

const COLUNAS_PADRAO = {
  futebol: [
    'pontuacao',
    'jogos',
    'vitorias',
    'empates',
    'derrotas',
    'golsPro',
    'golsSofridos',
    'saldoDeGols',
    'aproveitamento',
    'ultimosJogos'
  ],
  volei: [
    'pontuacao',
    'jogos',
    'vitorias',
    'derrotas',
    'setsVencidos',
    'vitoria3x0',
    'vitoria3x2',
    'derrota2x3',
    'derrota0x3',
    'derrotaWo',
    'ultimosJogos'
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

function colunasPadraoPorModalidade(nomeModalidade) {
  const grupo = grupoModalidade(nomeModalidade);
  return grupo === 'VOLEI' ? COLUNAS_PADRAO.volei : COLUNAS_PADRAO.futebol;
}

function normalizarColunasClassificacao(colunas, nomeModalidade) {
  const padrao = colunasPadraoPorModalidade(nomeModalidade);

  if (!Array.isArray(colunas) || colunas.length === 0) {
    return [...padrao];
  }

  const validas = new Set(padrao);
  const colunasNormalizadas = [];

  for (const coluna of colunas) {
    const chave = String(coluna || '');
    if (validas.has(chave) && !colunasNormalizadas.includes(chave)) {
      colunasNormalizadas.push(chave);
    }
  }

  return colunasNormalizadas.length ? colunasNormalizadas : [...padrao];
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

async function salvarOrdemClassificacao(campeonatoId, novaOrdem = null, colunasVisiveis = null) {
  const id = Number(campeonatoId);
  const atualizarOrdem = Array.isArray(novaOrdem);
  const atualizarColunas = Array.isArray(colunasVisiveis);

  if (!atualizarOrdem && !atualizarColunas) {
    throw new Error('Informe ao menos ordem ou colunas para atualizar.');
  }

  const campeonatoAtual = await prisma.campeonato.findUnique({
    where: { id },
    select: {
      id: true,
      regras: true,
      ordemClassificacao: true,
      modalidade: { select: { nome: true } }
    }
  });

  if (!campeonatoAtual) {
    throw new Error('Campeonato nao encontrado');
  }

  const dataUpdate = {};

  if (atualizarOrdem) {
    dataUpdate.ordemClassificacao = novaOrdem;
  }

  if (atualizarColunas) {
    const regrasBase = normalizarRegrasCampeonato(campeonatoAtual.regras, campeonatoAtual.modalidade?.nome);
    dataUpdate.regras = {
      ...regrasBase,
      colunasClassificacao: normalizarColunasClassificacao(colunasVisiveis, campeonatoAtual.modalidade?.nome)
    };
  }

  const campeonato = await prisma.campeonato.update({
    where: { id },
    data: dataUpdate,
    select: {
      id: true,
      regras: true,
      ordemClassificacao: true,
      modalidade: { select: { nome: true } }
    }
  });

  const ordemFinal = Array.isArray(campeonato.ordemClassificacao) ? campeonato.ordemClassificacao : [];
  const colunasFinal = normalizarColunasClassificacao(
    campeonato.regras?.colunasClassificacao,
    campeonato.modalidade?.nome
  );

  if (!atualizarOrdem) {
    return {
      ordem: ordemFinal.length ? ordemFinal : criteriosPadraoPorModalidade(campeonato.modalidade?.nome),
      colunas: colunasFinal
    };
  }

  const regras = normalizarRegrasCampeonato(campeonato.regras, campeonato.modalidade?.nome);
  const grupo = grupoModalidade(campeonato.modalidade?.nome);

  const placares = await prisma.placar.findMany({
    where: { campeonatoId: id, visivel: true, deletedAt: null },
    include: { time: true }
  });

  async function calcularConfrontoDireto(timeAId, timeBId) {
    const partidas = await prisma.partida.findMany({
      where: {
        campeonatoId: id,
        OR: [
          { timeAId, timeBId },
          { timeAId: timeBId, timeBId: timeAId }
        ],
        status: 'FINALIZADA'
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

      for (const criterio of ordemFinal) {
        if (criterio.value === 'confrontoDireto') {
          resultado = await getConfronto(a.timeId, b.timeId);
          if (resultado !== 0) break;
          continue;
        }

        if (criterio.value === 'sorteio') {
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

  for (let i = 0; i < placares.length; i++) {
    await prisma.placar.update({
      where: { id: placares[i].id },
      data: { posicao: i + 1 }
    });
  }

  return {
    ordem: ordemFinal.length ? ordemFinal : criteriosPadraoPorModalidade(campeonato.modalidade?.nome),
    colunas: colunasFinal,
    placares: placares.map((p, index) => ({
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
    }))
  };
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
      regras: true
    }
  });

  if (!campeonato) {
    throw new Error('Campeonato nao encontrado');
  }

  const ordem = Array.isArray(campeonato.ordemClassificacao) && campeonato.ordemClassificacao.length > 0
    ? campeonato.ordemClassificacao
    : criteriosPadraoPorModalidade(campeonato.modalidade?.nome);

  const colunas = normalizarColunasClassificacao(
    campeonato.regras?.colunasClassificacao,
    campeonato.modalidade?.nome
  );

  return { ordem, colunas };
}

module.exports = {
  atualizarPlacar,
  listarPlacarPorCampeonato,
  salvarOrdemClassificacao,
  listarOrdemClassificacao
};
