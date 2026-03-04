<template>
  <div class="layout">
    <NavBarQuadras />

    <div class="main">
      <SidebarQuadra @sidebar-toggle="sidebarCollapsed = $event" />

      <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
        <div class="painel-topo">
          <div class="header-campeonatos">
            <div class="header-copy">
              <h2 class="title">Campeonatos</h2>
              <a class="header-subtitle">Filtre por modalidade para acompanhar e gerenciar os campeonatos cadastrados.</a>
            </div>
            <button v-if="!isMesario" class="btn-add" @click="abrirModalAdicionarCampeonato">
              <span class="btn-add-label-desktop">Adicionar Campeonato</span>
              <span class="btn-add-label-mobile">Adicionar</span>
            </button>
          </div>
          <div class="abas-container">
            <div class="aba" :class="{ ativa: modalidadeSelecionada === null }" @click="selecionarModalidade(null)">
              Todas
            </div>

            <div class="aba" v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id"
              :class="{ ativa: modalidadeSelecionada === modalidade.id }" @click="selecionarModalidade(modalidade.id)">
              {{ formatarNomeModalidade(modalidade.nome) }}
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="feedback-card feedback-card-loading">
          <div class="loader" aria-hidden="true"></div>
          <span class="loader-copy">Carregando campeonatos...</span>
        </div>

        <a v-else-if="campeonatos.length === 0" class="feedback-card feedback-ematy">
          Nenhum campeonato encontrado.
        </a>

        <div v-else class="quadras-grid">
          <div class="card-quadra" v-for="campeonato in campeonatos" :key="campeonato.id"
            @click="abrirCampeonato(campeonato)">

            <div class="status-badge" :class="classeStatus(campeonato.status)"
              @click.stop="!isMesario && abrirModalStatus(campeonato)">
              {{ rotuloStatus(campeonato.status) }}
            </div>

            <img :src="obterFotoCard(campeonato.foto)" alt="Foto do campeonato" class="imagem-quadra">

            <div class="overlay">
              <h3 class="campeonato">{{ campeonato.nome }}</h3>
              <a class="modalidade">{{ campeonato.modalidade?.nome }}</a>
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
import { obterFotoCardCampeonato } from '@/utils/campeonatoImagem'

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
    formatarNomeModalidade(nome) {
      return String(nome || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
        .join(' ')
    },
    obterFotoCard(foto) {
      return obterFotoCardCampeonato(foto)
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
        console.error('Erro ao carregar campeonatos do mesário:', err)
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
a {
  text-decoration: none;
  color: inherit;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 24px 28px 32px;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.painel-topo {
  margin-bottom: 22px;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.header-campeonatos {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.header-copy {
  min-width: 0;
}

.title {
  margin: 0;
  color: #2563eb;
  font-size: 40px;
  line-height: 0.98;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.header-subtitle {
  margin: 10px 0 0;
  max-width: 760px;
  color: #475569;
  font-size: 17px;
  line-height: 1.6;
}

.btn-add {
  min-height: 52px;
  padding: 0 18px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border: 1px solid rgba(59, 130, 246, 0.32);
  border-radius: 18px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.02em;
  box-shadow: 0 14px 26px rgba(59, 130, 246, 0.22);
}

.btn-add-label-mobile {
  display: none;
}

.btn-add:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(59, 130, 246, 0.28);
}

.abas-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 0;
}

.aba {
  text-align: center;
  min-height: 54px;
  padding: 10px 14px;
  border-radius: 20px;
  cursor: pointer;
  background: rgba(248, 250, 252, 0.92);
  color: #334155;
  font-weight: 700;
  font-size: 15px;
  line-height: 1.3;
  letter-spacing: -0.02em;
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  border: 1px solid rgba(148, 163, 184, 0.26);
}

.aba:hover {
  background: #f8fbff;
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(59, 130, 246, 0.10);
}

.aba.ativa {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.16), rgba(96, 165, 250, 0.14));
  color: #1d4ed8;
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 14px 24px rgba(59, 130, 246, 0.12);
}

.quadras-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.card-quadra {
  position: relative;
  width: 100%;
  height: 248px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #0b1220;
}

.card-quadra:hover {
  transform: translateY(-4px);
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
  padding: 16px 16px 16px;
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
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.12;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.modalidade {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  opacity: 0.92;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.86);
}

.btn-acessar {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  border: none;
  min-height: 46px;
  padding: 0 12px;
  cursor: pointer;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 800;
  width: 100%;
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.25);
}

.btn-acessar:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(59, 130, 246, 0.32);
}

.status-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
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
  width: 42px;
  height: 42px;
  border: 4px solid rgba(59, 130, 246, 0.18);
  border-top-color: #2563eb;
  border-radius: 999px;
  animation: spin 0.9s linear infinite;
}

.loader-copy {
  color: #64748b;
  font-weight: 700;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.feedback-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  color: #64748b;
  font-weight: 700;
}

.feedback-card-loading {
  flex-direction: column;
  gap: 14px;
}

.feedback-ematy {
  margin: 0;
}


@media (max-width: 768px) {
  .conteudo {
    margin-left: 0 !important;
    margin-top: 34px;
    padding: 14px;
  }

  .painel-topo {
    padding: 14px;
    border-radius: 24px;
    margin-bottom: 16px;
  }

  .header-campeonatos {
    margin-top: 0;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: nowrap;
    margin-bottom: 12px;
  }

  .title {
    flex: 1;
    min-width: 0;
    font-size: 26px;
    line-height: 1.02;
  }

  .header-subtitle {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.55;
  }

  .btn-add {
    width: auto;
    flex-shrink: 0;
    min-height: 40px;
    padding: 0 12px;
    font-size: 12px;
    white-space: nowrap;
    border-radius: 14px;
  }

  .btn-add-label-desktop {
    display: none;
  }

  .btn-add-label-mobile {
    display: inline;
  }

  .abas-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .aba {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 6px 4px;
    border-radius: 12px;
    font-size: 11px;
    line-height: 1.2;
  }

  .quadras-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .card-quadra {
    height: 216px;
    border-radius: 20px;
  }

  .campeonato {
    font-size: 20px;
  }

  .overlay {
    padding: 14px;
  }

  .btn-acessar {
    min-height: 42px;
    border-radius: 14px;
    font-size: 13px;
    letter-spacing: 0.12em;
  }

  .status-badge {
    top: 16px;
    right: 16px;
    padding: 7px 11px;
    font-size: 10px;
  }

  .modalidade {
    margin: 0 0 8px;
    font-size: 11px;
    letter-spacing: 0.16em;
  }

  .feedback-card {
    min-height: 120px;
    border-radius: 20px;
  }
}

</style>





