<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="header">
        <h1 class="title">Gerenciar Campeonatos</h1>

        <div class="botoes">
          <button class="btn-add" @click="modalAdicionarCampeonato = true">
            Adicionar Campeonato
          </button>
        </div>
      </div>

      <!-- Dropdown de modalidades -->
      <div class="dropdown-container">
        <select v-model="modalidadeSelecionada" @change="carregarCampeonatos">
          <option disabled value="">Selecione uma modalidade</option>
          <option v-for="mod in modalidades" :key="mod.id" :value="mod.id">
            {{ mod.nome }}
          </option>
        </select>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="campeonatos.length === 0" class="mensagem-placar">
          Nenhum campeonato encontrado.
        </div>

        <div v-else class="lista-campeonatos">
          <div class="card" v-for="camp in campeonatos" :key="camp.id">
            <div class="card-conteudo">
              <div class="info">
                <h2>{{ camp.nome }}</h2>
                <p>Quadra: {{ camp.quadra ? camp.quadra.nome : "Não definida" }}</p>
                <p>Status: {{ camp.status }}</p>
                <p>Times Participantes: {{ camp.times.length }}</p>
              </div>
            </div>

            <div class="acoes">
              <button class="btn-detalhar">Detalhar</button>
              <button class="btn-remover">Remover</button>
            </div>
          </div>
        </div>
      </div>
      <AdicionarCampeonatoModal :aberto="modalAdicionarCampeonato" @fechar="modalAdicionarCampeonato = false"
        @atualizar="carregarCampeonatos" />

    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import AdicionarCampeonatoModal from '@/components/modals/Campeonatos/AdicionarCampeonatoModal.vue';
import api from '@/axios'

export default {
  name: 'GerenciarCampeonatosView',

  components: { SideBar, AdicionarCampeonatoModal },

  data() {
    return {
      modalidades: [],
      modalidadeSelecionada: "",
      campeonatos: [],
      isLoading: false,
      modalAdicionarCampeonato: false
    }
  },

  mounted() {
    this.carregarModalidades()
  },

  methods: {
    async carregarModalidades() {
      try {
        const { data } = await api.get('/listar/modalidade');
        this.modalidades = data;
      } catch (err) {
        console.error('Erro ao carregar modalidades:', err);
      }
    },

    async carregarCampeonatos() {
      if (!this.modalidadeSelecionada) {
        this.campeonatos = [];
        return;
      }

      this.isLoading = true;
      try {
        const { data } = await api.get(`/listar/${this.modalidadeSelecionada}`);
        this.campeonatos = data;
      } catch (err) {
        console.error('Erro ao carregar campeonatos:', err);
      } finally {
        this.isLoading = false;
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
  margin-left: 250px;
  transition: margin-left 0.3s ease;
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
  margin-top: 12px;
}

.botoes {
  display: flex;
  gap: 20px;
  align-items: center;
}

.btn-add {
  padding: 10px 16px;
  background-color: #3b82f6;
  border: none;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.search-container {
  margin-bottom: 20px;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 16px;
}

.lista-modalidades {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
  margin-top: 20px;
}

.lista-campeonatos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
  margin-top: 20px;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-conteudo {
  display: flex;
  gap: 20px;
  align-items: center;
}

.foto img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #2563eb;
  object-fit: cover;
}

.info h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.info p {
  margin: 4px 0;
  color: #666;
}

.btn-detalhar {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
}

.acoes {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  width: 100%;
}

.btn-detalhar,
.btn-remover {
  flex: 1;
  padding: 5px 0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.btn-detalhar {
  background-color: #3b82f6;
  color: white;
}

.btn-remover {
  background-color: #7E7E7E;
  color: white;
}

.dropdown-container {
  margin-bottom: 20px;
}

.dropdown-container select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 16px;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  margin-top: 140px;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>