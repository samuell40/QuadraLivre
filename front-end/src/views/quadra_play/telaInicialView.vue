<template>
  <div class="layout">
    <NavBarQuadras />

    <div class="main">
      <SidebarQuadra @sidebar-toggle="sidebarCollapsed = $event" />

      <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
        <div class="header-campeonatos">
          <h2 class="title">Campeonatos</h2>
          <button class="btn-add" @click="abrirModalAdicionarCampeonato">
            Adicionar Campeonato
          </button>
        </div>
        <div class="abas-container">
          <div class="aba" :class="{ ativa: modalidadeSelecionada === null }" @click="selecionarModalidade(null)">
            Todas
          </div>

          <div class="aba" v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id"
            :class="{ ativa: modalidadeSelecionada === modalidade.id }" @click="selecionarModalidade(modalidade.id)">
            {{ modalidade.nome }}
          </div>
        </div>

        <div v-if="isLoading" class="loader">
          Carregando campeonatos...
        </div>

        <p v-else-if="campeonatos.length === 0">
          Nenhum campeonato encontrado.
        </p>

        <div v-else class="quadras-grid">
          <div class="card-quadra" v-for="campeonato in campeonatos" :key="campeonato.id"
            @click="abrirCampeonato(campeonato)">

            <div
              class="status-badge"
              :class="classeStatus(campeonato.status)"
              @click.stop="abrirModalStatus(campeonato)"
            >
              {{ rotuloStatus(campeonato.status) }}
            </div>

            <img :src="campeonato.foto" alt="Foto do campeonato" class="imagem-quadra">

            <div class="overlay">
              <h3 class="campeonato">{{ campeonato.nome }}</h3>
              <p class="modalidade">{{ campeonato.modalidade?.nome }}</p>
              <button class="btn-acessar" @click.stop="abrirCampeonato(campeonato)">Acessar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AdicionarCampeonatoModal :aberto="mostrarModal" @fechar="fecharModalAdicionarCampeonato"
      @atualizar="carregarCampeonatos" />

    <div v-if="mostrarModalStatus" class="modal-overlay" @click.self="fecharModalStatus">
      <div class="modal-content modal-status">
        <div class="modal-header">
          <h2 class="titulo-modal-status">Alterar status do campeonato</h2>
          <button type="button" class="btn-close-x" @click="fecharModalStatus">x</button>
        </div>

        <label class="label-status">Selecione o status</label>

        <select v-model="novoStatusCampeonato" class="select-status-modal">
          <option v-for="status in statusDisponiveisCampeonato" :key="status" :value="status">
            {{ rotuloStatus(status) }}
          </option>
        </select>

        <div class="botoes">
          <button class="btn-save" @click="confirmarAlteracaoStatusCampeonato">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCampeonatoStore } from '@/storecampeonato';
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue'
import SidebarQuadra from '@/components/quadraplay/SidebarQuadra.vue'
import AdicionarCampeonatoModal from '@/components/modals/Campeonatos/AdicionarCampeonatoModal.vue';
import router from '@/router';
import api from '@/axios'

export default {
  name: 'CampeonatosView',

  components: {
    NavBarQuadras,
    SidebarQuadra,
    AdicionarCampeonatoModal
  },

  data() {
    return {
      sidebarCollapsed: false,
      campeonatos: [],
      isLoading: false,
      modalidadesDisponiveis: [],
      modalidadeSelecionada: null,
      anoSelecionado: new Date().getFullYear(),
      mostrarModal: false,
      mostrarModalStatus: false,
      campeonatoSelecionadoStatus: null,
      novoStatusCampeonato: 'EM_ANDAMENTO',
      statusDisponiveisCampeonato: ['EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO']
    }
  },

  mounted() {
    this.carregarModalidades()
  },

  watch: {
    modalidadeSelecionada() {
      this.carregarCampeonatos()
    },
    anoSelecionado() {
      this.carregarCampeonatos()
    }
  },

  methods: {
    abrirCampeonato(campeonato) {
      const store = useCampeonatoStore();
      store.setCampeonato(campeonato);
      router.push({ name: 'Detalhar_Campeonatos', query: { id: campeonato.id } });
    },

    abrirModalAdicionarCampeonato() {
      this.mostrarModal = true;
    },

    fecharModalAdicionarCampeonato() {
      this.mostrarModal = false;
      this.carregarCampeonatos();
    },

    selecionarModalidade(id) {
      this.modalidadeSelecionada = id
    },
    rotuloStatus(status) {
      if (status === 'FINALIZADO') return 'Finalizado'
      if (status === 'CANCELADO') return 'Cancelado'
      return 'Em Andamento'
    },
    classeStatus(status) {
      if (status === 'FINALIZADO') return 'finalizado'
      if (status === 'CANCELADO') return 'cancelado'
      return 'em-andamento'
    },
    abrirModalStatus(campeonato) {
      this.campeonatoSelecionadoStatus = campeonato
      this.novoStatusCampeonato = campeonato?.status || 'EM_ANDAMENTO'
      this.mostrarModalStatus = true
    },
    fecharModalStatus() {
      this.mostrarModalStatus = false
      this.campeonatoSelecionadoStatus = null
      this.novoStatusCampeonato = 'EM_ANDAMENTO'
    },
    async confirmarAlteracaoStatusCampeonato() {
      const campeonato = this.campeonatoSelecionadoStatus
      if (!campeonato?.id) return
      if (!this.novoStatusCampeonato || this.novoStatusCampeonato === campeonato.status) {
        this.fecharModalStatus()
        return
      }
      try {
        await api.put(`/campeonato/${campeonato.id}`, { status: this.novoStatusCampeonato })
        campeonato.status = this.novoStatusCampeonato
        this.fecharModalStatus()
      } catch (err) {
        console.error('Erro ao atualizar status do campeonato:', err)
      }
    },
    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade')
        this.modalidadesDisponiveis = res.data
        this.modalidadeSelecionada = null
        this.carregarCampeonatos()
      } catch (err) {
        console.error('Erro ao carregar modalidades:', err)
      }
    },

    async carregarCampeonatos() {
      this.isLoading = true

      try {
        let res

        if (!this.modalidadeSelecionada) {
          res = await api.get('/todos/campeonatos', {
            params: { ano: this.anoSelecionado }
          })
        }
        else {
          res = await api.get(`/listar/${this.modalidadeSelecionada}`, {
            params: { ano: this.anoSelecionado }
          })
        }

        this.campeonatos = res.data || []
      } catch (err) {
        console.error('Erro ao carregar campeonatos:', err)
        this.campeonatos = []
      } finally {
        this.isLoading = false
      }
    },
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

.conteudo.collapsed .quadras-grid {
  grid-template-columns: repeat(2, 1fr);
}

.quadras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.card-quadra {
  position: relative;
  width: 100%;
  height: 260px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-quadra:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
}

.card-quadra:hover .imagem-quadra {
  transform: scale(1.05);
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(17, 1, 1, 0.336));
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.campeonato {
  font-size: 30px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.modalidade {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
  opacity: 0.9;
  font-weight: 500;
}

.btn-acessar {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  width: 100%;
  transition: all 0.2s;
  text-transform: uppercase;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-acessar:hover {
  background-color: #2563EB;
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
  z-index: 5;
  cursor: pointer;
}

.status-badge.em-andamento {
  background: #3B82F6;
}

.status-badge.finalizado {
  background: #f73434;
}

.status-badge.cancelado {
  background: #6b7280;
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header h2 {
  margin-bottom: 0;
}

.btn-close-x {
  width: 34px;
  height: 34px;
  border: 1px solid #3b82f6;
  border-radius: 999px;
  background: #fff;
  color: #3b82f6;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  flex: 0 0 auto;
}

.modal-status {
  max-width: 900px;
}

.titulo-modal-status {
  color: #3b82f6;
  font-size: 28px;
  margin-bottom: 20px;
}

.label-status {
  display: block;
  margin-bottom: 10px;
  color: #374151;
  font-weight: 600;
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

.loader {
  margin-top: 20px;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  font-weight: bold;
}

.header-campeonatos {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.btn-add {
  padding: 10px 16px;
  background-color: #3b82f6;
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.abas-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 16px;
  margin-bottom: 25px;
}

.aba {
  text-align: center;
  padding: 10px 0;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f1f1f1;
  font-weight: 500;
  color: #333;
  transition: all 0.2s;
  border: none;
}

.aba:hover {
  background-color: #e0e0e0;
}

.aba.ativa {
  background-color: #3b82f6;
  color: white;
}

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0 !important;
    margin-top: 70px;
  }

  .header-campeonatos {
    align-items: flex-start;
    gap: 8px;
  }

  .btn-add {
    padding: 8px 8px;
    font-size: 14px;
  }

  .abas-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .modal-content {
    padding: 18px;
  }

  .titulo-modal-status {
    font-size: 22px;
  }
}
</style>
