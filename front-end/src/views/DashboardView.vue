<template>
  <div class="layout">
    <SideBar />
    <div class="conteudo">
      <h1 class="title">Dashboard</h1>
      <NavBarUse />

      <section class="section_totalAgendamentos">
        <div class="card_contagem">
          <h3>Usuarios</h3>
          <p>{{ totalUsuarios }}</p>
        </div>
        <div class="card_contagem">
          <h3>Agendamentos</h3>
          <p>{{ totalAgendamentos }}</p>
        </div>
        <div class="card_contagem">
          <h3>Pendentes</h3>
          <p>{{ totalPendentes }}</p>
        </div>
        <div class="card_contagem">
          <h3>Confirmados</h3>
          <p>{{ totalConfirmados }}</p>
        </div>
        <div class="card_contagem">
          <h3>Recusados</h3>
          <p>{{ totalCancelados }}</p>
        </div>
      </section>

      <!-- Gráficos -->
      <section class="section_graficos_top">
        <div class="chart-container">
          <canvas id="agendamentosModalidadeChart"></canvas>
        </div>
        <div class="chart-container">
          <canvas id="agendamentosTipoChart"></canvas>
        </div>
      </section>

      <section class="section_graficos_bottom">
        <div v-if="loading" class="loader-container-centralizado">
          <div class="loader"></div>
        </div>
        <div class="chart-container-full">
          <canvas id="agendamentosMesChart"></canvas>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import { Chart, registerables } from 'chart.js'
import { nextTick } from 'vue'
import api from '@/axios'

Chart.register(...registerables)

export default {
  name: 'DashboardView',
  components: { SideBar, NavBarUse },
  data() {
    return {
      agendamentos: [],
      totalAgendamentos: 0,
      totalPendentes: 0,
      totalConfirmados: 0,
      totalCancelados: 0,
      totalUsuarios: 0,
      totalTimes: 0,
      totalModalidades: 0,
      agendamentosMesChart: null,
      agendamentosModalidadeChart: null,
      agendamentosTipoChart: null,
      loading: false
    }
  },
  methods: {
    async carregarUsuarios() {
      try {
        const res = await api.get('/usuarios')
        this.totalUsuarios = Array.isArray(res.data) ? res.data.length : 0
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      }
    },

    async carregarTimes() {
      try {
        const res = await api.get('/times')
        this.totalTimes = Array.isArray(res.data) ? res.data.length : 0
      } catch (error) {
        console.error('Erro ao carregar times:', error)
      }
    },

    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade')
        this.totalModalidades = Array.isArray(res.data) ? res.data.length : 0
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error)
      }
    },

    async carregarAgendamentos() {
      try {
        this.loading = true
        const usuario = JSON.parse(localStorage.getItem("usuario") || "null")
        let data = []

        if (usuario?.permissaoId === 1) {
          const res = await api.get('/agendamentos/todos')
          data = res.data
        } else if (usuario?.permissaoId === 2) {
          if (!usuario.quadraId) {
            console.warn("Usuário com permissão 2 não possui quadra vinculada.")
            return
          }
          const res = await api.get(`/agendamentos/quadra/${usuario.quadraId}`)
          data = res.data
        } else {
          console.warn("Permissão não autorizada para acessar agendamentos.")
          return
        }

        const anoAtual = new Date().getFullYear()
        this.agendamentos = data.filter(a => {
          if (a.ano) return a.ano === anoAtual
          if (a.data) return new Date(a.data).getFullYear() === anoAtual
          return false
        })

        this.totalAgendamentos = this.agendamentos.length
        this.totalPendentes = this.agendamentos.filter(a => a.status === 'Pendente').length
        this.totalConfirmados = this.agendamentos.filter(a => a.status === 'Confirmado').length
        this.totalCancelados = this.agendamentos.filter(a => a.status === 'Negado').length

        await nextTick()
        this.renderAgendamentosModalidadeChart()
        this.renderAgendamentosTipoChart()
        this.renderAgendamentosMesChart()
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error)
      } finally {
        this.loading = false
      }
    },

    renderAgendamentosModalidadeChart() {
      const canvas = document.getElementById('agendamentosModalidadeChart')
      if (this.agendamentosModalidadeChart) this.agendamentosModalidadeChart.destroy()
      const ctx = canvas.getContext('2d')

      const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

      const nomesModalidades = this.agendamentos.map(a => {
        let nome = 'Não definido'
        if (a.modalidade?.nome) nome = a.modalidade.nome
        else if (a.quadra?.modalidades?.length > 0) nome = a.quadra.modalidades[0].nome
        return capitalize(nome)
      })

      const modalidades = [...new Set(nomesModalidades)]

      const quantidade = modalidades.map(m => nomesModalidades.filter(n => n === m).length)

      this.agendamentosModalidadeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: modalidades,
          datasets: [{
            label: 'Agendamentos por Modalidade',
            data: quantidade,
            backgroundColor: '#3B82F6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      })
    },
    renderAgendamentosTipoChart() {
      const canvas = document.getElementById('agendamentosTipoChart')
      if (this.agendamentosTipoChart) this.agendamentosTipoChart.destroy()
      const ctx = canvas.getContext('2d')

      const tipos = ['PARTIDA', 'TREINO', 'EVENTO', 'OUTRO', 'CAMPEONATO']
      const quantidade = tipos.map(t => this.agendamentos.filter(a => a.tipo === t).length)

      this.agendamentosTipoChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: tipos,
          datasets: [{ data: quantidade, backgroundColor: ['#152147', '#1E3A8A', '#3B82F6', '#D9D9D9', '#F7F9FC'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      })
    },

    renderAgendamentosMesChart() {
      const canvas = document.getElementById('agendamentosMesChart')
      if (this.agendamentosMesChart) this.agendamentosMesChart.destroy()
      const ctx = canvas.getContext('2d')

      const mesesNomes = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]

      const mesesAgendamentos = this.agendamentos.map(a => a.mes)

      if (mesesAgendamentos.length === 0) {
        this.agendamentosMesChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: mesesNomes,
            datasets: [{ label: 'Agendamentos por Mês', data: new Array(12).fill(0), backgroundColor: '#1E3A8A' }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }
        })
        return
      }

      const mesInicial = Math.min(...mesesAgendamentos) - 1
      const mesesFiltrados = mesesNomes.slice(mesInicial)

      const quantidade = mesesFiltrados.map((_, idx) =>
        this.agendamentos.filter(a => a.mes === (mesInicial + idx + 1)).length
      )

      this.agendamentosMesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: mesesFiltrados,
          datasets: [{ label: 'Agendamentos por Mês', data: quantidade, backgroundColor: '#1E3A8A' }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      })
    }
  },
  
  mounted() {
    this.carregarAgendamentos()
    this.carregarUsuarios()
    this.carregarTimes()
    this.carregarModalidades()
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.SideBar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
  overflow-x: hidden;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 12px;
}

.section_totalAgendamentos {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.card_contagem {
  background: white;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 12px;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card_contagem h3 {
  font-size: 1.2em;
  margin-bottom: 10px;
  color: #1E3A8A;
  font-weight: bold;
}

.card_contagem p {
  font-size: 32px;
  font-weight: bold;
  color: #3b82f6;
}

.section_graficos_top {
  display: flex;
  gap: 20px;
  margin-top: 40px;
}

.section_graficos_bottom {
  position: relative;
  margin-top: 40px;
}

.chart-container {
  flex: 1;
  min-width: 0;
  height: 350px;
}

.chart-container-full {
  width: 100%;
  height: 350px;
}

.loader-container-centralizado {
  position: absolute;
  top: -70%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
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
  .SideBar {
    position: fixed;
    width: 250px;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    background: #fff;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
  }

  .SideBar.open {
    transform: translateX(0);
  }

  .conteudo {
    margin-left: 0;
    padding: 20px;
  }

  .section_totalAgendamentos {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .section_graficos_top {
    flex-direction: column;
    gap: 20px;
  }

  .chart-container,
  .chart-container-full {
    height: 300px;
    width: 100%;
  }

  .card_contagem p {
    font-size: 24px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
