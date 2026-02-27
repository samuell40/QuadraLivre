const GRUPO_FUTEBOL = 'FUTEBOL'
const GRUPO_VOLEI = 'VOLEI'
const GRUPO_BEACH_TENIS = 'BEACH_TENIS'

const COLUNAS_CLASSIFICACAO = {
  [GRUPO_FUTEBOL]: [
    { key: 'pontuacao', label: 'Pontos', abbr: 'PTS' },
    { key: 'jogos', label: 'Jogos', abbr: 'J' },
    { key: 'vitorias', label: 'Vitorias', abbr: 'V' },
    { key: 'empates', label: 'Empates', abbr: 'E' },
    { key: 'derrotas', label: 'Derrotas', abbr: 'D' },
    { key: 'golsPro', label: 'Gols marcados', abbr: 'GM' },
    { key: 'golsSofridos', label: 'Gols sofridos', abbr: 'GS' },
    { key: 'saldoDeGols', label: 'Saldo de gols', abbr: 'SG' },
    { key: 'aproveitamento', label: 'Aproveitamento', abbr: '%' },
    { key: 'ultimosJogos', label: 'Ultimos jogos', abbr: 'Ultimos Jogos' }
  ],
  [GRUPO_VOLEI]: [
    { key: 'pontuacao', label: 'Pontos', abbr: 'PTS' },
    { key: 'jogos', label: 'Jogos', abbr: 'J' },
    { key: 'vitorias', label: 'Vitorias', abbr: 'VIT' },
    { key: 'derrotas', label: 'Derrotas', abbr: 'DER' },
    { key: 'setsVencidos', label: 'Sets pro', abbr: 'SP' },
    { key: 'setsContra', label: 'Sets contra', abbr: 'SC' },
    { key: 'diferencaSets', label: 'Diferenca de sets', abbr: 'DS' },
    { key: 'pontosPro', label: 'Pontos pro', abbr: 'PP' },
    { key: 'pontosContra', label: 'Pontos contra', abbr: 'PC' },
    { key: 'diferencaPontos', label: 'Diferenca de pontos', abbr: 'DP' },
    { key: 'pontosAverage', label: 'Pontos average', abbr: 'AVG' },
    { key: 'derrotaWo', label: 'Derrota por W.O', abbr: 'W.O' },
    { key: 'ultimosJogos', label: 'Ultimos jogos', abbr: 'Ultimos Jogos' }
  ],
  [GRUPO_BEACH_TENIS]: [
    { key: 'pontuacao', label: 'Pontos', abbr: 'PTS' },
    { key: 'jogos', label: 'Jogos', abbr: 'J' },
    { key: 'vitorias', label: 'Vitorias', abbr: 'VIT' },
    { key: 'derrotas', label: 'Derrotas', abbr: 'DER' },
    { key: 'setsVencidos', label: 'Sets pro', abbr: 'SP' },
    { key: 'setsContra', label: 'Sets contra', abbr: 'SC' },
    { key: 'diferencaSets', label: 'Diferenca de sets', abbr: 'DS' },
    { key: 'gamesPro', label: 'Games a favor', abbr: 'GF' },
    { key: 'gamesContra', label: 'Games contra', abbr: 'GC' },
    { key: 'diferencaGames', label: 'Diferenca de games', abbr: 'DG' },
    { key: 'derrotaWo', label: 'Derrota por W.O', abbr: 'W.O' },
    { key: 'ultimosJogos', label: 'Ultimos jogos', abbr: 'Ultimos Jogos' }
  ]
}

function normalizarModalidadeNome(modalidade) {
  return String(modalidade || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function grupoModalidadeClassificacao(modalidade) {
  const nome = normalizarModalidadeNome(modalidade)

  if (nome.includes('beach') && (nome.includes('tenis') || nome.includes('tennis'))) {
    return GRUPO_BEACH_TENIS
  }

  if (
    nome.includes('volei') ||
    nome.includes('futevolei')
  ) {
    return GRUPO_VOLEI
  }

  return GRUPO_FUTEBOL
}

function getColunasClassificacaoPorModalidade(modalidade) {
  const grupo = grupoModalidadeClassificacao(modalidade)
  return [...(COLUNAS_CLASSIFICACAO[grupo] || COLUNAS_CLASSIFICACAO[GRUPO_FUTEBOL])]
}

function getChavesPadraoColunasClassificacao(modalidade) {
  return getColunasClassificacaoPorModalidade(modalidade).map(coluna => coluna.key)
}

function resolverColunasVisiveisClassificacao(modalidade, colunasConfiguradas) {
  const colunasDisponiveis = getColunasClassificacaoPorModalidade(modalidade)
  const chavesValidas = new Set(colunasDisponiveis.map(coluna => coluna.key))
  const padrao = colunasDisponiveis.map(coluna => coluna.key)

  if (!Array.isArray(colunasConfiguradas) || colunasConfiguradas.length === 0) {
    return padrao
  }

  const filtradas = []
  for (const coluna of colunasConfiguradas) {
    const chave = String(coluna || '')
    if (chavesValidas.has(chave) && !filtradas.includes(chave)) {
      filtradas.push(chave)
    }
  }

  return filtradas.length ? filtradas : padrao
}

export {
  GRUPO_FUTEBOL,
  GRUPO_VOLEI,
  GRUPO_BEACH_TENIS,
  getColunasClassificacaoPorModalidade,
  getChavesPadraoColunasClassificacao,
  resolverColunasVisiveisClassificacao,
  grupoModalidadeClassificacao
}
