<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="header">
        <h1 class="title">Placar</h1>
      </div>

      <div class="dropdowns-row">
        <!-- Modalidade -->
        <div class="dropdown-container">
          <label class="dropdown-label">Modalidade</label>
          <select v-model="modalidadeSelecionada" @change="carregarCampeonatos" class="dropdown">
            <option disabled value="null">Selecione</option>
            <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade">
              {{ modalidade.nome }}
            </option>
          </select>
        </div>

        <!-- Campeonato -->
        <div class="dropdown-container">
          <label class="dropdown-label">Campeonato</label>
          <select v-model="campeonatoSelecionado" @change="carregarPlacar" class="dropdown"
            :disabled="!campeonatosDisponiveis.length">
            <option disabled value="null">Selecione</option>
            <option v-for="camp in campeonatosDisponiveis" :key="camp.id" :value="camp">
              {{ camp.nome }}
            </option>
          </select>
        </div>
      </div>

      <!-- Área do placar -->
      <div class="placar-table">
        <!-- Loader -->
        <div v-if="modalidadeSelecionada && timesPlacar === null" class="loader-container-centralizado">
          <div class="loader"></div>
        </div>

        <div v-else-if="Array.isArray(timesPlacar) && timesPlacar.length === 0" class="sem-dados-centralizado">
          Nenhum placar encontrado para essa modalidade.
        </div>

        <!-- Futebol / Futsal -->
        <table v-else-if="
          ['futebol', 'futebol de areia', 'futsal']
            .includes(modalidadeNormalizada)
        " class="placar">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>GM</th>
              <th>GS</th>
              <th>SG</th>
              <th>E</th>
              <th>VIT</th>
              <th>DER</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}</td>
              <td class="time-info">
                <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />
                {{ time.time?.nome }}
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.golsPro }}</td>
              <td>{{ time.golsSofridos }}</td>
              <td>{{ time.saldoDeGols }}</td>
              <td>{{ time.empates }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Vôlei / Futevôlei -->
        <table v-else-if="
          ['volei', 'volei de areia', 'futevolei']
            .includes(modalidadeNormalizada)
        " class="placar">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>VIT</th>
              <th>DER</th>
              <th>STV</th>
              <th>3x0</th>
              <th>3x1</th>
              <th>1x3</th>
              <th>0x3</th>
              <th>W.O.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}º</td>
              <td class="time-info">
                <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />
                {{ time.time?.nome }}
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
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import axios from '@/axios'

export default {
  name: 'VisualizarPlacarView',
  components: { SideBar },

  data() {
    return {
      modalidadesDisponiveis: [],
      campeonatosDisponiveis: [],
      modalidadeSelecionada: null,
      campeonatoSelecionado: null,
      timesPlacar: []
    }
  },

  computed: {
    // 🔥 NORMALIZA NOME DA MODALIDADE (remove acentos)
    modalidadeNormalizada() {
      if (!this.modalidadeSelecionada?.nome) return ''

      return this.modalidadeSelecionada.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    }
  },

  mounted() {
    this.inicializarPlacar()
  },

  methods: {
    async inicializarPlacar() {
      const { data } = await axios.get('/listar/modalidade')
      this.modalidadesDisponiveis = data

      const futebol = this.modalidadesDisponiveis.find(mod =>
        ['futebol', 'futebol de areia']
          .includes(
            mod.nome
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          )
      )

      if (futebol) {
        this.modalidadeSelecionada = futebol
        await this.carregarCampeonatos()

        if (this.campeonatosDisponiveis.length) {
          this.campeonatoSelecionado =
            this.campeonatosDisponiveis[
            this.campeonatosDisponiveis.length - 1
            ]

          await this.carregarPlacar()
        }
      }
    },

    async carregarCampeonatos() {
      if (!this.modalidadeSelecionada?.id) return

      this.campeonatosDisponiveis = []
      this.campeonatoSelecionado = null
      this.timesPlacar = []

      const { data } = await axios.get(
        `/listar/${this.modalidadeSelecionada.id}`
      )

      this.campeonatosDisponiveis = data
    },

    async carregarPlacar() {
      if (!this.campeonatoSelecionado?.id) return

      this.timesPlacar = []

      const { data } = await axios.get(
        `/placar/campeonato/${this.campeonatoSelecionado.id}`
      )

      this.timesPlacar = Array.isArray(data.placares)
        ? data.placares
        : []
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  font-weight: bold;
}


.placar-page {
  border-radius: 12px;
  width: 100%;
  min-height: 600px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dropdown-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.dropdown-label {
  font-weight: 600;
  font-size: 15px;
}

.dropdown {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  background-color: #fff;
}

.dropdowns-row {
  display: flex;
  gap: 24px;
  width: 100%;
}

.placar-table {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.placar {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
}

.placar thead th {
  background-color: #3b82f6;
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

.btn-ocultar {
  background-color: #7E7E7E;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.loader-container-centralizado,
.sem-dados-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  font-size: 18px;
  color: #555;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .dropdown {
    width: 100%;
  }
}
</style>