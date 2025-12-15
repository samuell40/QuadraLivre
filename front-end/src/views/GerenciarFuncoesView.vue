<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="header">
        <h1 class="title">Gerenciamento de Funções</h1>

        <div class="botoes">
          <button class="btn-add" @click="abrirModalAdicionar">
            Adicionar Função
          </button>
        </div>
      </div>

      <div class="search-container">
        <select v-model="modalidadeSelecionada" @change="carregarFuncoes" class="search-input">
          <option disabled value="">Selecione a modalidade</option>
          <option v-for="m in modalidades" :key="m.id" :value="m.id">
            {{ m.nome }}
          </option>
        </select>
      </div>

      <div v-if="!modalidadeSelecionada" class="mensagem-selecione">
        Selecione uma modalidade para exibir a listagem das funções!
      </div>

      <div v-else-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="funcoes.length === 0" class="mensagem-placar">
          Nenhuma função encontrada para esta modalidade.
        </div>

        <div v-else class="lista-modalidades">
          <div class="card" v-for="f in funcoes" :key="f.id">
            <div class="card-conteudo">
              <div class="info">
                <h2>{{ formatarNome(f.nome) }}</h2>
                <p>{{ f._count.jogadores }} jogador(es) vinculado(s)</p>
              </div>
            </div>

            <button class="btn-detalhar" @click="removerFuncao(f.id, modalidadeSelecionada)">
              Remover
            </button>
          </div>
        </div>
      </div>

      <AdicionarFuncaoModal :aberto="modalAdd" :modalidade-id="modalidadeSelecionada" @fechar="modalAdd = false"
        @atualizar="carregarFuncoes" />
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import AdicionarFuncaoModal from '@/components/modals/times/AdicionarFuncao.vue'
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  name: 'GerenciarFuncoesView',

  components: { SideBar, AdicionarFuncaoModal },

  data() {
    return {
      modalidades: [],
      modalidadeSelecionada: "",
      funcoes: [],
      isLoading: true,
      modalAdd: false,
    }
  },

  mounted() {
    this.carregarModalidades()
  },

  methods: {
    formatarNome(nome) {
      return nome
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ");
    },

    abrirModalAdicionar() {
      this.modalAdd = true;
    },

    async carregarModalidades() {
      this.isLoading = true;
      try {
        const { data } = await api.get("/listar/modalidade");
        this.modalidades = data;
      } catch (err) {
        console.error("Erro ao carregar modalidades:", err);
      } finally {
        this.isLoading = false;
      }
    },

    async carregarFuncoes() {
      if (!this.modalidadeSelecionada) {
        this.funcoes = [];
        return;
      }

      this.isLoading = true;
      try {
        const res = await api.get(`/listar/funcoes`, {
          params: { modalidadeId: this.modalidadeSelecionada }
        });
        this.funcoes = res.data;
      } catch (err) {
        console.error("Erro ao carregar funções:", err);
        this.funcoes = [];
      } finally {
        this.isLoading = false;
      }
    },

    async removerFuncao(id, modalidadeId) {
      const confirmacao = await Swal.fire({
        title: "Tem certeza?",
        text: "Essa ação removerá a função permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover",
        cancelButtonText: "Cancelar",
      });

      if (!confirmacao.isConfirmed) return;

      try {
        await api.delete('/remover/funcao', {
          data: {
            id: id,
            modalidadeId: modalidadeId,
          },
        });

        Swal.fire("Removida!", "A função foi removida com sucesso.", "success");

        this.carregarFuncoes();
      } catch (err) {
        Swal.fire("Erro", err.response?.data?.message, "error");
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

.mensagem-selecione {
  text-align: center;
  margin-top: 80px;
  font-size: 20px;
  font-weight: bold;
  color: #3B82F6;
}

.contador {
  font-size: 0.85rem;
  color: #3B82F6;
  margin-left: 5px;
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