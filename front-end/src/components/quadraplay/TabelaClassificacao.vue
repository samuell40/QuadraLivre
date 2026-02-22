<template>
  <div class="placar-table">
    <div v-if="loading" class="loader-container-centralizado">
      <div class="loader"></div>
    </div>

    <div v-else-if="!times.length" class="sem-dados-centralizado">
      {{ emptyText }}
    </div>

    <table v-else-if="isGrupoFutebol" class="placar grupo-futebol">
      <thead>
        <tr>
          <th>Time</th>
          <th>PTS</th>
          <th>J</th>
          <th>VIT</th>
          <th>E</th>
          <th>DER</th>
          <th>GM</th>
          <th>GS</th>
          <th>SG</th>
          <th>%</th>
          <th class="col-ultimos">Últimos Jogos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, index) in times" :key="time.id">
          <td class="time-info">
            <span class="posicao">{{ index + 1 }}º</span>
            <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />
            <span class="nome-time">{{ time.time?.nome }}</span>
          </td>
          <td>{{ time.pontuacao }}</td>
          <td>{{ time.jogos }}</td>
          <td>{{ time.vitorias }}</td>
          <td>{{ time.empates }}</td>
          <td>{{ time.derrotas }}</td>
          <td>{{ time.golsPro }}</td>
          <td>{{ time.golsSofridos }}</td>
          <td>{{ time.saldoDeGols }}</td>
          <td>{{ time.aproveitamento ?? 0 }}%</td>
          <td class="ultimos-jogos-cell">
            <div class="ultimos-jogos">
              <span v-for="(resultado, resultadoIndex) in obterUltimosJogos(time)"
                :key="`${time.id || index}-fut-${resultadoIndex}`" class="resultado-item"
                :class="classeResultado(resultado)">
                {{ simboloResultado(resultado) }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <table v-else-if="isGrupoVolei" class="placar grupo-volei">
      <thead>
        <tr>
          <th>Time</th>
          <th>PTS</th>
          <th>J</th>
          <th>VIT</th>
          <th>DER</th>
          <th>STV</th>
          <th>3x0</th>
          <th>3x2</th>
          <th>2x3</th>
          <th>0x3</th>
          <th>W.O.</th>
          <th class="col-ultimos">Últimos Jogos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, index) in times" :key="time.id">
          <td class="time-info">
            <span class="posicao">{{ index + 1 }}º</span>
            <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />
            <span class="nome-time">{{ time.time?.nome }}</span>
          </td>
          <td>{{ time.pontuacao }}</td>
          <td>{{ time.jogos }}</td>
          <td>{{ time.vitorias }}</td>
          <td>{{ time.derrotas }}</td>
          <td>{{ time.setsVencidos }}</td>
          <td>{{ time.vitoria3x0 }}</td>
          <td>{{ time.vitoria3x2 }}</td>
          <td>{{ time.derrota2x3 }}</td>
          <td>{{ time.derrota0x3 }}</td>
          <td>{{ time.derrotaWo }}</td>
          <td class="ultimos-jogos-cell">
            <div class="ultimos-jogos">
              <span v-for="(resultado, resultadoIndex) in obterUltimosJogos(time)"
                :key="`${time.id || index}-vol-${resultadoIndex}`" class="resultado-item"
                :class="classeResultado(resultado)">
                {{ simboloResultado(resultado) }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- GLOSSÁRIO FUTEBOL -->
  <div v-if="showGlossary && isGrupoFutebol" class="glossario-placar">
    <strong>Glossário</strong>

    <div class="glossario-grid">
      <p><b>PTS</b>: Pontos</p>
      <p><b>J</b>: Jogos</p>
      <p><b>VIT</b>: Vitórias</p>
      <p><b>E</b>: Empates</p>
      <p><b>DER</b>: Derrotas</p>
      <p><b>GM</b>: Gols Marcados</p>
      <p><b>GS</b>: Gols Sofridos</p>
      <p><b>SG</b>: Saldo de Gols</p>
      <p><b>%</b>: Aproveitamento</p>
    </div>
  </div>

  <!-- GLOSSÁRIO VÔLEI -->
  <div v-if="showGlossary && isGrupoVolei" class="glossario-placar">
    <strong>Glossário</strong>

    <div class="glossario-grid">
      <p><b>PTS</b>: Pontos</p>
      <p><b>J</b>: Jogos</p>
      <p><b>VIT</b>: Vitórias</p>
      <p><b>DER</b>: Derrotas</p>
      <p><b>STV</b>: Sets Vencidos</p>
      <p><b>3x0</b>: Vitória por 3 sets a 0</p>
      <p><b>3x2</b>: Vitória por 3 sets a 2</p>
      <p><b>2x3</b>: Derrota por 2 sets a 3</p>
      <p><b>0x3</b>: Derrota por 0 sets a 3</p>
      <p><b>W.O.</b>: Vitória por W.O.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabelaClassificacao',
  props: {
    times: { type: Array, default: () => [] },
    modalidade: { type: String, default: 'futebol' },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: 'Nenhum placar encontrado para este campeonato.' },
    showGlossary: { type: Boolean, default: true }
  },
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
    }
  },
  methods: {
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
  overflow-x: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.placar {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
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
  .placar {
    min-width: 100%;
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

  .nome-time {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .placar.grupo-futebol th:nth-child(7),
  .placar.grupo-futebol td:nth-child(7),
  .placar.grupo-futebol th:nth-child(8),
  .placar.grupo-futebol td:nth-child(8) {
    display: none;
  }

  .placar.grupo-volei th:nth-child(7),
  .placar.grupo-volei td:nth-child(7),
  .placar.grupo-volei th:nth-child(8),
  .placar.grupo-volei td:nth-child(8),
  .placar.grupo-volei th:nth-child(9),
  .placar.grupo-volei td:nth-child(9),
  .placar.grupo-volei th:nth-child(10),
  .placar.grupo-volei td:nth-child(10) {
    display: none;
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
