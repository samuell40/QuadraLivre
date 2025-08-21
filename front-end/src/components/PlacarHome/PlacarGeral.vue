<template>
  <div class="placar-container">
    <div v-if="isLoading" class="loader"></div>

    <div v-else>
      <div v-if="['futebol', 'futebol de areia', 'futsal'].includes(modalidade)">
        <h3 class="placar-tipo">Campeonato {{ capitalizarModalidade(modalidade) }}</h3>
        <div class="placar-wrapper">
          <table class="placar">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Time</th>
                <th>Pts</th>
                <th>PJ</th>
                <th>VIT</th>
                <th>E</th>
                <th>DER</th>
                <th>SG</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="time in times" :key="time.id">
                <td>{{ time.posicao }}º</td>
                <td class="time-info">
                  <img v-if="time.time?.foto" :src="time.time.foto" alt="Foto do time" class="time-image" />
                  {{ time.time?.nome }}
                </td>
                <td>{{ time.pontuacao }}</td>
                <td>{{ time.jogos }}</td>
                <td>{{ time.vitorias }}</td>
                <td>{{ time.empates }}</td>
                <td>{{ time.derrotas }}</td>
                <td>{{ time.saldoDeGols }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vôlei -->
      <div v-else-if="['volei', 'volei de areia', 'voleibol', 'futevolei'].includes(modalidade)">
        <h3 class="placar-tipo">Campeonato {{ capitalizarModalidade(modalidade) }}</h3>
        <div class="placar-wrapper">
          <table class="placar">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Time</th>
                <th>Pts</th>
                <th>PJ</th>
                <th>VIT</th>
                <th>DER</th>
                <th>STG</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="time in times" :key="time.id">
                <td>{{ time.posicao }}º</td>
                <td class="time-info">
                  <img v-if="time.time?.foto" :src="time.time.foto" alt="Foto do time" class="time-image" />
                  {{ time.time?.nome }}
                </td>
                <td>{{ time.pontuacao }}</td>
                <td>{{ time.jogos }}</td>
                <td>{{ time.vitorias }}</td>
                <td>{{ time.derrotas }}</td>
                <td>{{ time.setsVencidos }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="times.length === 0" class="sem-dados">
        Nenhum placar disponível.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlacarGeral",
  props: {
    times: { type: Array, default: () => [] },
    isLoading: { type: Boolean, default: false },
    modalidade: { type: String, required: true }
  },
  methods: {
    capitalizarModalidade(nome) {
      return nome.split(' ').map(palavra => {
        if (palavra.toLowerCase() === 'volei') return 'Vôlei';
        if (palavra.toLowerCase() === 'futevolei') return 'Futevôlei';
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      }).join(' ')
    }
  }
}
</script>

<style scoped>
.placar-container {
  position: relative;
  width: 100%;
}

.placar-tipo {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  padding: 10px 0;
  color: #7E7E7E;
  background: white;
  position: sticky;
  top: 0; /* fixa no topo */
  z-index: 20;
   margin-left: 8%; 

}

.placar-wrapper {
  width: 100%;
  overflow-x: auto;   /* scroll horizontal */
  margin: 0 auto;
  padding: 20px 110px;
  box-sizing: border-box;
}

.placar {
  width: 100%;
  min-width: 600px; /* 🔥 garante largura mínima para scroll */
  border-collapse: collapse;
  table-layout: fixed;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.placar thead th {
  background-color: #1e3a8a;
  color: white;
  font-weight: bold;
  padding: 12px 8px;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
}

.placar tbody td {
  color: #4b5563;
  padding: 10px 8px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
  word-wrap: break-word;
}

.placar tbody tr:hover {
  background-color: #f3f4f6;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
  text-align: left;
}

.time-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
  flex-shrink: 0;
}

/* 🔥 Responsivo */
@media (max-width: 768px) {
  .placar-wrapper {
    padding: 20px;
  }

  .placar {
    font-size: 16px;
    min-width: 700px;
  }

  .placar thead th,
  .placar tbody td {
    font-size: 16px;
    padding: 12px 6px;
  }

  .time-image {
    width: 28px;
    height: 28px;
  }
}
</style>