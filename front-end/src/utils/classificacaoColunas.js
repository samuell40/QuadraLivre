const GRUPO_FUTEBOL = 'FUTEBOL'
const GRUPO_VOLEI = 'VOLEI'

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
    { key: 'setsVencidos', label: 'Sets vencidos', abbr: 'STV' },
    { key: 'vitoria3x0', label: 'Vitoria 3x0', abbr: '3x0' },
    { key: 'vitoria3x2', label: 'Vitoria 3x2', abbr: '3x2' },
    { key: 'derrota2x3', label: 'Derrota 2x3', abbr: '2x3' },
    { key: 'derrota0x3', label: 'Derrota 0x3', abbr: '0x3' },
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

  if (
    nome.includes('volei') ||
    nome.includes('futevolei') ||
    (nome.includes('beach') && nome.includes('tenis'))
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
  getColunasClassificacaoPorModalidade,
  getChavesPadraoColunasClassificacao,
  resolverColunasVisiveisClassificacao,
  grupoModalidadeClassificacao
}
