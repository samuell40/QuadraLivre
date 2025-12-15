<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="header">
        <h1 class="title">Gerenciar Modalidades</h1>

        <div class="botoes">
          <button class="btn-add" @click="abrirModalAdicionar">
            Adicionar Modalidade
          </button>
        </div>
      </div>

      <div class="search-container">
        <input type="text" v-model="pesquisa" placeholder="Pesquisar modalidade..." class="search-input" />
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="modalidadesFiltradas.length === 0" class="mensagem-placar">
          Nenhuma modalidade encontrada.
        </div>

        <div v-else class="lista-modalidades">
          <div class="card" v-for="mod in modalidadesFiltradas" :key="mod.id">
            <div class="card-conteudo">
              <div class="info">
                <h2>{{ formatarNome(mod.nome) }}</h2>
                <p>{{ mod.totalTimes }} time(s) cadastrados</p>
                <p>{{ mod.totalQuadras }} quadra(s) associadas</p>
              </div>
            </div>

            <div class="acoes">
              <button class="btn-detalhar" @click="abrirModalDetalhar(mod)">
                Detalhar
              </button>

              <button class="btn-remover" @click="removerModalidade(mod.id)">
                Remover
              </button>
            </div>
          </div>
        </div>
      </div>
      <AdicionarModalidadeModal :aberto="modalAdd" @fechar="modalAdd = false" @atualizar="carregarModalidades" />

      <DetalharModalidadeModal :aberto="modalDetalhar" :modalidade="modalidadeSelecionada"
        @fechar="modalDetalhar = false" />

    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import AdicionarModalidadeModal from '@/components/modals/modalidades/AdicionarModalidadeModal.vue'
import DetalharModalidadeModal from '@/components/modals/modalidades/DetalharModalidadeModal.vue'
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  name: 'GerenciarModalidadesView',

  components: { SideBar, AdicionarModalidadeModal, DetalharModalidadeModal },

  data() {
    return {
      modalidades: [],
      isLoading: true,
      pesquisa: "",
      modalAdd: false,
      modalidadeSelecionada: null,
      modalDetalhar: false
    }
  },

  computed: {
    modalidadesFiltradas() {
      if (!this.pesquisa.trim()) return this.modalidades;

      return this.modalidades.filter(mod =>
        mod.nome.toLowerCase().includes(this.pesquisa.toLowerCase())
      );
    }
  },

  mounted() {
    this.carregarModalidades()
  },

  methods: {
    formatarNome(nome) {
      return nome
        .split(' ')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ');
    },

    abrirModalDetalhar(mod) {
      this.modalidadeSelecionada = mod
      this.modalDetalhar = true
    },

    async carregarModalidades() {
      this.isLoading = true
      try {
        const { data } = await api.get('/listar/modalidade')
        this.modalidades = data
      } catch (err) {
        console.error("Erro ao carregar modalidades:", err)
      } finally {
        this.isLoading = false
      }
    },

    abrirGerenciarModalidade(mod) {
      this.modalidadeSelecionada = mod
      console.log("Modalidade selecionada:", mod)
    },

    abrirModalAdicionar() {
      this.modalAdd = true
    },

    async removerModalidade(id) {
      const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Essa ação removerá a modalidade permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar'
      });

      if (!confirmacao.isConfirmed) {
        return;
      }

      try {
        await api.delete(`/modalidade/${id}`);
        Swal.fire('Removida!', 'A modalidade foi removida com sucesso.', 'success');
        this.carregarModalidades();

      } catch (error) {
        Swal.fire(
          'Erro',
          error.response?.data?.erro,
          'error'
        );
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
  padding: 5px 0;       /* 👈 igual ao exemplo */
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