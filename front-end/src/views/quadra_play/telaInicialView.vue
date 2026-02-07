<template>
  <div class="layout">
    <NavBarQuadras />

    <div class="main">
      <SidebarQuadra />

      <div class="conteudo">
        <div class="header-campeonatos">
          <h2 class="title">Campeonatos</h2>

          <div class="abas-container">
            <div class="aba" :class="{ ativa: modalidadeSelecionada === null }" @click="selecionarModalidade(null)">
              Todas
            </div>

            <div class="aba" v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id"
              :class="{ ativa: modalidadeSelecionada === modalidade.id }" @click="selecionarModalidade(modalidade.id)">
              {{ modalidade.nome }}
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="loader">
          Carregando campeonatos...
        </div>

        <p v-else-if="campeonatos.length === 0">
          Nenhum campeonato encontrado.
        </p>

        <div v-else class="quadras-grid">
          <div v-for="campeonato in campeonatos" :key="campeonato.id" class="card-quadra">
            <div class="card-content">
              <h3>{{ campeonato.nome }}</h3>
              <p>{{ campeonato.modalidade?.nome }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue'
import SidebarQuadra from '@/components/quadraplay/SidebarQuadra.vue'
import api from '@/axios'

export default {
  name: 'CampeonatosView',

  components: {
    NavBarQuadras,
    SidebarQuadra
  },

  data() {
    return {
      campeonatos: [],
      isLoading: false,
      modalidadesDisponiveis: [],
      modalidadeSelecionada: null,
      anoSelecionado: new Date().getFullYear()
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
    selecionarModalidade(id) {
      this.modalidadeSelecionada = id
    },
    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade')
        this.modalidadesDisponiveis = res.data || []

        // começa em TODAS (null)
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
  padding: 32px 75px;
  margin-top: 70px;
  margin-left: 250px;
}

.quadras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.card-quadra {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  display: flex;
  align-items: flex-end;
}

.card-content {
  width: 100%;
  padding: 16px;
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.65),
      rgba(0, 0, 0, 0.1));
  color: #fff;
}

.card-content h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.card-content p {
  font-size: 14px;
  margin: 2px 0;
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
</style>