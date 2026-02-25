<template>
  <div class="layout">
    <NavBarQuadras />

    <div class="main">
      <SidebarQuadra @sidebar-toggle="sidebarCollapsed = $event" />

      <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
        <div class="header-campeonatos">
          <h2 class="title">Campeonatos</h2>
          <button v-if="!isMesario" class="btn-add" @click="abrirModalAdicionarCampeonato">
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

            <div class="status-badge" :class="classeStatus(campeonato.status)"
              @click.stop="!isMesario && abrirModalStatus(campeonato)">
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
import AdicionarCampeonatoModal from '@/components/quadraplay/Campeonatos/AdicionarCampeonatoModal.vue';
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
      usuarioLogado: null,
      campeonatos: [],
      campeonatosMesario: [],
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

  computed: {
    isMesario() {
      return Number(this.usuarioLogado?.permissaoId) === 4
    }
  },

  mounted() {
    try {
      this.usuarioLogado = JSON.parse(localStorage.getItem('usuario') || 'null')
    } catch (error) {
      this.usuarioLogado = null
    }

    if (this.isMesario) {
      this.carregarCampeonatosMesario()
      return
    }

    this.carregarModalidades()
  },

  watch: {
    modalidadeSelecionada() {
      if (this.isMesario) {
        this.aplicarFiltroCampeonatosMesario()
        return
      }
      this.carregarCampeonatos()
    },
    anoSelecionado() {
      if (this.isMesario) return
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
      if (this.isMesario) {
        this.aplicarFiltroCampeonatosMesario()
      }
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
      if (this.isMesario) {
        this.aplicarFiltroCampeonatosMesario()
        return
      }

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

    aplicarFiltroCampeonatosMesario() {
      const base = Array.isArray(this.campeonatosMesario) ? this.campeonatosMesario : []

      if (!this.modalidadeSelecionada) {
        this.campeonatos = [...base]
        return
      }

      this.campeonatos = base.filter(c => Number(c?.modalidadeId) === Number(this.modalidadeSelecionada))
    },

    async carregarCampeonatosMesario() {
      this.isLoading = true
      try {
        const { data } = await api.get('/campeonatos/mesario/andamento')
        this.campeonatosMesario = Array.isArray(data) ? data : []

        const modalidadesMap = new Map()
        this.campeonatosMesario.forEach(campeonato => {
          const modalidadeId = Number(campeonato?.modalidadeId)
          const modalidadeNome = campeonato?.modalidade?.nome
          if (modalidadeId && modalidadeNome && !modalidadesMap.has(modalidadeId)) {
            modalidadesMap.set(modalidadeId, { id: modalidadeId, nome: modalidadeNome })
          }
        })

        this.modalidadesDisponiveis = Array.from(modalidadesMap.values())
        this.aplicarFiltroCampeonatosMesario()
      } catch (err) {
        console.error('Erro ao carregar campeonatos do mesario:', err)
        this.campeonatosMesario = []
        this.campeonatos = []
        this.modalidadesDisponiveis = []
      } finally {
        this.isLoading = false
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
  background: #f8fafc;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.conteudo.collapsed {
  margin-left: 70px;
}

.conteudo.collapsed .quadras-grid {
  grid-template-columns: repeat(2, 1fr);
}

.header-campeonatos {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.title {
  margin: 0;
  color:  #3b82f6;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.btn-add {
  padding: 12px 18px;
  background-color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  font-weight: 700;
  letter-spacing: -0.1px;
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.22);
}

.btn-add:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(59, 130, 246, 0.28);
}

.abas-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 16px;
  margin-bottom: 22px;
}

.aba {
  text-align: center;
  padding: 10px 10px;
  border-radius: 999px;
  cursor: pointer;
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  letter-spacing: -0.1px;
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.aba:hover {
  background: #eaf2ff;
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(15, 23, 42, 0.06);
}

.aba.ativa {
  background: #3b82f6;
  color: #fff;
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 14px 24px rgba(59, 130, 246, 0.22);
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
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14);
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: #0b1220;
}

.card-quadra:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.22);
}

.imagem-quadra {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
  filter: saturate(1.05) contrast(1.02);
}

.card-quadra:hover .imagem-quadra {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  inset: auto 0 0 0;
  width: 100%;
  padding: 18px 18px 16px;
  background: linear-gradient(to top,
      rgba(15, 23, 42, 0.92),
      rgba(15, 23, 42, 0.40),
      rgba(15, 23, 42, 0.10));
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campeonato {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.4px;
  line-height: 1.12;
}

.modalidade {
  margin: 0 0 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.92;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.86);
}

.btn-acessar {
  background-color: #3b82f6;
  color: #fff;
  border: none;
  padding: 12px 12px;
  cursor: pointer;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  width: 100%;
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.25);
}

.btn-acessar:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(59, 130, 246, 0.32);
}

.status-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: #fff;
  z-index: 5;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(8px);
  transition: transform 0.15s ease;
}

.status-badge.em-andamento {
  background: rgba(34, 197, 94, 0.88);
}

.status-badge.finalizado {
  background: rgba(239, 68, 68, 0.90);
}

.status-badge.cancelado {
  background: rgba(100, 116, 139, 0.90);
}

.status-badge:hover {
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 26px 28px;
  border-radius: 16px;
  width: min(560px, 92vw);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
  color: #0f172a;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.titulo-modal-status {
  color: #2563eb;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.2px;
  margin: 0;
}

.btn-close-x {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(37, 99, 235, 0.55);
  border-radius: 999px;
  background: #fff;
  color: #2563eb;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex: 0 0 auto;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.btn-close-x:hover {
  background: rgba(37, 99, 235, 0.08);
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.9);
}

.label-status {
  display: block;
  margin-bottom: 10px;
  color: #334155;
  font-weight: 700;
}

.select-status-modal {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  font-size: 15px;
  color: #0f172a;
  background-color: #fff;
  cursor: pointer;
  transition: 0.2s;
  margin-bottom: 18px;
}

.select-status-modal:hover {
  border-color: rgba(59, 130, 246, 0.65);
}

.select-status-modal:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn-save {
  flex: 1;
  padding: 12px 0;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 15px;
  font-weight: 900;
  background-color: #3b82f6;
  transition: background 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.btn-save:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-cancel {
  flex: 1;
  padding: 12px 0;
  border-radius: 999px;
  border: 1px solid rgba(37, 99, 235, 0.35);
  background: transparent;
  color: #2563eb;
  font-size: 15px;
  font-weight: 900;
}

.loader {
  margin-top: 20px;
  color: #334155;
  font-weight: 700;
}


@media (max-width: 768px) {
  .conteudo {
    margin-left: 0 !important;
    margin-top: 70px;
    padding: 18px;
  }

  .header-campeonatos {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .btn-add {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
  }

  .abas-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .quadras-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-quadra {
    height: 230px;
    border-radius: 16px;
  }

  .campeonato {
    font-size: 22px;
  }
}
</style>
