<template>
  <div class="placar-table">
    <div v-if="loading" class="loader-container-centralizado">
      <div class="loader"></div>
    </div>

    <div v-else-if="!times.length" class="sem-dados-centralizado">
      {{ emptyText }}
    </div>

    <table v-else-if="isGrupoFutebol || isGrupoVolei" class="placar" :class="isGrupoFutebol ? 'grupo-futebol' : 'grupo-volei'">
      <thead>
        <tr>
          <th>Time</th>
          <th
            v-for="coluna in colunasTabela"
            :key="`head-${coluna.key}`"
            :class="{ 'col-ultimos': coluna.key === 'ultimosJogos' }"
          >
            {{ coluna.abbr }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, index) in times" :key="time.id || time.timeId || index">
          <td class="time-info time-info-click" @click="onTimeClick(time)">
            <span class="posicao">{{ index + 1 }}º</span>
            <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />
            <span class="nome-time">{{ time.time?.nome }}</span>
          </td>
          <td
            v-for="coluna in colunasTabela"
            :key="`${time.id || time.timeId || index}-${coluna.key}`"
            :class="{ 'ultimos-jogos-cell': coluna.key === 'ultimosJogos' }"
          >
            <template v-if="coluna.key === 'ultimosJogos'">
              <div class="ultimos-jogos">
                <span
                  v-for="(resultado, resultadoIndex) in obterUltimosJogos(time)"
                  :key="`${time.id || index}-res-${resultadoIndex}`"
                  class="resultado-item"
                  :class="classeResultado(resultado)"
                >
                  {{ simboloResultado(resultado) }}
                </span>
              </div>
            </template>
            <template v-else>
              {{ formatarValorColuna(time, coluna.key) }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="sem-dados-centralizado">
      {{ emptyText }}
    </div>
  </div>

  <div v-if="showGlossary && temTabela && isGrupoFutebol" class="glossario-placar">
    <strong>Glossario</strong>

    <div class="glossario-grid">
      <p v-if="mostrarColuna('pontuacao')"><b>PTS</b>: Pontos</p>
      <p v-if="mostrarColuna('jogos')"><b>J</b>: Jogos</p>
      <p v-if="mostrarColuna('vitorias')"><b>V</b>: Vitorias</p>
      <p v-if="mostrarColuna('empates')"><b>E</b>: Empates</p>
      <p v-if="mostrarColuna('derrotas')"><b>D</b>: Derrotas</p>
      <p v-if="mostrarColuna('golsPro')"><b>GM</b>: Gols marcados</p>
      <p v-if="mostrarColuna('golsSofridos')"><b>GS</b>: Gols sofridos</p>
      <p v-if="mostrarColuna('saldoDeGols')"><b>SG</b>: Saldo de gols</p>
      <p v-if="mostrarColuna('aproveitamento')"><b>%</b>: Aproveitamento</p>
    </div>
  </div>

  <div v-if="showGlossary && temTabela && isGrupoVolei" class="glossario-placar">
    <strong>Glossario</strong>

    <div class="glossario-grid">
      <p v-if="mostrarColuna('pontuacao')"><b>PTS</b>: Pontos</p>
      <p v-if="mostrarColuna('jogos')"><b>J</b>: Jogos</p>
      <p v-if="mostrarColuna('vitorias')"><b>V</b>: Vitorias</p>
      <p v-if="mostrarColuna('derrotas')"><b>D</b>: Derrotas</p>
      <p v-if="mostrarColuna('setsVencidos')"><b>STV</b>: Sets vencidos</p>
      <p v-if="mostrarColuna('vitoria3x0')"><b>3x0</b>: Vitoria por 3 sets a 0</p>
      <p v-if="mostrarColuna('vitoria3x2')"><b>3x2</b>: Vitoria por 3 sets a 2</p>
      <p v-if="mostrarColuna('derrota2x3')"><b>2x3</b>: Derrota por 2 sets a 3</p>
      <p v-if="mostrarColuna('derrota0x3')"><b>0x3</b>: Derrota por 0 sets a 3</p>
      <p v-if="mostrarColuna('derrotaWo')"><b>W.O.</b>: Derrota por W.O.</p>
    </div>
  </div>
</template>

<script>
import {
  getColunasClassificacaoPorModalidade,
  resolverColunasVisiveisClassificacao
} from '@/utils/classificacaoColunas'

export default {
  name: 'TabelaClassificacao',
  props: {
    times: { type: Array, default: () => [] },
    modalidade: { type: String, default: 'futebol' },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: 'Nenhum placar encontrado para este campeonato.' },
    showGlossary: { type: Boolean, default: true },
    colunasVisiveis: { type: Array, default: () => [] }
  },
  emits: ['time-click'],
  computed: {
    modalidadeNormalizada() {
      return String(this.modalidade || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
    },
    isGrupoFutebol() {
      return ['futebol', 'futebol de areia', 'futsal'].includes(this.modalidadeNormalizada)
    },
    isGrupoVolei() {
      return ['volei', 'volei de areia', 'futevolei', 'beach tenis', 'beach tennis'].includes(this.modalidadeNormalizada)
    },
    temTabela() {
      return !this.loading && Array.isArray(this.times) && this.times.length > 0
    },
    colunasVisiveisResolvidas() {
      return resolverColunasVisiveisClassificacao(this.modalidade, this.colunasVisiveis)
    },
    colunasVisiveisSet() {
      return new Set(this.colunasVisiveisResolvidas)
    },
    colunasTabela() {
      const mapa = new Map(
        getColunasClassificacaoPorModalidade(this.modalidade)
          .map(coluna => [coluna.key, coluna])
      )

      return this.colunasVisiveisResolvidas
        .map(chave => mapa.get(chave))
        .filter(Boolean)
    }
  },
  methods: {
    mostrarColuna(chave) {
      return this.colunasVisiveisSet.has(chave)
    },
    formatarValorColuna(time, chave) {
      if (chave === 'aproveitamento') {
        return `${time?.aproveitamento ?? 0}%`
      }

      return time?.[chave] ?? ''
    },
    onTimeClick(time) {
      const payload = {
        id: Number(time?.timeId ?? time?.time?.id ?? time?.id),
        nome: time?.time?.nome ?? time?.nome ?? '',
        foto: time?.time?.foto ?? time?.foto ?? ''
      }

      if (!Number.isFinite(payload.id) || payload.id <= 0) return
      this.$emit('time-click', payload)
    },
    obterUltimosJogos(time) {
      const candidatas = [
        time?.ultimosJogos,
        time?.ultimos_jogos,
        time?.ultimosResultados,
        time?.ultimos_resultados,
        time?.historico,
        time?.recentes,
        time?.forma,
        time?.form
      ]

      const bruto = candidatas.find(valor => Array.isArray(valor) || typeof valor === 'string')
      let resultados = []

      if (Array.isArray(bruto)) {
        resultados = bruto.map(item => this.normalizarResultadoItem(item, time))
      } else if (typeof bruto === 'string') {
        resultados = this.extrairResultadosDeTexto(bruto)
      }

      const normalizados = resultados
        .map(item => this.normalizarResultadoTexto(item))
        .filter(item => ['V', 'E', 'D', '-'].includes(item))
        .slice(0, 3)

      while (normalizados.length < 3) normalizados.push('-')
      return normalizados
    },
    extrairResultadosDeTexto(texto) {
      const bruto = String(texto || '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()

      if (!bruto) return []

      const separadores = /[,\s;/|-]/
      const tokens = separadores.test(bruto)
        ? bruto.split(/[,\s;/|-]+/).filter(Boolean)
        : bruto.split('')

      return tokens.map(token => this.normalizarResultadoTexto(token))
    },
    normalizarResultadoItem(item, time) {
      if (item == null) return '-'

      if (typeof item === 'string' || typeof item === 'number') {
        return this.normalizarResultadoTexto(item)
      }

      if (typeof item !== 'object') return '-'

      const valorDireto =
        item.resultado ??
        item.status ??
        item.tipo ??
        item.code ??
        item.valor ??
        item.sigla

      if (valorDireto != null) {
        const direto = this.normalizarResultadoTexto(valorDireto)
        if (direto !== '-') return direto
      }

      if (item.venceu === true || item.vitoria === true) return 'V'
      if (item.empatou === true || item.empate === true) return 'E'
      if (item.perdeu === true || item.derrota === true) return 'D'

      const timeId = time?.timeId ?? time?.time?.id ?? time?.id
      const vencedorId = item.vencedorId ?? item.timeVencedorId ?? item.ganhadorId
      if (timeId != null && vencedorId != null) {
        return String(vencedorId) === String(timeId) ? 'V' : 'D'
      }

      const pontosPro = item.golsPro ?? item.pontosPro ?? item.pontos ?? item.marcados
      const pontosContra = item.golsContra ?? item.golsSofridos ?? item.pontosContra ?? item.sofridos
      if (Number.isFinite(Number(pontosPro)) && Number.isFinite(Number(pontosContra))) {
        if (Number(pontosPro) > Number(pontosContra)) return 'V'
        if (Number(pontosPro) < Number(pontosContra)) return 'D'
        return 'E'
      }

      return '-'
    },
    normalizarResultadoTexto(valor) {
      const token = String(valor || '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()

      if (['V', 'W', 'WIN', 'WON', 'VITORIA', 'VITORIAS', 'GANHOU'].includes(token)) return 'V'
      if (['E', 'DRAW', 'EMPATE', 'EMPATES', 'TIE'].includes(token)) return 'E'
      if (['D', 'L', 'LOSS', 'LOST', 'DERROTA', 'DERROTAS', 'PERDEU', 'X'].includes(token)) return 'D'
      if (['-', 'N', 'NULL', 'SEM'].includes(token)) return '-'
      return '-'
    },
    classeResultado(resultado) {
      if (resultado === 'V') return 'resultado-v'
      if (resultado === 'E') return 'resultado-e'
      if (resultado === 'D') return 'resultado-d'
      return 'resultado-n'
    },
    simboloResultado(resultado) {
      if (resultado === 'V') return '\u2713'
      if (resultado === 'D') return '\u2715'
      return '-'
    }
  }
}
</script>

<style scoped>
.placar-table {
  margin-top: 30px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.placar {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  table-layout: auto;
}

.placar thead th {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  padding: 10px 8px;
  font-size: 14px;
  text-align: left;
  white-space: nowrap;
}

.placar tbody tr:hover {
  background-color: #f3f4f6;
}

.placar tbody td {
  color: #374151;
  padding: 9px 8px;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.col-ultimos {
  text-align: center !important;
  min-width: 136px;
}

.ultimos-jogos-cell {
  min-width: 136px;
}

.ultimos-jogos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.resultado-item {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.resultado-v {
  background-color: #16a34a;
  color: #fff;
}

.resultado-e {
  background-color: #9ca3af;
  color: #fff;
}

.resultado-d {
  background-color: #ef4444;
  color: #fff;
}

.resultado-n {
  background-color: #cbd5e1;
  color: #334155;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 170px;
}

.time-info.time-info-click {
  cursor: pointer;
}

.time-info.time-info-click .nome-time {
  text-decoration: underline;
}

.posicao {
  font-weight: bold;
  font-size: 14px;
  min-width: 20px;
  text-align: right;
  color: #3b82f6;
}

.time-image {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #d1d5db;
}

.nome-time {
  font-weight: 500;
  color: #7e7e7e;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 220px;
}

.loader {
  width: 36px;
  height: 36px;
  border: 4px solid #dbeafe;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.sem-dados-centralizado {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #6b7280;
}

.glossario-placar {
  margin-top: 12px;
  padding: 12px 14px;
  background: #f5f6fa;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
}

.glossario-placar strong {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
}

.glossario-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 18px;
}

.glossario-grid p {
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.glossario-grid b {
  color: #152147;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .placar-table {
    margin-top: 18px;
  }

  .placar {
    min-width: 680px;
  }

  .placar thead th {
    padding: 8px 6px;
    font-size: 12px;
  }

  .placar tbody td {
    padding: 7px 6px;
    font-size: 12px;
  }

  .col-ultimos,
  .ultimos-jogos-cell {
    min-width: 110px;
  }

  .resultado-item {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }

  .time-image {
    width: 28px;
    height: 28px;
  }

  .time-info {
    min-width: 140px;
  }

  .nome-time {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .glossario-placar strong {
    font-size: 16px;
  }

  .glossario-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .glossario-grid p {
    font-size: 13px;
    white-space: normal;
  }
}
</style>
