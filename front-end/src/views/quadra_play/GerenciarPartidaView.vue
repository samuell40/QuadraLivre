<template>
  <div class="layout">
    <NavBarQuadras />
    <SidebarCampeonato @sidebar-toggle="sidebarCollapsed = $event" />

    <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
      <div class="header">
        <h1 class="title">Gerenciar Partidas</h1>
      </div>

      <div class="filtros-wrapper">
        <div class="filtros-topo">
          <div class="filtro-item">
            <label for="fase-select" class="filtro-titulo">Fase</label>
            <select id="fase-select" v-model="faseSelecionada">
              <option disabled value="">Selecione a Fase</option>
              <option v-for="fase in fases" :key="fase.id" :value="fase.id">
                {{ fase.nome }}
              </option>
            </select>
          </div>

          <div class="filtro-item">
            <label for="rodada-select" class="filtro-titulo">Rodada</label>
            <select id="rodada-select" v-model="rodadaSelecionada">
              <option disabled value="">Selecione a Rodada</option>
              <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
                {{ rodada.nome }}
              </option>
            </select>
          </div>
        </div>
        <!-- Botão meia-lua com + -->
        <div class="add-half-circle" @click="abrirModalTipo">
          <span class="plus">+</span>
        </div>

        <div v-if="mostrarModalTipo" class="modal-overlay" @click.self="cancelarModalTipo">
          <div class="modal-content">
            <h2>Escolha a ação</h2>

            <div class="tipo-campeonato-lista">
              <button class="btn-tipo" @click="selecionarTipo('partida')">Adicionar Partida</button>
              <button class="btn-tipo" @click="selecionarTipo('rodada')">Adicionar Rodada</button>
            </div>

            <div class="botoes">
              <button type="button" class="btn-save" @click="cancelarModalTipo">Cancelar</button>
            </div>
          </div>
        </div>

        <!-- PARTIDAS -->
        <div class="partidas-wrapper">

          <ul class="lista-partidas">
            <li v-for="partida in todasPartidas" :key="partida.id" class="card-partida"
              :class="classeStatusPartida(partida)">
              <div class="status-topo" :class="classeStatusTexto(partida)">
                {{
                  partida.status === 'FINALIZADA'
                    ? 'ENCERRADA'
                    : partida.status === 'EM_ANDAMENTO'
                      ? 'EM ANDAMENTO'
                      : partida.status === 'AGENDADA'
                        ? 'AGUARDANDO'
                        : partida.status === 'CANCELADA'
                          ? 'CANCELADA'
                          : ''
                }}
              </div>

              <div class="conteudo-partida">
                <div class="time lado">
                  <img v-if="partida.timeA?.foto" :src="partida.timeA.foto" class="time-foto" />
                  <span class="time-nome">{{ partida.timeA?.nome }}</span>
                </div>

                <div class="placar-centro">
                  <strong>{{ partida.pontosTimeA ?? 0 }}</strong>
                  <span>x</span>
                  <strong>{{ partida.pontosTimeB ?? 0 }}</strong>
                </div>

                <div class="time lado">
                  <img v-if="partida.timeB?.foto" :src="partida.timeB.foto" class="time-foto" />
                  <span class="time-nome">{{ partida.timeB?.nome }}</span>
                </div>

              </div>

              <div class="nome-quadra">
                Quadra: {{ partida.quadra?.nome }}
              </div>
              <button class="btn-acessar" @click="acessarPartida(partida.id)">
                Acessar
              </button>
            </li>
          </ul>

          <div v-if="todasPartidas.length === 0" class="vazio">
            Nenhuma partida encontrada.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue';
import SidebarCampeonato from '@/components/quadraplay/SidebarCampeonato.vue';
import { carregarCampeonato } from '@/utils/persistirCampeonato';
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
  name: 'GerenciarPartidaView',
  components: { SidebarCampeonato, NavBarQuadras },

  data() {
    return {
      sidebarCollapsed: false,
      modalidades: [],
      campeonatos: [],
      partidas: [],
      partidasEncerradas: [],
      modalidadeSelecionada: '',
      campeonatoSelecionado: '',
      campeonato: null,
      isLoading: true,
      fases: [],
      rodadas: [],
      faseSelecionada: '',
      rodadaSelecionada: '',
      mostrarModalTipo: false,
    }
  },

  mounted() {
    this.carregarCampeonatoSelecionado();
    this.buscarModalidades();
    this.fases = [
      { id: 1, nome: 'Fase 1' },
    ];
    this.rodadas = [
      { id: 1, nome: 'Rodada 1' },
      { id: 2, nome: 'Rodada 2' },
    ];
  },

  computed: {
    todasPartidas() {
      return [...(this.partidas || []), ...(this.partidasEncerradas || [])];
    }
  },
  methods: {
    abrirModalTipo() {
      this.mostrarModalTipo = true;
      this.abrirMenuAdd = false; // fecha o menu suspenso
    },
    cancelarModalTipo() {
      this.mostrarModalTipo = false; // fecha o modal
    },
    // ação quando escolher "Partida" ou "Rodada"
    selecionarTipo(tipo) {
      this.mostrarModalTipo = false;

      if (tipo === 'partida') {
        this.criarFase(); // ou redireciona para a página de criar partida
      } else if (tipo === 'rodada') {
        this.adicionarRodada(); // ou abre o formulário de rodada
      }
    },
    adicionarRodada() {
      this.abrirMenuAdd = false;
      Swal.fire('Adicionar Rodada', 'Aqui você pode adicionar uma nova rodada.', 'info');
    },
    classeStatusPartida(partida) {
      switch (partida.status) {
        case 'FINALIZADA':
          return 'partida-finalizada'
        case 'EM_ANDAMENTO':
          return 'partida-andamento'
        case 'AGENDADA':
          return 'partida-agendada'
        case 'CANCELADA':
          return 'partida-cancelada'
        default:
          return ''
      }
    },
    classeStatusTexto(partida) {
      switch (partida.status) {
        case 'FINALIZADA':
          return 'status-finalizada'
        case 'EM_ANDAMENTO':
          return 'status-andamento'
        case 'AGENDADA':
          return 'status-agendada'
        case 'CANCELADA':
          return 'status-cancelada'
        default:
          return ''
      }
    },

    async carregarCampeonatoSelecionado() {
      try {
        this.campeonato = await carregarCampeonato(this.$route);
        if (this.campeonato?.id) {
          this.modalidadeSelecionada = this.campeonato.modalidade?.id;
          this.campeonatoSelecionado = this.campeonato.id;

          await this.buscarPartidasAtivas();
          await this.buscarPartidasEncerradas();
        }
      } catch (err) {
        console.error('Erro ao carregar campeonato:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async buscarModalidades() {
      try {
        const response = await api.get('/listar/modalidade');
        this.modalidades = response.data;
      } catch (error) {
        console.error('Erro ao buscar modalidades:', error);
      }
    },

    async buscarCampeonatos() {
      this.campeonatos = [];
      this.campeonatoSelecionado = '';
      this.partidas = [];

      if (!this.modalidadeSelecionada) return;

      try {
        const response = await api.get(`/listar/${this.modalidadeSelecionada}`);
        this.campeonatos = response.data;
      } catch (error) {
        console.error('Erro ao buscar campeonatos:', error);
      }
    },

    onModalidadeChange() {
      this.buscarCampeonatos();
    },

    async onCampeonatoChange() {
      this.partidas = [];
      this.partidasEncerradas = [];

      if (!this.campeonatoSelecionado) return;

      await this.buscarPartidasAtivas();
      await this.buscarPartidasEncerradas();
    },

    async buscarPartidasAtivas() {
      if (!this.modalidadeSelecionada || !this.campeonatoSelecionado) return;

      try {
        const response = await api.get(
          `/partidas/ativas/${this.modalidadeSelecionada}/${this.campeonatoSelecionado}`
        );
        this.partidas = response.data;
      } catch (error) {
        console.error('Erro ao buscar partidas ativas:', error);
      }
    },

    async buscarPartidasEncerradas() {
      if (!this.modalidadeSelecionada || !this.campeonatoSelecionado) return;

      try {
        const response = await api.get(
          `/partidas/encerradas/${this.modalidadeSelecionada}/${this.campeonatoSelecionado}`
        );
        this.partidasEncerradas = response.data;
      } catch (error) {
        console.error('Erro ao buscar partidas encerradas:', error);
      }
    },

    async excluirPartida(partidaId) {
      const resultado = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Essa ação não poderá ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
      });

      if (!resultado.isConfirmed) return;

      try {
        await api.delete(`/partidas/${partidaId}`);
        await Swal.fire({
          title: 'Excluída!',
          text: 'A partida foi excluída com sucesso.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        await this.buscarPartidasAtivas();
        await this.buscarPartidasEncerradas();
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Erro',
          text: 'Não foi possível excluir a partida.',
          icon: 'error'
        });
      }
    },

    async retomarPartida(partidaId) {
      try {
        const response = await api.get(`/partidas/${partidaId}/retornar`);
        const partida = response.data;
        this.$router.push({
          path: '/partida',
          query: { partidaId: partida.id }
        });
      } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Não foi possível retomar essa partida.', 'error');
      }
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
  margin-top: 70px;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.conteudo.collapsed {
  margin-left: 70px;
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
}

.criarpartidas {
  background-color: #3b82f6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.filtros-wrapper {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #3b82f6;
  padding: 12px;
  background-color: #fff;
}

.filtros-topo {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
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

.partidas-wrapper {
  margin-top: 64px;
}

.titulo-secao {
  font-size: 20px;
  color: #3b82f6;
  font-weight: bold;
  margin-bottom: 12px;
}

.lista-partidas {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.card-partida {
  border: 1.9px solid #3b82f6;
  border-radius: 12px;
  padding: 35px;
  background: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.card-partida:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.status-topo {
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 6px;
}

.status-finalizada {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.12);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.status-andamento {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.status-agendada {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.status-cancelada {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.conteudo-partida {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}

.time.lado {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.time-foto {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b82f6;
}

.placar-centro {
  font-size: 20px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
}

.time-nome {
  font-weight: 500;
}

.nome-quadra {
  text-align: left;
  /* Alinha o texto à esquerda */
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  margin-left: 12px;
  /* Ajusta a distância da borda esquerda */
}

.add-half-circle {
  position: absolute;
  top: 44%;
  /* centraliza verticalmente */
  right: 40%;
  /* ajusta a distância da borda */
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: #3b82f6;
  border-top-left-radius: 0;
  /* reta para cima */
  border-top-right-radius: 0;
  /* reta para cima */
  border-bottom-left-radius: 50%;
  /* curva para baixo */
  border-bottom-right-radius: 50%;
  /* curva para baixo */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s;
}

.add-half-circle:hover {
  background-color: #2563eb;
}

.add-half-circle .plus {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 900px;
  max-width: 95%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
  font-weight: bold;
}

.tipo-campeonato-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-tipo {
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #3b82f6;
  background-color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.btn-tipo:hover {
  background-color: #3b82f6;
  color: #fff;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
}

.btn-save {
  background-color: #3b82f6;
}

.btn-cancel {
  background-color: #7e7e7e;
}

.btn-acessar {
  width: 100%;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.btn-acessar:hover {
  background-color: #2563eb;
}

.vazio {
  color: #6b7280;
  font-style: italic;
  margin-top: 16px;
  text-align: center;
}

/* Responsivo */
@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
    padding: 16px;
    padding-top: 80px;
  }

  .card-partida {
    padding: 10px;
  }

  .time-foto {
    width: 28px;
    height: 28px;
  }

  .placar-centro {
    font-size: 16px;
  }

  .time-nome {
    font-size: 12px;
  }

  .titulo-secao {
    font-size: 18px;
  }

  .mensagem-orientacao {
    font-size: 14px;
    padding: 16px;
  }
}
</style>