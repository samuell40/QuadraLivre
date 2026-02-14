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
            <select id="fase-select" v-model="faseSelecionada" @change="onFaseChange">
              <option disabled value="">Selecione a Fase</option>
              <option v-for="fase in fases" :key="fase.id" :value="fase.id">
                {{ fase.nome }}
              </option>
            </select>
          </div>

          <div class="filtro-item">
            <label for="rodada-select" class="filtro-titulo">Rodada</label>
            <select id="rodada-select" v-model="rodadaSelecionada" @change="filtrarPartidasPorRodada">
              <option disabled value="">Selecione a Rodada</option>
              <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
                {{ rodada.nome }}
              </option>
            </select>
          </div>
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
              <div class="status-topo status-editavel" :class="classeStatusTexto(partida)"
                @click="editarStatus(partida)">
                <!-- TEXTO -->
                <template v-if="partidaEditandoStatus !== partida.id">
                  <span class="texto-status">
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
                  </span>

                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                    class="bi bi-pencil-square icone-status" viewBox="0 0 16 16">
                    <path
                      d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293z" />
                    <path
                      d="M13.752 4.396l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.815z" />
                  </svg>
                </template>
              </div>

              <div class="nome-quadra">
                {{ partida.quadra?.nome }}
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

              <div class="usuario-criador">
                Criado por:
                <strong>{{ partida.usuarioCriador?.nome }}</strong>
              </div>

              <button class="btn-acessar" @click="acessarPartida(partida.id)">
                {{ partida.status === 'FINALIZADA' ? 'Editar' : 'Acessar' }}
              </button>
            </li>
          </ul>

          <div v-if="todasPartidas.length === 0" class="vazio">
            Nenhuma partida encontrada.
          </div>
        </div>
      </div>
      <div class="add-half-circle" @click="abrirModalTipo">
        <span class="plus">+</span>
      </div>

      <div v-if="mostrarModalStatus" class="modal-overlay" @click.self="fecharModalStatus">
        <div class="modal-content modal-status">
          <h2 class="titulo-modal-status">Alterar status da partida</h2>

          <!-- LABEL -->
          <label class="label-status">Selecione o status</label>

          <select v-model="novoStatus" class="select-status-modal">
            <option v-for="status in statusDisponiveis" :key="status" :value="status">
              {{ status.replace('_', ' ') }}
            </option>
          </select>

          <div class="botoes">
            <button class="btn-save" @click="confirmarAlteracaoStatus">
              Salvar
            </button>
            <button class="btn-cancel" @click="fecharModalStatus">
              Cancelar
            </button>
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
      fases: [],
      rodadas: [],
      faseSelecionada: '',
      rodadaSelecionada: '',
      sidebarCollapsed: false,
      modalidades: [],
      campeonatos: [],
      partidas: [],
      partidasEncerradas: [],
      modalidadeSelecionada: '',
      campeonatoSelecionado: '',
      campeonato: null,
      isLoading: true,
      mostrarModalTipo: false,
      mostrarModalStatus: false,
      statusDisponiveis: [],
      partidaSelecionada: null,
      novoStatus: ''
    }
  },

  mounted() {
    this.carregarCampeonatoSelecionado();
    this.buscarModalidades();
    this.buscarStatusPartida();
  },

  computed: {
    todasPartidas() {
      return [...(this.partidas || []), ...(this.partidasEncerradas || [])];
    }
  },
  methods: {
    abrirModalTipo() {
      this.mostrarModalTipo = true;
      this.abrirMenuAdd = false;
    },
    cancelarModalTipo() {
      this.mostrarModalTipo = false;
    },
    selecionarTipo(tipo) {
      this.mostrarModalTipo = false;

      if (tipo === 'partida') {
        this.criarFase();
      } else if (tipo === 'rodada') {
        this.adicionarRodada();
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

          await this.carregarFases();
          this.filtrarPartidasPorRodada();
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
      this.fases = [];
      this.rodadas = [];
      this.faseSelecionada = '';
      this.rodadaSelecionada = '';

      if (!this.campeonatoSelecionado) return;

      await this.carregarFases();
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
    },

    async acessarPartida(partidaId) {
      try {
        if (!this.campeonato) {
          throw new Error('Campeonato não encontrado')
        }

        localStorage.setItem(
          'campeonatoSelecionado',
          JSON.stringify(this.campeonato)
        )

        this.$router.push({
          path: '/partida',
          query: { partidaId }
        })

      } catch (error) {
        console.error(error)
        Swal.fire(
          'Erro',
          'Não foi possível acessar a partida.',
          'error'
        )
      }
    },

    async carregarFases() {
      if (!this.campeonatoSelecionado) return;

      try {
        const response = await api.get(`/partidas/${this.campeonatoSelecionado}/fases`);
        this.fases = response.data;

        if (this.fases.length > 0) {
          this.faseSelecionada = this.fases[0].id;
          const faseSelecionadaObj = this.fases.find(f => f.id === this.faseSelecionada);
          this.rodadas = faseSelecionadaObj.rodadas || [];
          this.rodadaSelecionada = this.rodadas.length ? this.rodadas[0].id : '';

          this.filtrarPartidasPorRodada();
        }
      } catch (error) {
        console.error('Erro ao buscar fases:', error);
      }
    },
    onFaseChange() {
      const fase = this.fases.find(f => f.id === this.faseSelecionada);
      if (!fase) return;
      this.rodadas = fase.rodadas || [];
      this.rodadaSelecionada = this.rodadas.length ? this.rodadas[0].id : '';

      this.filtrarPartidasPorRodada();
    },

    filtrarPartidasPorRodada() {
      const fase = this.fases.find(f => f.id === this.faseSelecionada);
      if (!fase) {
        this.partidas = [];
        return;
      }
      const rodada = fase.rodadas.find(r => r.id === this.rodadaSelecionada);
      this.partidas = rodada ? rodada.partidas : [];
    },

    async buscarStatusPartida() {
      try {
        const response = await api.get('/partidas/status');
        this.statusDisponiveis = response.data;
      } catch (error) {
        console.error('Erro ao buscar status:', error);
      }
    },

    editarStatus(partida) {
      this.partidaSelecionada = partida;
      this.novoStatus = partida.status;
      this.mostrarModalStatus = true;
    },
    fecharModalStatus() {
      this.mostrarModalStatus = false;
      this.partidaSelecionada = null;
    },

    async confirmarAlteracaoStatus() {
      try {
        await api.put(`/partidas/${this.partidaSelecionada.id}/status`, {
          status: this.novoStatus
        });

        this.partidaSelecionada.status = this.novoStatus;
        this.fecharModalStatus();

        Swal.fire({
          icon: 'success',
          title: 'Status atualizado',
          timer: 1200,
          showConfirmButton: false
        });
      } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Não foi possível alterar o status.', 'error');
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
  position: relative;
  border-radius: 12px;
  overflow: visible;
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

.status-editavel {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.status-editavel:hover {
  opacity: 0.8;
}

.icone-status {
  font-size: 12px;
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

.usuario-criador {
  font-size: 13px;
  color: #6b7280;
}

.placar-centro {
  font-size: 30px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
}

.placar-centro span {
  font-size: 18px;
  margin: 0 6px;
  font-weight: 600;
}

.time-nome {
  font-weight: 700;
  font-size: 19px;
}

.nome-quadra {
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  color: #3b82f6;
  margin: 8px 0 12px 0;
}

.add-half-circle {
  position: absolute;
  top: 44%;
  left: 58%;
  transform: translate(-50%, -50%);
  width: 42px;
  height: 42px;
  background-color: #3b82f6;
  border-bottom-left-radius: 50%;
  border-bottom-right-radius: 50%;
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

.modal-status {
  max-width: 900px;
}

.titulo-modal-status {
  color: #3b82f6;
  font-size: 28px;
}

.select-status-modal {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #111827;
  background-color: #fff;
  cursor: pointer;
  transition: 0.2s;
  margin-bottom: 20px;
}

.select-status-modal:hover {
  border-color: #3b82f6;
}

.select-status-modal:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
    padding: 16px;
  }

  .lista-partidas {
    grid-template-columns: 1fr;
  }

  .conteudo-partida {
    gap: 16px;
  }

  .card-partida {
    padding: 16px;
  }

  .time-foto {
    width: 28px;
    height: 28px;
  }

  .placar-centro {
    font-size: 20px;
  }

  .placar-centro span {
    font-size: 18px;
    margin: 0 6px;
    font-weight: 600;
  }

  .time-nome {
    font-size: 20px;
  }

  .titulo-secao {
    font-size: 18px;
  }

  .mensagem-orientacao {
    font-size: 14px;
    padding: 16px;
  }

  .add-half-circle {
    position: absolute;
    top: 42%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 42px;
    height: 42px;
    background-color: #3b82f6;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
  }

}
</style>