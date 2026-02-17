<template>
  <div class="layout">
    <NavBarQuadras />
    <SidebarCampeonato @sidebar-toggle="sidebarCollapsed = $event" />

    <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
      <div class="header">
        <h1 class="title">Classificação {{ campeonato?.nome }}</h1>
        <button class="btn-add" @click="abrirConfiguracoes">
          Configurações
        </button>

      </div>

      <!-- PLACAR -->
      <div class="placar-wrapper" v-if="campeonato">
        <div v-if="fases.length" class="filtros-topo">
          <div class="filtro-item">
            <label class="filtro-titulo" for="fase-select">Selecione a Fase:</label>
            <select id="fase-select" v-model="faseSelecionada" @change="carregarPlacarPorFase">
              <option disabled value="">-- Escolha a Fase --</option>
              <option v-for="fase in fases" :key="fase.id" :value="fase.id">{{ fase.nome }}</option>
            </select>
          </div>
        </div>
        <div class="placar-table">
          <div v-if="timesPlacar === null" class="loader-container-centralizado">
            <div class="loader"></div>
          </div>

          <div v-else-if="Array.isArray(timesPlacar) && timesPlacar.length === 0" class="sem-dados-centralizado">
            Nenhum placar encontrado para esta fase.
          </div>

          <!-- ===== FUTEBOL / FUTSAL ===== -->
          <table v-else-if="['futebol', 'futebol de areia', 'futsal'].includes(modalidadeNormalizada)" class="placar">
            <thead>
              <tr>
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
                <td class="time-info">
                  <span class="posicao">{{ index + 1 }}º</span>
                  <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />
                  <span class="nome-time">{{ time.time?.nome }}</span>
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

          <!-- ===== VÔLEI ===== -->
          <table v-else-if="['volei', 'volei de areia', 'futevolei'].includes(modalidadeNormalizada)" class="placar">
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
                <th>W.O</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(time, index) in timesPlacar" :key="time.id">
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
      </div>
      <ModalConfiguracoesPlacar v-if="campeonato" v-model="modalConfiguracoes" :campeonato="campeonato"
        @faseCriada="carregarFases" />

    </div>
  </div>
</template>

<script>
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue'
import SidebarCampeonato from '@/components/quadraplay/SidebarCampeonato.vue'
import { carregarCampeonato } from '@/utils/persistirCampeonato'
import ModalConfiguracoesPlacar from '@/components/quadraplay/ModalConfiguracoesPlacar.vue'
import api from '@/axios'

export default {
  name: 'ClassificacaoView',
  components: { SidebarCampeonato, NavBarQuadras, ModalConfiguracoesPlacar },

  data() {
    return {
      sidebarCollapsed: false,
      campeonato: null,
      fases: [],
      faseSelecionada: '',
      timesPlacar: null,
      isLoading: true,
      modalConfiguracoes: false
    }
  },

  computed: {
    modalidadeNormalizada() {
      return this.campeonato?.modalidade?.nome?.toLowerCase()?.trim()
    }
  },

  async mounted() {
    try {
      this.campeonato = await carregarCampeonato(this.$route)
      if (this.campeonato?.id) {
        await this.carregarFases()
      } else {
        this.timesPlacar = []
      }
    } catch (err) {
      console.error('Erro ao carregar classificação:', err)
      this.timesPlacar = []
      this.campeonato = null
    } finally {
      this.isLoading = false
    }
  },

  methods: {
    abrirConfiguracoes() {
      this.modalConfiguracoes = true
    },

    async carregarFases() {
      if (!this.campeonato?.id) return

      try {
        const res = await api.get(`/placar/fase/${this.campeonato.id}`)
        this.fases = res.data.map(f => ({
          id: f.faseId,
          nome: f.nomeFase
        }))

        if (this.fases.length) {
          this.faseSelecionada = this.fases[0].id
          this.carregarPlacarPorFase()
        }
      } catch (err) {
        console.error('Erro ao carregar fases:', err)
      }
    },

    async carregarPlacarPorFase() {
      if (!this.faseSelecionada) return

      this.timesPlacar = []

      try {
        const { data } = await api.get(`/placar/fase/${this.campeonato.id}`,
          {
            params: {
              faseId: this.faseSelecionada
            }
          }
        )

        if (data?.placares) {
          this.timesPlacar = data.placares
          return
        }

        if (Array.isArray(data)) {
          const fase = data.find(f => f.faseId == this.faseSelecionada)
          this.timesPlacar = fase?.placares || []
          return
        }

        this.timesPlacar = []
      } catch (err) {
        console.error('Erro ao carregar placar da fase:', err)
        this.timesPlacar = []
      }
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-top: 70px;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.conteudo.collapsed {
  margin-left: 70px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  font-weight: bold;
}

.btn-add {
  padding: 10px 18px;
  background-color: #3b82f6;
  border: none;
  border-radius: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.btn-add:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-add:active {
  transform: translateY(0);
}

.card-quadra {
  position: relative;
  width: 100%;
  height: 360px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.imagem-quadra {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  padding: 16px;
}

.campeonato-nome {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  margin-top: 140px;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 90px;
  height: 90px;
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

.filtros-topo {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filtros-topo select {
  flex: 1;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #111827;
  background-color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.filtros-topo select:hover {
  border-color: #3b82f6;
}

.filtros-topo select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.filtro-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.filtro-titulo {
  font-size: 20px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
}

.placar-wrapper {
  margin-top: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 16px;
}

.titulo-secao {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.placar-table {
  margin-top: 20px;
  width: 100%;
  overflow-x: auto;
  border-radius: 10px;
}

.placar {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  font-size: 14px;
}

.placar thead th {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  padding: 14px 12px;
  text-align: left;
  white-space: nowrap;
}

.placar tbody tr {
  background-color: white;
  transition: background-color 0.2s ease;
}

.placar tbody tr:hover {
  background-color: #f3f4f6;
}

.placar tbody td {
  color: #374151;
  padding: 12px;
  font-size: 14px;
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
  min-width: 28px;
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

.glossario-placar {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f5f6fa;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
}

.glossario-placar strong {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
}

.glossario-placar ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 4px 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.glossario-placar li b {
  color: #152147;
}

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
    padding: 16px;
  }

  .conteudo.collapsed {
    margin-left: 0;
  }

  .title {
    font-size: 22px;
    margin-bottom: 0;
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .btn-add {
    width: auto;
    align-self: flex-end;
    padding: 10px 14px;
    font-size: 0;
  }

  .btn-add::after {
    content: "⚙";
    font-size: 18px;
  }

  .placar-wrapper {
    margin-top: 20px;
    padding: 12px;
  }

  .placar-table {
    width: 100%;
    overflow-x: auto;
    max-height: 55vh;
  }

  .placar {
    width: 100%;
    min-width: 0;
  }

  .placar thead th {
    font-size: 13px;
    padding: 8px 6px;
  }

  .placar tbody td {
    font-size: 12px;
    padding: 6px 8px;
  }

  .time-info {
    gap: 6px;
  }

  .posicao {
    font-size: 12px;
    min-width: 20px;
    text-align: center;
  }

  .time-image {
    width: 28px;
    height: 28px;
  }

  .nome-time {
    font-size: 13px;
  }

  .glossario-placar {
    font-size: 11px;
    padding: 10px;
  }

  .glossario-placar ul {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }
}
</style>