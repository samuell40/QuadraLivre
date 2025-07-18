<template>
  <div class="placar">
    <!-- Título exibido somente quando os dados forem carregados -->
    <h4 v-if="!isLoading && times.length" class="tit_campeonato">Campeonato Futebol de Futsal</h4>

    <!-- Loader enquanto carrega -->
    <div class="loader" v-if="isLoading"></div>

    <!-- Tabela -->
    <table v-else>
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
        <tr v-for="time in times" :key="time.time">
          <td>{{ time.posicao }}º</td>
          <td class="time-info">
            <img :src="time.foto" alt="Foto do time" class="time-image" />
            <span>{{ time.time }}</span>
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
</template>

<script>
export default {
  name: 'PlacarFutsalHome',
  props: {
    times: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.tit_campeonato {
  font-size: 20px;
  color: #7E7E7E;
  font-weight: bold;
  margin-bottom: 10px;
}

.placar {
  padding: 30px;
  margin: 0 auto;
  max-width: 1340px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.placar table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  width: 100%;
}

.placar thead th {
  background-color: #1e3a8a;
  color: white;
  font-weight: bold;
  padding: 14px 12px;
  font-size: 16px;
  text-align: left;
}

.placar tbody tr {
  background-color: white;
  transition: background-color 0.2s;
}

.placar tbody tr:hover {
  background-color: #f3f4f6;
}

.placar tbody td {
  color: #4b5563;
  padding: 12px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.placar tbody tr:last-child td {
  border-bottom: none;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
}
</style>
