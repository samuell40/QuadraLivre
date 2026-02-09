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
            @click="abrirCampeonato(campeonato.id)">

            <div class="status-badge" :class="campeonato.status === 'EM_ANDAMENTO' ? 'em-andamento' : 'finalizado'">
              {{ campeonato.status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Finalizado' }}
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
      mostrarModal: false
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
}

.status-badge.em-andamento {
  background: #3B82F6;
}

.status-badge.finalizado {
  background: #f73434;
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
}
</style>