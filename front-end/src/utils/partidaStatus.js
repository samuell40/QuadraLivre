const STATUS_LABELS = {
  AGENDADA: 'AGENDADA',
  AGENDADA_HOJE: 'AGENDADA PARA HOJE',
  ADIADA: 'ADIADA',
  EM_ANDAMENTO: 'EM ANDAMENTO',
  FINALIZADA: 'ENCERRADA',
  CANCELADA: 'CANCELADA',
  DELETADA: 'DELETAR'
}

function normalizarStatusPartida(status) {
  return String(status || '').trim().toUpperCase()
}

function obterStatusBruto(partidaOuStatus) {
  if (partidaOuStatus && typeof partidaOuStatus === 'object') {
    return normalizarStatusPartida(partidaOuStatus.status)
  }

  return normalizarStatusPartida(partidaOuStatus)
}

function obterDataReferencia(partidaOuStatus, dataReferencia = null) {
  if (partidaOuStatus && typeof partidaOuStatus === 'object') {
    return partidaOuStatus.data || partidaOuStatus.createdAt || dataReferencia || null
  }

  return dataReferencia
}

function converterParaDataValida(valor) {
  const data = valor instanceof Date ? valor : new Date(valor)
  return Number.isNaN(data.getTime()) ? null : data
}

function eOMesmoDia(dataA, dataB = new Date()) {
  return dataA.getDate() === dataB.getDate()
    && dataA.getMonth() === dataB.getMonth()
    && dataA.getFullYear() === dataB.getFullYear()
}

export function isPartidaHoje(partidaOuStatus, dataReferencia = null) {
  const data = converterParaDataValida(obterDataReferencia(partidaOuStatus, dataReferencia))
  return Boolean(data) && eOMesmoDia(data)
}

export function isStatusPartidaPendente(partidaOuStatus) {
  return ['AGENDADA', 'ADIADA'].includes(obterStatusBruto(partidaOuStatus))
}

export function obterStatusExibicaoPartida(partidaOuStatus, dataReferencia = null) {
  const status = obterStatusBruto(partidaOuStatus)
  if (!status) return ''

  if (isStatusPartidaPendente(partidaOuStatus) && isPartidaHoje(partidaOuStatus, dataReferencia)) {
    return 'AGENDADA_HOJE'
  }

  return status
}

export function obterRotuloStatusPartida(partidaOuStatus, dataReferencia = null) {
  const statusExibicao = obterStatusExibicaoPartida(partidaOuStatus, dataReferencia)
  if (STATUS_LABELS[statusExibicao]) {
    return STATUS_LABELS[statusExibicao]
  }

  const statusBruto = obterStatusBruto(partidaOuStatus)
  return STATUS_LABELS[statusBruto] || statusBruto.replaceAll('_', ' ')
}
