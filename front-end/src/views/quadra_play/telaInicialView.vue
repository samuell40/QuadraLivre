<template>
  <div class="layout">
    <NavBarQuadra />

    <div class="conteudo">
      <!-- HEADER: título + sidebar -->
      <div class="header-campeonatos">
        <h2 class="title">Campeonatos</h2>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loader">
        Carregando campeonatos...
      </div>

      <!-- Sem dados -->
      <p v-else-if="campeonatos.length === 0">
        Nenhum campeonato encontrado.
      </p>

      <!-- Lista -->
      <div v-else class="lista-campeonatos">
        <div
          v-for="campeonato in campeonatos"
          :key="campeonato.id"
          class="card-campeonato"
        >
          <h3>{{ campeonato.nome }}</h3>
          <p>Ano: {{ campeonato.ano }}</p>
          <p v-if="campeonato.modalidade">
            Modalidade: {{ campeonato.modalidade.nome }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBarQuadra from '@/components/quadraplay/NavBarQuadra.vue'
import api from '@/axios'

export default {
  name: 'CampeonatosView',

  components: {
    NavBarQuadra
  },

  data() {
    return {
      campeonatos: [],
      isLoading: false,
      modalidadeSelecionada: null,
      anoSelecionado: new Date().getFullYear()
    }
  },

  methods: {
    async carregarCampeonatos() {
      if (!this.modalidadeSelecionada) {
        this.campeonatos = []
        return
      }

      this.isLoading = true

      try {
        const { data } = await api.get(
          `/listar/${this.modalidadeSelecionada}`,
          {
            params: {
              ano: this.anoSelecionado
            }
          }
        )

        this.campeonatos = data
      } catch (err) {
        console.error('Erro ao carregar campeonatos:', err)
      } finally {
        this.isLoading = false
      }
    }
  },

  mounted() {
    // EXEMPLO TEMPORÁRIO
    this.modalidadeSelecionada = 1
    this.carregarCampeonatos()
  },

  watch: {
    modalidadeSelecionada() {
      this.carregarCampeonatos()
    },
    anoSelecionado() {
      this.carregarCampeonatos()
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
  padding: 32px 75px;
  background-color: #f2f2f2;
  margin-top: 60px;
}

.lista-campeonatos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card-campeonato {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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


</style>