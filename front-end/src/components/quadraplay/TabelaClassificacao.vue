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
      <p><b>GM</b>: Gols Marcados</p>
      <p><b>GS</b>: Gols Sofridos</p>
      <p><b>SG</b>: Saldo de Gols</p>
      <p><b>%</b>: Aproveitamento</p>
      <p><b>E</b>: Empates</p>
      <p><b>VIT</b>: Vitórias</p>
      <p><b>DER</b>: Derrotas</p>
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
