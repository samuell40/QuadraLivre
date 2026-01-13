<template>
  <div class="layout">
    <SideBar />
    <div class="conteudo">
      <h1 class="title">{{ tituloDashboard }}</h1>
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

      <!-- Card Avisos -->
      <section class="section_avisos">
        <div class="card_avisos_container">
          <div class="header_avisos">
            <h3>Mural de Avisos</h3>
            <div class="header_actions">
              <button v-if="avisos.length > 1" @click="exibirTodosAvisos = !exibirTodosAvisos"
                class="btn-padrao btn-ver-mais">
                {{ exibirTodosAvisos ? 'Ver menos' : 'Ver todos (' + avisos.length + ')' }}
              </button>
              <button v-if="podePostar" @click="exibirModalAviso = true" class="btn-padrao btn-novo-aviso">
                + Novo Aviso
              </button>
            </div>
          </div>

          <div v-if="avisos.length === 0" class="sem-avisos">
            Nenhuma atualização de sistema ou manutenção registrada.
          </div>

          <div class="lista_avisos" v-else>
            <div v-for="aviso in avisosExibidos" :key="aviso.id" class="card_aviso_item">
              <div class="aviso_meta">
                <span class="aviso_data">{{ formatarData(aviso.data) }}</span>
                <span class="aviso_autor">Autor: {{ aviso.autor?.nome }}</span>
              </div>
              <h4>{{ aviso.titulo }}</h4>
              <p>{{ aviso.descricao }}</p>
            </div>
          </div>
        </div>
      </section>

      <div v-if="exibirModalAviso" class="modal-overlay">
        <div class="modal-content">
          <h3>Cadastrar Novo Aviso</h3>
          <input v-model="novoAviso.titulo" placeholder="Título do aviso" class="input-estilizado" />
          <textarea v-model="novoAviso.descricao" placeholder="O que você quer avisar?"
            class="input-estilizado"></textarea>
          <div class="modal-actions">
            <button @click="enviarAviso" class="btn-confirmar" :disabled="enviando">
              {{ enviando ? 'Postando...' : 'Postar Aviso' }}
            </button>
            <button @click="exibirModalAviso = false" class="btn-cancelar">Cancelar</button>
          </div>
        </div>
      </div>

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
import Swal from 'sweetalert2'

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
      loading: false,
      avisos: [],
      exibirTodosAvisos: false,
      exibirModalAviso: false,
      enviando: false,
      novoAviso: {
        titulo: '',
        descricao: ''
      }
    }
  },
  computed: {
    podePostar() {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      return usuario?.permissaoId === 1 || usuario?.permissaoId === 2;
    },
    avisosExibidos() {
      if (this.exibirTodosAvisos) return this.avisos;
      return this.avisos.length > 0 ? [this.avisos[0]] : [];
    },
    tituloDashboard() {
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      // Desenvolvedor → só "Dashboard"
      if (usuario?.permissaoId === 1) {
        return 'Dashboard';
      }

      // Administrador → "Dashboard - Nome da Quadra"
      if (usuario?.permissaoId === 2 && usuario?.quadra?.nome) {
        return `Dashboard (${usuario.quadra.nome})`;
      }
      return 'Dashboard';
    }
  },
  mounted() {
    window.scrollTo(0, 0)
    this.carregarAgendamentos()
    this.carregarUsuarios()
    this.carregarTimes()
    this.carregarModalidades()
    this.carregarAvisos()
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

    formatarData(data) {
      return new Date(data).toLocaleDateString('pt-BR');
    },

    async carregarAvisos() {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
        if (!usuario?.quadraId) return;

        const res = await api.get(`/quadras/${usuario.quadraId}/avisos`);
        this.avisos = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro de Conectividade',
          text: 'Não foi possível recuperar o mural de avisos do servidor.',
          confirmButtonColor: '#1E3A8A',
        });
      }
    },

    async enviarAviso() {
      if (!this.novoAviso.titulo || !this.novoAviso.descricao) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos Incompletos',
          text: 'Todos os campos obrigatórios devem ser preenchidos para publicar o aviso.',
          confirmButtonColor: '#1E3A8A',
        });
        return;
      }

      try {
        this.enviando = true;
        const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

        await api.post('/avisos', {
          titulo: this.novoAviso.titulo,
          descricao: this.novoAviso.descricao,
          quadraId: usuario.quadraId,
          autorId: usuario.id
        });

        this.novoAviso = { titulo: '', descricao: '' };
        this.exibirModalAviso = false;
        await this.carregarAvisos();

        Swal.fire({
          icon: 'success',
          title: 'Sucesso',
          text: 'O aviso foi publicado e já está visível para os usuários.',
          confirmButtonColor: '#1E3A8A',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro na Operação',
          text: 'Falha ao registrar o aviso no banco de dados.',
          confirmButtonColor: '#1E3A8A',
        });
      } finally {
        this.enviando = false;
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
  border: 2px solid #3b82f6;
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

/* Avisos */
.section_avisos {
  margin-bottom: 30px;
}

.card_avisos_container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header_avisos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.header_actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-padrao {
  height: 38px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-ver-mais {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-ver-mais:hover {
  background: #3b82f6;
  color: white;
}

.btn-novo-aviso {
  background: #1E3A8A;
  color: white;
  border: 1px solid #1E3A8A;
}

.btn-novo-aviso:hover {
  background: #152c6e;
  opacity: 0.8;
}

.lista_avisos {
  overflow-y: hidden;
}

.sem-avisos {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}

.card_aviso_item {
  background: #f7f9fc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 5px solid #3b82f6;
}

.aviso_meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.card_aviso_item h4 {
  color: #1E3A8A;
  margin: 5px 0;
}

/* Modal de avisos */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.input-estilizado {
  width: 100%;
  margin-bottom: 15px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #4b5563;
}

.input-estilizado:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-confirmar {
  background: #1E3A8A;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancelar {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-confirmar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
