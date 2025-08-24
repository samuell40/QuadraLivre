<template>
  <div class="dashboard">
    <div class="d-flex">
      <SideBar />
      <div class="container">
        <section class="section_totalAgendamentos">
          <div class="card_contagem">
            <h3>Total de Agendamentos</h3>
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
        <section class="section_graficos_top">
          <div class="chart-container">
            <canvas id="agendamentosModalidadeChart"></canvas>
          </div>
          <div class="chart-container">
            <canvas id="agendamentosTipoChart"></canvas>
          </div>
        </section>

        <section class="section_graficos_bottom">
          <div class="chart-container-full">
            <canvas id="agendamentosMesChart"></canvas>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import { Chart, registerables } from 'chart.js';
import { nextTick } from 'vue';
Chart.register(...registerables);

export default {
  name: 'DashboardView',
  components: { SideBar },
  data() {
    return {
      agendamentos: [],
      totalAgendamentos: 0,
      totalPendentes: 0,
      totalConfirmados: 0,
      totalCancelados: 0,
      agendamentosMesChart: null,
      agendamentosModalidadeChart: null,
      agendamentosTipoChart: null
    };
  },
  methods: {
    async carregarAgendamentos() {
      try {
        const agendamentos = [
          { status: 'Pendente', modalidade: 'Futebol', tipo: 'PARTIDA', mes: 'Janeiro' },
          { status: 'Cancelado', modalidade: 'Futebol', tipo: 'EVENTO', mes: 'Fevereiro' },
          { status: 'Confirmado', modalidade: 'Futebol de areia', tipo: 'OUTRO', mes: 'Fevereiro' },
          { status: 'Confirmado', modalidade: 'Futebol de areia', tipo: 'OUTRO', mes: 'Fevereiro' },
          { status: 'Confirmado', modalidade: 'Futebol de areia', tipo: 'OUTRO', mes: 'Fevereiro' },
          { status: 'Confirmado', modalidade: 'Futebol de areia', tipo: 'OUTRO', mes: 'Fevereiro' },
          { status: 'Pendente', modalidade: 'Vôlei', tipo: 'PARTIDA', mes: 'Março' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'TREINO', mes: 'Março' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'TREINO', mes: 'Março' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'TREINO', mes: 'Março' },
          { status: 'Confirmado', modalidade: 'Futsal', tipo: 'EVENTO', mes: 'Abril' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'TREINO', mes: 'Abril' },
          { status: 'Confirmado', modalidade: 'Futevolei', tipo: 'TREINO', mes: 'Abril' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'TREINO', mes: 'Maio' },
          { status: 'Confirmado', modalidade: 'Futevolei', tipo: 'TREINO', mes: 'Maio' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'EVENTO', mes: 'Maio' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'EVENTO', mes: 'Maio' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'EVENTO', mes: 'Maio' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'PARTIDA', mes: 'Maio' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'PARTIDA', mes: 'Junho' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'PARTIDA', mes: 'Junho' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'CAMPEONATO', mes: 'Junho' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'OUTROS', mes: 'Junho' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'OUTROS', mes: 'Julho' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'TREINO', mes: 'Julho' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'TREINO', mes: 'Agosto' },
          { status: 'Confirmado', modalidade: 'Futebol', tipo: 'TREINO', mes: 'Agosto' },
          { status: 'Pendente', modalidade: 'Vôlei de areia', tipo: 'PARTIDA', mes: 'Agosto' },
        ];

        this.agendamentos = agendamentos;
        this.totalAgendamentos = agendamentos.length;
        this.totalPendentes = agendamentos.filter(a => a.status === 'Pendente').length;
        this.totalConfirmados = agendamentos.filter(a => a.status === 'Confirmado').length;
        this.totalCancelados = agendamentos.filter(a => a.status === 'Cancelado').length;

        await nextTick();
        this.renderAgendamentosModalidadeChart();
        this.renderAgendamentosTipoChart();
        this.renderAgendamentosMesChart();
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      }
    },

    // Gráfico de barras por modalidade
    renderAgendamentosModalidadeChart() {
      const canvas = document.getElementById('agendamentosModalidadeChart');
      if (this.agendamentosModalidadeChart) this.agendamentosModalidadeChart.destroy();
      const ctx = canvas.getContext('2d');

      const modalidades = [...new Set(this.agendamentos.map(a => a.modalidade))];
      const quantidade = modalidades.map(m => this.agendamentos.filter(a => a.modalidade === m).length);

      this.agendamentosModalidadeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: modalidades,
          datasets: [{
            label: 'Agendamentos por Modalidade',
            data: quantidade,
            backgroundColor: ['#3B82F6']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } }
      });
    },

    // Gráfico de pizza por tipo
    renderAgendamentosTipoChart() {
      const canvas = document.getElementById('agendamentosTipoChart');
      if (this.agendamentosTipoChart) this.agendamentosTipoChart.destroy();
      const ctx = canvas.getContext('2d');

      const tipos = ['PARTIDA', 'TREINO', 'EVENTO', 'OUTRO'];
      const quantidade = tipos.map(t => this.agendamentos.filter(a => a.tipo === t).length);

      this.agendamentosTipoChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: tipos,
          datasets: [{
            label: 'Agendamentos por Tipo',
            data: quantidade,
            backgroundColor: ['#152147', '#1E3A8A', '#3B82F6', '#D9D9D9'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }
      });
    },

    // Gráfico de barras
    renderAgendamentosMesChart() {
      const canvas = document.getElementById('agendamentosMesChart');
      if (this.agendamentosMesChart) this.agendamentosMesChart.destroy();
      const ctx = canvas.getContext('2d');

      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const quantidade = meses.map(mes => this.agendamentos.filter(a => a.mes === mes).length);

      this.agendamentosMesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: meses,
          datasets: [{
            label: 'Agendamentos por Mês',
            data: quantidade,
            backgroundColor: '#1E3A8A'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      });
    }
  },

  mounted() {
    this.carregarAgendamentos();
  }
};
</script>

<style scoped>
.dashboard {
  margin-left: 250px;
  margin-top: 30px;
  padding: 20px;
  border-radius: 10px;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-bottom: 20px;
}

.section_totalAgendamentos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.card_contagem {
  background: white;
  border-radius: 12px;
  padding: 24px;
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
  margin-top: 40px;
}

.chart-container {
  flex: 1;
  height: 350px;
}

.chart-container-full {
  width: 100%;
  height: 350px;
}

@media (max-width: 768px) {
  .dashboard {
    margin-left: 0;
    padding: 10px;
  }

  .section_totalAgendamentos {
    grid-template-columns: repeat(2, 1fr);
  }

  .card_contagem p {
    font-size: 24px;
  }

  .section_graficos_top {
    flex-direction: column;
  }

  .chart-container,
  .chart-container-full {
    height: 300px;
  }
}
</style>
